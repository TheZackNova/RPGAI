




import React, { useState, useEffect } from 'react';
import { AIProvider } from './AIProvider.tsx';
import { MainMenu } from './components/MainMenu.tsx';
import { CreateWorld } from './components/CreateWorld.tsx';
import { GameScreen } from './components/GameScreen.tsx';
import { ApiSettingsModal } from './components/Modals.tsx';
import { SaveData, Entity, WorldCreationData, CustomRule, Chronicle, KnownEntities } from './types.ts';
import { DEFAULT_SYSTEM_INSTRUCTION, DEFAULT_LIVING_WORLD_RULE_CONTENT, AI_WRITING_STYLES, NSFW_INSTRUCTION_MODULE } from './constants.ts';

export default function App() {
  const [view, setView] = useState('menu'); // 'menu', 'create-world', 'game'
  const [gameState, setGameState] = useState<SaveData | null>(null);
  const [isApiSettingsModalOpen, setIsApiSettingsModalOpen] = useState(false);
  
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily') || 'font-sans');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'text-base');

  useEffect(() => {
    localStorage.setItem('fontFamily', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const navigateToCreateWorld = () => setView('create-world');
  
  const navigateToMenu = () => {
      setGameState(null);
      setView('menu');
  };
  
  const startNewGame = (data: WorldCreationData) => {
      const { writingStyle, difficulty, gender } = data;
      let finalSystemInstruction = DEFAULT_SYSTEM_INSTRUCTION;

      // Apply Writing Style rule
      if (writingStyle === 'first_person') {
          finalSystemInstruction += '\n\n**QUY TẮC BỔ SUNG - VĂN PHONG:** Bạn PHẢI tường thuật câu chuyện ở ngôi thứ nhất. Nhân vật chính sẽ xưng là "Ta" hoặc "Tôi".';
      } else { // second_person is default
          finalSystemInstruction += '\n\n**QUY TẮC BỔ SUNG - VĂN PHONG:** Bạn PHẢI tường thuật câu chuyện ở ngôi thứ hai. Hãy gọi nhân vật chính là "ngươi".';
      }

      // Apply AI Writing Style
      if (data.aiWritingStyle && AI_WRITING_STYLES[data.aiWritingStyle]) {
        finalSystemInstruction += `\n\n--- HƯỚNG DẪN VĂN PHONG AI ---\n${AI_WRITING_STYLES[data.aiWritingStyle].content}\n--- KẾT THÚC HƯỚNG DẪN ---`;
      }


      // Apply Difficulty rule
      let difficultyText = 'Bình thường';
      if (difficulty === 'easy') difficultyText = 'Dễ (ưu tiên thành công cho người chơi)';
      if (difficulty === 'hard') difficultyText = 'Khó (thử thách, hậu quả nghiêm trọng hơn)';
      finalSystemInstruction += `\n\n**QUY TẮC BỔ SUNG - ĐỘ KHÓ:** Độ khó của trò chơi được đặt là "${difficultyText}". Hãy điều chỉnh tỷ lệ thành công, mức độ rủi ro và sự khắc nghiệt của các sự kiện cho phù hợp.`;

      // Apply NSFW Atmosphere rule
      if (data.allowNsfw) {
          finalSystemInstruction += `\n\n**QUY TẮC BỔ SUNG - BẦU KHÔNG KHÍ (NSFW):** Chế độ 18+ đã được kích hoạt. Thế giới này tăm tối và nguy hiểm hơn. Các NPC có thể có động cơ ích kỷ, tàn nhẫn hoặc dâm đãng. Bạo lực cần được mô tả một cách trần trụi và thực tế hơn. Tuy nhiên, các cảnh tình dục chi tiết, trần trụi chỉ được viết khi hành động của người chơi có đuôi 'nsfw'.`;
          
          // Append the NSFW enhancement module if an 18+ style is selected
          if (data.aiWritingStyle === 'vsc' || data.aiWritingStyle === 'japanese_sensory') {
              finalSystemInstruction += `\n\n--- MODULE NÂNG CẤP NSFW (BẮT BUỘC TUÂN THỦ) ---\n${NSFW_INSTRUCTION_MODULE}\n--- KẾT THÚC MODULE ---`;
          }
      }

      const startingSkillNames = (data.startSkills || []).map(skill => skill.name).filter(Boolean);

      const pcEntity: Entity = {
          name: data.characterName || 'Vô Danh',
          type: 'pc',
          description: data.bio,
          gender: gender === 'ai_decides' ? undefined : gender,
          personality: data.customPersonality || data.personalityFromList,
          personalityMbti: data.personalityMbti || undefined,
          learnedSkills: startingSkillNames,
          realm: 'Phàm nhân', // Set default realm
      };

      const initialEntities: KnownEntities = { [pcEntity.name]: pcEntity };

      // Process multiple starting skills to add them to the world's knowledge
      if (data.startSkills && data.startSkills.length > 0) {
          data.startSkills.forEach(skill => {
              if (skill.name) { // Ensure skill has a name
                  const skillEntity: Entity = {
                      name: skill.name,
                      type: 'skill',
                      // Use the provided description, or a default if empty
                      description: skill.description || 'Chưa có mô tả.',
                      realm: 'Sơ Nhập', // Add default realm for starting skills
                  };
                  initialEntities[skill.name] = skillEntity;
              }
          });
      }

      const livingWorldRule: CustomRule = {
        id: 'default_living_world_rule_v1',
        content: DEFAULT_LIVING_WORLD_RULE_CONTENT,
        isActive: true,
      };

      setGameState({
        worldData: data,
        storyLog: [],
        choices: [],
        knownEntities: initialEntities,
        statuses: [],
        quests: [],
        gameHistory: [],
        memories: [],
        party: [pcEntity],
        customRules: [livingWorldRule],
        systemInstruction: finalSystemInstruction,
        turnCount: 0,
        totalTokensUsed: 0,
        lastCallTokens: 0,
        chronicle: { turn: [], chapter: [], memoir: [] },
      });
      setView('game');
  }

  const handleLoadGameFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text === 'string') {
                const loadedJson = JSON.parse(text);
                // Basic validation
                if (loadedJson.worldData && loadedJson.gameHistory) {
                    const pc = Object.values(loadedJson.knownEntities).find((e: any) => e.type === 'pc');
                    
                    let chronicle: Chronicle;
                    if (loadedJson.chronicle) {
                        chronicle = loadedJson.chronicle;
                    } else if (loadedJson.storySummary) {
                        // Compatibility for old saves
                        chronicle = { turn: loadedJson.storySummary, chapter: [], memoir: [] };
                    } else {
                        chronicle = { turn: [], chapter: [], memoir: [] };
                    }

                    const validatedData: SaveData = {
                        ...loadedJson,
                        customRules: loadedJson.customRules || (loadedJson.userKnowledge ? [{ id: 'imported_knowledge', content: loadedJson.userKnowledge, isActive: true }] : []),
                        party: loadedJson.party || (pc ? [pc] : []),
                        systemInstruction: loadedJson.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
                        turnCount: loadedJson.turnCount || 0,
                        totalTokensUsed: loadedJson.totalTokensUsed || 0,
                        lastCallTokens: loadedJson.lastCallTokens || 0,
                        chronicle: chronicle,
                    };
                    delete (validatedData as any).userKnowledge;
                    delete (validatedData as any).storySummary;

                    setGameState(validatedData);
                    setView('game');
                } else {
                    alert('Tệp lưu không hợp lệ.');
                }
            }
        } catch (error) {
            console.error('Lỗi khi tải tệp:', error);
            alert('Không thể đọc tệp lưu. Tệp có thể bị hỏng hoặc không đúng định dạng.');
        }
    };
    reader.readAsText(file);
  };

  const openApiSettings = () => setIsApiSettingsModalOpen(true);

  const renderContent = () => {
      switch(view) {
          case 'create-world':
              return <CreateWorld onBack={navigateToMenu} onStartGame={startNewGame} />;
          case 'game':
              return gameState ? <GameScreen initialGameState={gameState} onBackToMenu={navigateToMenu} fontFamily={fontFamily} fontSize={fontSize}/> : <MainMenu onStartNewAdventure={navigateToCreateWorld} onOpenApiSettings={openApiSettings} onLoadGameFromFile={handleLoadGameFromFile} />;
          case 'menu':
          default:
              return <MainMenu onStartNewAdventure={navigateToCreateWorld} onOpenApiSettings={openApiSettings} onLoadGameFromFile={handleLoadGameFromFile} />;
      }
  }

  return (
    <AIProvider
      onSettingsChange={(isOpen) => setIsApiSettingsModalOpen(isOpen)}
    >
        <style>{`
        .am-kim {
            background: linear-gradient(135deg, #ca8a04, #eab308, #fde047);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: bold;
            animation: am-kim-shine 3s linear infinite;
            background-size: 200% 200%;
        }

        .dark .am-kim {
             background: linear-gradient(135deg, #fde047, #a2830e, #fde047);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        @keyframes am-kim-shine {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-2 sm:p-4 font-sans text-slate-900 dark:text-white antialiased pb-20 bg-slate-100 dark:bg-slate-900 transition-colors duration-500">
        {renderContent()}
        <ApiSettingsModal 
            isOpen={isApiSettingsModalOpen} 
            onClose={() => setIsApiSettingsModalOpen(false)}
        />
      </div>
    </AIProvider>
  );
}