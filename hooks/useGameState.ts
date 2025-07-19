


import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAI } from '../AIProvider.tsx';
import { SaveData, KnownEntities, Status, Quest, GameHistoryEntry, Entity, Memory, CustomRule, QuestObjective, Chronicle, EntityType } from '../types.ts';
import { GoogleGenAI, Type } from "@google/genai";
import { buildRagPrompt } from '../rag.ts';
import { DEFAULT_SYSTEM_INSTRUCTION, AI_WRITING_STYLES, NSFW_INSTRUCTION_MODULE } from '../constants.ts';

const TURN_SUMMARY_INTERVAL = 10;
const CHAPTER_SUMMARY_INTERVAL = 5; // 5 turn summaries = 50 turns
const MEMOIR_SUMMARY_INTERVAL = 4; // 4 chapter summaries = 200 turns

export const useGameState = (initialGameState: SaveData) => {
    const { makeApiCall, isAiReady, apiKeyError } = useAI();

    // All game states are managed here
    const [worldData, setWorldData] = useState(initialGameState.worldData);
    const [storyLog, setStoryLog] = useState(initialGameState.storyLog);
    const [choices, setChoices] = useState(initialGameState.choices);
    const [isLoading, setIsLoading] = useState(initialGameState.gameHistory.length === 0 && isAiReady);
    const [knownEntities, setKnownEntities] = useState<KnownEntities>(initialGameState.knownEntities);
    const [statuses, setStatuses] = useState<Status[]>(initialGameState.statuses);
    const [quests, setQuests] = useState<Quest[]>(initialGameState.quests);
    const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>(initialGameState.gameHistory);
    const [turnCount, setTurnCount] = useState<number>(initialGameState.turnCount);
    const [memories, setMemories] = useState<Memory[]>(initialGameState.memories);
    const [party, setParty] = useState<Entity[]>(initialGameState.party);
    const [customRules, setCustomRules] = useState<CustomRule[]>(initialGameState.customRules);
    const [systemInstruction, setSystemInstruction] = useState<string>(initialGameState.systemInstruction);
    const [totalTokensUsed, setTotalTokensUsed] = useState(initialGameState.totalTokensUsed || 0);
    const [lastCallTokens, setLastCallTokens] = useState(initialGameState.lastCallTokens || 0);
    const [chronicle, setChronicle] = useState<Chronicle>(initialGameState.chronicle);
    const [turnError, setTurnError] = useState<string | null>(null);
    const [lastFailedAction, setLastFailedAction] = useState<string | null>(null);

    const pcName = useMemo(() => Object.values(knownEntities).find(e => e.type === 'pc')?.name, [knownEntities]);
    const isCustomActionLocked = useMemo(() => customRules.some(rule => rule.isActive && rule.content.toUpperCase().includes('KHÓA HÀNH ĐỘNG TÙY Ý')), [customRules]);

    const responseSchema = useMemo(() => ({
        type: Type.OBJECT,
        properties: {
            story: { type: Type.STRING, description: "Phần văn bản tường thuật của câu chuyện, bao gồm các định dạng đặc biệt và các thẻ lệnh ẩn." },
            choices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Một mảng gồm 4-5 lựa chọn cho người chơi." },
        },
        required: ['story', 'choices']
    }), []);

    // --- Core Logic Functions ---

    const parseStoryAndTags = useCallback((storyText: string): string => {
        if (!storyText) return '';
        const tagRegex = /\[([A-Z_]+):\s*([^\]]+)\]/g;

        const parseAttributes = (attrString: string): { [key: string]: any } => {
            const attributes: { [key: string]: any } = {};
            const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
            let match;
            while ((match = attrRegex.exec(attrString)) !== null) {
                const key = match[1];
                let value: string | boolean | number | QuestObjective[] = match[2];
                if ((key === 'isMainQuest' || ['usable', 'equippable', 'consumable', 'learnable'].includes(key)) && typeof value === 'string') {
                    value = value.toLowerCase() === 'true';
                } else if (key === 'objectives' && typeof value === 'string') {
                    value = value.split(';').map(desc => ({ description: desc.trim(), completed: false }));
                } else if ((['uses', 'durability', 'damage', 'amount'].includes(key)) && typeof value === 'string' && !isNaN(Number(value))) {
                    attributes[key] = Number(value);
                    continue;
                }
                attributes[key] = value;
            }
            return attributes;
        };

        const allMatches = Array.from(storyText.matchAll(tagRegex));

        for (const match of allMatches) {
            const tagType = match[1];
            const attributes = parseAttributes(match[2]);
            
            // This huge switch case is complex, but centralizes state updates.
            // Using functional updates to setState ensures we're working with the latest state.
            switch (tagType) {
                 case 'MEMORY_ADD':
                    if (attributes.text) setMemories(prev => [...prev, { text: attributes.text, pinned: false }]);
                    break;
                case 'STATUS_APPLIED_SELF':
                case 'STATUS_APPLIED_NPC':
                    setStatuses(prev => {
                        const owner = tagType === 'STATUS_APPLIED_SELF' ? 'pc' : attributes.npcName;
                        if (!owner) return prev; // Cannot apply status without a valid owner

                        const existingStatusIndex = prev.findIndex(s => s.name === attributes.name && s.owner === owner);

                        if (existingStatusIndex > -1) {
                            // Status exists, merge new attributes into it
                            const newStatuses = [...prev];
                            newStatuses[existingStatusIndex] = { 
                                ...newStatuses[existingStatusIndex], 
                                ...attributes 
                            };
                            return newStatuses;
                        } else {
                            // Status is new, add it to the list
                            return [...prev, { ...attributes, owner } as Status];
                        }
                    });
                    break;
                case 'STATUS_CURED_SELF':
                    setStatuses(prev => prev.filter(s => !(s.name === attributes.name && s.owner === 'pc')));
                    break;
                case 'STATUS_CURED_NPC':
                    setStatuses(prev => prev.filter(s => !(s.name === attributes.name && s.owner === attributes.npcName)));
                    break;
                case 'SKILL_LEARNED':
                    // 1. Add/update the skill in the general knowledge base
                    setKnownEntities(prev => ({
                        ...prev,
                        [attributes.name]: {
                            type: 'skill',
                            name: attributes.name,
                            description: attributes.description || 'Chưa có mô tả.',
                            realm: attributes.realm,
                            skillType: attributes.skillType,
                        }
                    }));
                    // 2. Add the skill to the PC's personal learned list
                    const updatePcWithSkill = (pcEntity: Entity): Entity => {
                        const learned = pcEntity.learnedSkills || [];
                        if (!learned.includes(attributes.name)) {
                            return { ...pcEntity, learnedSkills: [...learned, attributes.name] };
                        }
                        return pcEntity;
                    };
                    setKnownEntities(prev => {
                        const currentPcName = Object.keys(prev).find(key => prev[key].type === 'pc');
                        if (!currentPcName) return prev;
                        return {
                            ...prev,
                            [currentPcName]: updatePcWithSkill(prev[currentPcName])
                        };
                    });
                    setParty(prevParty => prevParty.map(member => 
                        member.type === 'pc' ? updatePcWithSkill(member) : member
                    ));
                    break;
                case 'LORE_NPC':
                case 'LORE_ITEM':
                case 'LORE_SKILL':
                case 'LORE_LOCATION':
                case 'LORE_FACTION':
                case 'LORE_CONCEPT':
                    setKnownEntities(prev => {
                        const newAttributes = { ...attributes };
                        if (tagType === 'LORE_NPC' && typeof newAttributes.skills === 'string') {
                            newAttributes.skills = newAttributes.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
                        }
                        
                        const entityType: EntityType = tagType === 'LORE_SKILL' 
                            ? 'skill' 
                            : tagType.replace('LORE_', '').toLowerCase() as EntityType;

                        return { ...prev, [attributes.name]: { type: entityType, ...newAttributes } };
                    });
                    break;
                case 'ENTITY_UPDATE':
                case 'ENTITY_SET_STATE':
                    setKnownEntities(prev => {
                        const newEntities = { ...prev };
                        const targetName = attributes.name;
                        if (!newEntities[targetName]) return prev;

                        const { name, newDescription, newName, ...updateData } = attributes;
                        const finalUpdateData = { ...updateData };
                        if (newDescription) finalUpdateData.description = newDescription;

                        if (newName && newName !== targetName) {
                            const oldEntity = newEntities[targetName];
                            delete newEntities[targetName];
                            newEntities[newName] = { ...oldEntity, ...finalUpdateData, name: newName };
                        } else {
                            newEntities[targetName] = { ...newEntities[targetName], ...finalUpdateData };
                        }
                        return newEntities;
                    });
                    break;
                case 'ITEM_AQUIRED':
                    setKnownEntities(prev => ({ ...prev, [attributes.name]: { type: 'item', owner: 'pc', ...attributes } }));
                    break;
                case 'ITEM_DAMAGED':
                    setKnownEntities(prev => {
                        const newEntities = { ...prev };
                        const item = newEntities[attributes.name];
                        if (item?.type === 'item' && typeof item.durability === 'number' && attributes.damage) {
                            item.durability = Math.max(0, item.durability - attributes.damage);
                            if (item.durability === 0) {
                                item.state = 'broken';
                                item.equipped = false; // Unequip broken item
                            }
                        }
                        return newEntities;
                    });
                    break;
                case 'ITEM_REPAIRED':
                    setKnownEntities(prev => {
                        const newEntities = { ...prev };
                        const item = newEntities[attributes.name];
                        if (item?.type === 'item' && typeof item.durability === 'number' && attributes.amount) {
                            item.durability = Math.min(100, item.durability + attributes.amount);
                            if (item.state === 'broken' && item.durability > 0) {
                                item.state = 'intact';
                            }
                        }
                        return newEntities;
                    });
                    break;
                case 'ITEM_CONSUMED':
                    setKnownEntities(prev => {
                        const newEntities = { ...prev };
                        const item = newEntities[attributes.name];
                        if (item?.type === 'item' && item.owner === 'pc') {
                            if (typeof item.uses === 'number' && item.uses > 1) {
                                 item.uses -= 1;
                            } else {
                                 // If it's the last use, or has no uses property, remove it
                                delete newEntities[attributes.name];
                            }
                        }
                        return newEntities;
                    });
                    break;
                case 'ITEM_EQUIPPED':
                    setKnownEntities(prev => {
                        const newEntities = { ...prev };
                        const item = newEntities[attributes.name];
                        if (item?.owner === 'pc' && item.equippable && item.state !== 'broken') {
                            item.equipped = true;
                        }
                        return newEntities;
                    });
                    break;
                case 'ITEM_UNEQUIPPED':
                     setKnownEntities(prev => {
                        const newEntities = { ...prev };
                        const item = newEntities[attributes.name];
                        if (item?.owner === 'pc') item.equipped = false;
                        return newEntities;
                    });
                    break;
                case 'QUEST_ASSIGNED':
                    const newQuest: Quest = {
                        title: attributes.title,
                        description: attributes.description,
                        objectives: attributes.objectives || [],
                        status: 'active',
                        giver: attributes.giver,
                        reward: attributes.reward,
                        isMainQuest: attributes.isMainQuest === true,
                    };
                    if (newQuest.title && newQuest.description) {
                        setQuests(prev => [...prev.filter(q => q.title !== newQuest.title), newQuest]);
                    }
                    break;
                case 'QUEST_UPDATED':
                    setQuests(prev => prev.map(q => q.title === attributes.title ? { ...q, status: attributes.status } : q));
                    break;
                case 'QUEST_OBJECTIVE_COMPLETED':
                    setQuests(prev => prev.map(q => {
                        if (q.title !== attributes.questTitle) return q;
                        const newObjectives = q.objectives.map(obj => obj.description === attributes.objectiveDescription ? { ...obj, completed: true } : obj);
                        const allCompleted = newObjectives.every(obj => obj.completed);
                        return { ...q, objectives: newObjectives, status: allCompleted ? 'completed' : q.status };
                    }));
                    break;
                case 'COMPANION':
                     const newCompanion = { type: 'companion', ...attributes } as Entity;
                     setParty(prev => [...prev.filter(p => p.name !== newCompanion.name), newCompanion]);
                     setKnownEntities(prev => ({ ...prev, [newCompanion.name]: newCompanion }));
                    break;
                case 'RULE_DEACTIVATE':
                    if (attributes.id) {
                        setCustomRules(prev =>
                            prev.map(rule =>
                                rule.id === attributes.id ? { ...rule, isActive: false } : rule
                            )
                        );
                    }
                    break;
                default:
                    break;
            }
        }
        // After the loop has processed all tags, clean the original story text
        // in one go and return it. This prevents the "tag leakage" bug.
        const cleanStory = storyText.replace(tagRegex, '');
        return cleanStory.trim().replace(/(\r\n|\n|\r){3,}/g, '\n\n');
    }, []);

    const processAndValidateResponse = useCallback((responseText: string, isInitial: boolean = false) => {
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(responseText);
        } catch (e) {
            console.error("JSON Parsing Error:", e, "Raw response:", responseText);
            throw new Error("AI đã trả về một định dạng không hợp lệ.");
        }

        const isValidResponse = jsonResponse &&
                                typeof jsonResponse.story === 'string' &&
                                jsonResponse.story.trim() !== '' &&
                                Array.isArray(jsonResponse.choices) &&
                                jsonResponse.choices.length > 0;
        
        if (!isValidResponse) {
            throw new Error("AI đã phản hồi không nhất quán (thiếu truyện hoặc lựa chọn).");
        }

        // If valid, update state
        const cleanStory = parseStoryAndTags(jsonResponse.story);
        if (isInitial) {
            setStoryLog([cleanStory]);
        } else {
            setStoryLog(prev => [...prev, cleanStory]);
        }
        setChoices(jsonResponse.choices);
        setGameHistory(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);

    }, [parseStoryAndTags]);
    
    const triggerSummarization = useCallback(async (textToSummarize: string, tier: 'turn' | 'chapter' | 'memoir'): Promise<string | null> => {
        if (!textToSummarize || !isAiReady) return null;

        const summarizationPrompt = `BẠN LÀ MỘT NGƯỜI BIÊN SOẠN LỊCH SỬ. Hãy đọc kỹ các sự kiện sau. Sau đó, hãy tóm tắt chúng thành một đoạn văn duy nhất, mạch lạc, dưới dạng một chương trong biên niên sử.
        
        Các Sự Kiện:
        ---
        ${textToSummarize}
        ---
        
        YÊU CẦU: Chỉ trả về đoạn văn tóm tắt. Không thêm bất kỳ lời bình luận hay giới thiệu nào.`;

        try {
            console.log(`Triggering background summarization for tier: ${tier}...`);
            const response = await makeApiCall({ model: 'gemini-2.5-flash', contents: summarizationPrompt });
            const summaryText = response.text.trim();
            return summaryText || null;
        } catch (error) {
            console.error(`Background ${tier} summarization failed:`, error);
            return null;
        }
    }, [isAiReady, makeApiCall]);
    
    const manageChronicle = useCallback(async () => {
        let newChronicle = { ...chronicle };
        const lastHistoryChunk = gameHistory.slice(-TURN_SUMMARY_INTERVAL * 2);
        
        const turnSummaryText = lastHistoryChunk.map(entry => {
            if (entry.role === 'user') {
                const match = entry.parts[0].text.match(/--- HÀNH ĐỘNG CỦA NGƯỜI CHƠI ---\n"([^"]+)"/);
                return `Người chơi: ${match ? match[1] : entry.parts[0].text}`;
            }
            return `Quản Trò: ${entry.parts[0].text.replace(/\[([A-Z_]+):\s*([^\]]+)\]/g, '').trim()}`;
        }).join('\n\n');

        const newTurnSummary = await triggerSummarization(turnSummaryText, 'turn');
        if (newTurnSummary) {
            newChronicle.turn = [...newChronicle.turn, newTurnSummary];

            if (newChronicle.turn.length >= CHAPTER_SUMMARY_INTERVAL) {
                const chapterContent = newChronicle.turn.slice(-CHAPTER_SUMMARY_INTERVAL).join('\n');
                const newChapterSummary = await triggerSummarization(chapterContent, 'chapter');
                if (newChapterSummary) {
                    newChronicle.chapter = [...newChronicle.chapter, newChapterSummary];
                    newChronicle.turn = newChronicle.turn.slice(0, -CHAPTER_SUMMARY_INTERVAL);

                     if (newChronicle.chapter.length >= MEMOIR_SUMMARY_INTERVAL) {
                        const memoirContent = newChronicle.chapter.slice(-MEMOIR_SUMMARY_INTERVAL).join('\n');
                        const newMemoirSummary = await triggerSummarization(memoirContent, 'memoir');
                         if (newMemoirSummary) {
                            newChronicle.memoir = [...newChronicle.memoir, newMemoirSummary];
                            newChronicle.chapter = newChronicle.chapter.slice(0, -MEMOIR_SUMMARY_INTERVAL);
                        }
                    }
                }
            }
        }
        
        setChronicle(newChronicle);
    }, [gameHistory, chronicle, triggerSummarization]);

    const handleAction = useCallback(async (action: string) => {
        let originalAction = action.trim();
        let isNsfwRequest = false;
        
        setTurnError(null);
        setLastFailedAction(null);

        const nsfwRegex = /\s+nsfw\s*$/i;
        if (nsfwRegex.test(originalAction)) {
            isNsfwRequest = true;
            originalAction = originalAction.replace(nsfwRegex, '').trim();
        }

        if (!originalAction || isLoading || !isAiReady) return;

        setIsLoading(true);
        setChoices([]);
        setStoryLog(prev => [...prev, `> ${originalAction}`]);

        let enrichedAction = originalAction;
        const commandPrefixes = ['sử dụng', 'học công pháp', 'trang bị', 'tháo', 'hệ thống:'];
        const isCommand = commandPrefixes.some(prefix => originalAction.toLowerCase().startsWith(prefix));

        if (!isCommand) {
            try {
                const lastStory = storyLog.slice(-1)[0] || "Bối cảnh chưa rõ ràng.";
                const pcStatusesList = statuses.filter(s => s.owner === 'pc' || (pcName && s.owner === pcName));
                const pcStatusText = pcStatusesList.length > 0 ? pcStatusesList.map(s => s.name).join(', ') : 'Bình thường';

                const analysisPrompt = `Bạn là một trợ lý phân tích hành động trong game. Dựa vào bối cảnh và trạng thái nhân vật, hãy biến hành động sau thành một chuỗi lựa chọn phức tạp. Nếu hành động không có rủi ro (như nói chuyện, kiểm tra đồ), hãy trả về hành động gốc.

Bối cảnh: "${lastStory}"
Trạng thái nhân vật: ${pcStatusText}
Hành động của người chơi: "${originalAction}"

YÊU CẦU: Nếu có rủi ro, trả về theo định dạng: "Hành động (Thành công X%: [Kết quả]. | Rủi ro: [Rủi ro]. | Thất bại: [Thất bại].)". Chỉ trả về MỘT chuỗi duy nhất.`;
                
                const response = await makeApiCall({
                    model: 'gemini-2.5-flash',
                    contents: analysisPrompt
                });
                
                const analyzedText = response.text.trim();
                if (analyzedText && analyzedText.toLowerCase().includes('thành công')) {
                    enrichedAction = analyzedText;
                }
                
            } catch (error) {
                console.warn("Action analysis call failed, proceeding with original action.", error);
            }
        }

        const currentGameState: SaveData = {
            worldData, storyLog, choices, knownEntities, statuses, quests,
            gameHistory, memories, party, customRules, systemInstruction, turnCount,
            totalTokensUsed, lastCallTokens, chronicle,
        };
        
        const userPrompt = buildRagPrompt(
            enrichedAction, // Use the potentially enriched action
            currentGameState,
            '', // Rule changes are handled by a dedicated system turn
            customRules.filter(r=>r.isActive).map(r=>r.content).join('\n'),
            isNsfwRequest && worldData.allowNsfw ? `\nLƯU Ý NSFW: Kích hoạt chế độ 18+.\n` : ''
        );
        
        const newUserEntry: GameHistoryEntry = { role: 'user', parts: [{ text: userPrompt }] };
        const updatedHistory = [...gameHistory, newUserEntry];

        try {
            const response = await makeApiCall({
                model: 'gemini-2.5-flash',
                contents: updatedHistory.slice(-10), // Send recent history window
                config: { systemInstruction, responseMimeType: "application/json", responseSchema }
            });

            const usage = response.usageMetadata;
            if (usage) {
                const currentTokens = usage.totalTokenCount || 0;
                setLastCallTokens(currentTokens);
                setTotalTokensUsed(prev => (prev || 0) + currentTokens);
            }

            const newTurnCount = turnCount + 1;
            setTurnCount(newTurnCount);
            
            processAndValidateResponse(response.text);

            if (newTurnCount > 0 && newTurnCount % TURN_SUMMARY_INTERVAL === 0) {
                 await manageChronicle();
            }

        } catch (error: any) {
            console.error("Error in handleAction:", error);
            setStoryLog(prev => prev.slice(0, -1));

            const lastModelResponseText = [...gameHistory].reverse().find(h => h.role === 'model')?.parts[0].text;
            if (lastModelResponseText) {
                try {
                    const lastGoodChoices = JSON.parse(lastModelResponseText).choices || [];
                    setChoices(lastGoodChoices);
                } catch (e) {
                    setChoices([]);
                }
            } else {
                setChoices([]);
            }

            setTurnError(error.message || "AI không thể xử lý yêu cầu.");
            setLastFailedAction(originalAction);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isAiReady, worldData, storyLog, gameHistory, customRules, systemInstruction, makeApiCall, responseSchema, processAndValidateResponse, manageChronicle, chronicle, choices, knownEntities, lastCallTokens, memories, party, quests, statuses, totalTokensUsed, turnCount, pcName]);

    const handleRetry = useCallback(() => {
        if (lastFailedAction) {
            handleAction(lastFailedAction);
        }
    }, [lastFailedAction, handleAction]);
    
     const processRuleUpdates = useCallback(async (newRules: CustomRule[], oldRules: CustomRule[]) => {
        const activated: CustomRule[] = newRules.filter(nr => nr.isActive && !oldRules.find(or => or.id === nr.id)?.isActive);
        const deactivated: CustomRule[] = oldRules.filter(or => or.isActive && !newRules.find(nr => nr.id === or.id)?.isActive);
        const updated: { oldRule: CustomRule, newRule: CustomRule }[] = newRules
            .map(nr => ({ newRule: nr, oldRule: oldRules.find(or => or.id === or.id) }))
            .filter(u => u.oldRule && u.newRule.isActive && u.oldRule.isActive && u.newRule.content !== u.oldRule.content)
            .map(u => ({ oldRule: u.oldRule!, newRule: u.newRule }));

        const hasChanges = activated.length > 0 || deactivated.length > 0 || updated.length > 0;
        
        if (!hasChanges) return;

        setIsLoading(true);
        const originalChoices = choices;
        setChoices([]); // Temporarily clear choices during system turn

        const ruleChangeContext = `--- CẬP NHẬT LUẬT LỆ THẾ GIỚI ---\n${JSON.stringify({ activated, deactivated, updated })}\n`;
        const currentGameState: SaveData = {
            worldData, storyLog, choices: [], knownEntities, statuses, quests,
            gameHistory, memories, party, customRules: oldRules, systemInstruction, turnCount,
            totalTokensUsed, lastCallTokens, chronicle,
        };
        const systemPrompt = buildRagPrompt("SYSTEM_RULE_UPDATE", currentGameState, ruleChangeContext, '', '');
        
        try {
            const response = await makeApiCall({
                model: 'gemini-2.5-flash',
                contents: systemPrompt,
                config: { systemInstruction } // NO responseSchema for this call
            });

            const usage = response.usageMetadata;
            if (usage) {
                const currentTokens = usage.totalTokenCount || 0;
                setLastCallTokens(currentTokens);
                setTotalTokensUsed(prev => (prev || 0) + currentTokens);
            }

            const systemGeneratedStory = parseStoryAndTags(response.text);
            const finalMessage = systemGeneratedStory.trim() 
                ? `**⭐ ${systemGeneratedStory} ⭐**` 
                : `**⭐ Một sức mạnh mới đang hình thành trong thế giới... ⭐**`;
            setStoryLog(prev => [...prev, finalMessage]);

        } catch (error: any) {
            console.error("Error processing rule update:", error);
            setStoryLog(prev => [...prev, `Lỗi khi xử lý luật lệ: ${error.message}`]);
        } finally {
            setIsLoading(false);
            setChoices(originalChoices); // Restore choices from before the system turn
        }
    }, [choices, chronicle, customRules, gameHistory, isAiReady, knownEntities, makeApiCall, memories, parseStoryAndTags, party, quests, storyLog, statuses, systemInstruction, totalTokensUsed, turnCount, worldData, lastCallTokens]);

    const handleSaveRules = useCallback(async (newRules: CustomRule[]) => {
        const oldRules = customRules;
        setCustomRules(newRules); // Optimistically update for UI responsiveness
        await processRuleUpdates(newRules, oldRules);
    }, [customRules, processRuleUpdates]);

    const handleChangeWritingStyle = useCallback(async (newStyleKey: string) => {
        if (isLoading || !isAiReady) return;

        // Construct the new system instruction
        let baseInstruction = systemInstruction.split('\n\n--- HƯỚNG DẪN VĂN PHONG AI ---')[0];
        // Also remove the NSFW module if it exists, to rebuild it cleanly
        baseInstruction = baseInstruction.split('\n\n--- MODULE NÂNG CẤP NSFW')[0];

        let newSystemInstruction = baseInstruction;
        
        if (newStyleKey !== 'default' && AI_WRITING_STYLES[newStyleKey]) {
            newSystemInstruction += `\n\n--- HƯỚNG DẪN VĂN PHONG AI ---\n${AI_WRITING_STYLES[newStyleKey].content}\n--- KẾT THÚC HƯỚNG DẪN ---`;
            
            // Append the NSFW enhancement module if an 18+ style is selected and NSFW is allowed
            if (worldData.allowNsfw && (newStyleKey === 'vsc' || newStyleKey === 'japanese_sensory')) {
                newSystemInstruction += `\n\n--- MODULE NÂNG CẤP NSFW (BẮT BUỘC TUÂN THỦ) ---\n${NSFW_INSTRUCTION_MODULE}\n--- KẾT THÚC MODULE ---`;
            }
        }
        
        // Optimistically update the state
        setSystemInstruction(newSystemInstruction);
        setWorldData(prev => ({ ...prev, aiWritingStyle: newStyleKey }));

        // Create a system action to inform the AI and the player
        const styleName = AI_WRITING_STYLES[newStyleKey]?.name || 'Mặc định (Cân bằng)';
        const systemAction = `Hệ thống: Thay đổi văn phong kể chuyện sang "${styleName}". Hãy mô tả sự thay đổi trong không khí của câu chuyện và đưa ra các lựa chọn tiếp theo.`;
        
        // Use the main action handler to process this turn
        await handleAction(systemAction);

    }, [isLoading, isAiReady, systemInstruction, handleAction, worldData.allowNsfw]);


    const generateInitialStory = useCallback(async () => {
        if (!isAiReady) return;
        setIsLoading(true);

        const pc = party.find(p => p.type === 'pc');
        let initialAction = "Bắt đầu cuộc phiêu lưu. Hãy mô tả bối cảnh và tình huống ban đầu của tôi.";

        if (worldData.addGoal) {
            initialAction += " Đồng thời, hãy tạo một nhiệm vụ ban đầu cho tôi (sử dụng thẻ QUEST_ASSIGNED) dựa trên bối cảnh và tiểu sử của nhân vật.";
        }
        
        if (pc && pc.gender === undefined) {
            initialAction += ` Giới tính của nhân vật chính chưa được xác định, hãy tự quyết định một giới tính phù hợp và cập nhật lại bằng thẻ [ENTITY_UPDATE: name="${pc.name}", gender="Nam|Nữ"].`;
        }

        const currentGameState: SaveData = {
            worldData, storyLog: [], choices: [], knownEntities, statuses, quests,
            gameHistory: [], memories, party, customRules, systemInstruction, turnCount: 0,
            totalTokensUsed: 0, lastCallTokens: 0, chronicle,
        };

        const initialPrompt = buildRagPrompt(
            initialAction,
            currentGameState,
            '', // No rule changes
            customRules.filter(r => r.isActive).map(r => r.content).join('\n'),
            worldData.allowNsfw ? `\nLƯU Ý NSFW: Kích hoạt chế độ 18+.\n` : ''
        );

        const initialHistory: GameHistoryEntry[] = [{ role: 'user', parts: [{ text: initialPrompt }] }];
        setGameHistory(initialHistory);

        try {
             const response = await makeApiCall({
                model: 'gemini-2.5-flash',
                contents: initialHistory,
                config: { systemInstruction, responseMimeType: "application/json", responseSchema }
            });
            const usage = response.usageMetadata;
            if (usage) {
                 const currentTokens = usage.totalTokenCount || 0;
                 setLastCallTokens(currentTokens);
                 setTotalTokensUsed(currentTokens);
            }
            processAndValidateResponse(response.text, true);

        } catch(e) {
            console.error("Error generating initial story:", e);
            const errorMessage = e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định khi bắt đầu câu chuyện.";
            setStoryLog(prev => [...prev, `Lỗi: ${errorMessage}`]);
        } finally {
            setIsLoading(false);
        }

    }, [
        isAiReady, worldData, knownEntities, statuses, quests, memories, party, customRules,
        systemInstruction, chronicle, makeApiCall, responseSchema, processAndValidateResponse
    ]);

    useEffect(() => {
        if (gameHistory.length === 0 && isAiReady) {
            generateInitialStory();
        } else if (!isAiReady) {
            setStoryLog([apiKeyError || "AI chưa sẵn sàng."]);
            setIsLoading(false);
        }
    }, [isAiReady, gameHistory.length, generateInitialStory, apiKeyError]);

    const handleSuggestAction = useCallback(async (): Promise<string | null> => {
        if (isLoading || !isAiReady) return null;
        setIsLoading(true);
        const suggestionPrompt = `Bối cảnh: "${storyLog.slice(-1)[0]}". Tính cách NV: "${worldData.customPersonality || worldData.personalityFromList}". Gợi ý một hành động sáng tạo hoặc hợp lý.`;
        try {
            const response = await makeApiCall({ model: 'gemini-2.5-flash', contents: suggestionPrompt });
            return response.text.trim();
        } catch (error: any) {
            console.error("Error suggesting action:", error);
            return "Không thể nhận gợi ý lúc này.";
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isAiReady, storyLog, worldData, makeApiCall]);
    
    const handleSaveGame = useCallback(() => {
        const currentGameState: SaveData = {
            worldData, storyLog, choices, knownEntities, statuses, quests,
            gameHistory, memories, party, customRules, systemInstruction, turnCount,
            totalTokensUsed, lastCallTokens, chronicle
        };
        const jsonString = JSON.stringify(currentGameState, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `AI-RolePlay-${worldData.characterName.replace(/\s+/g, '_') || 'Save'}-${timestamp}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [worldData, storyLog, choices, knownEntities, statuses, quests, gameHistory, memories, party, customRules, systemInstruction, turnCount, totalTokensUsed, lastCallTokens, chronicle]);

    return {
        state: {
            worldData, storyLog, choices, isLoading, isAiReady, apiKeyError,
            knownEntities, statuses, quests, gameHistory, turnCount,
            memories, party, customRules, systemInstruction,
            totalTokensUsed, lastCallTokens, chronicle, pcName, isCustomActionLocked,
            turnError,
        },
        actions: {
            handleAction, handleSuggestAction, handleSaveGame, handleSaveRules, handleChangeWritingStyle,
            setMemories, handleRetry,
        }
    };
};