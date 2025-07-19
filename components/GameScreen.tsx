

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState.ts';
import { SaveData, Status, Quest, Entity, CustomRule } from '../types.ts';
import {
    ConfirmationModal, StatusDetailModal, MemoryModal, QuestDetailModal,
    EntityInfoModal, KnowledgeBaseModal, CustomRulesModal, ChangeWritingStyleModal
} from './Modals.tsx';
import { StatusDisplay, QuestLog, PartyMemberTab, InteractiveText, CustomizationFooter } from './GameUI.tsx';
import {
    SpinnerIcon, HomeIcon, ArchiveIcon, BrainIcon, MemoryIcon, RefreshIcon,
    SparklesIcon, ExclamationIcon, DocumentAddIcon, ChevronDownIcon, ChevronUpIcon
} from './Icons.tsx';


export const GameScreen: React.FC<{
    initialGameState: SaveData,
    onBackToMenu: () => void,
    fontFamily: string,
    fontSize: string
}> = ({ initialGameState, onBackToMenu, fontFamily, fontSize }) => {
    const { state, actions } = useGameState(initialGameState);
    const {
        worldData, storyLog, choices, isLoading, isAiReady, apiKeyError,
        knownEntities, statuses, quests, memories, party, customRules,
        turnCount, totalTokensUsed, lastCallTokens, pcName, isCustomActionLocked,
        turnError,
    } = state;
    const {
        handleAction, handleSuggestAction, handleSaveGame, handleSaveRules, handleChangeWritingStyle,
        setMemories, handleRetry,
    } = actions;

    const [customAction, setCustomAction] = useState('');
    const [isAutoNsfw, setIsAutoNsfw] = useState(false);
    
    // UI State
    const [isMobileView, setIsMobileView] = useState(false);
    const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true);
    const [isChoicesPanelVisible, setIsChoicesPanelVisible] = useState(true);

    // Modal & Notification States
    const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
    const [activeEntity, setActiveEntity] = useState<Entity | null>(null);
    const [activeStatus, setActiveStatus] = useState<Status | null>(null);
    const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
    const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
    const [isCustomRulesModalOpen, setIsCustomRulesModalOpen] = useState(false);
    const [isChangeWritingStyleModalOpen, setIsChangeWritingStyleModalOpen] = useState(false);
    const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [showRulesSavedSuccess, setShowRulesSavedSuccess] = useState(false);

    const storyContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (storyContainerRef.current) {
            storyContainerRef.current.scrollTop = storyContainerRef.current.scrollHeight;
        }
    }, [storyLog]);

    const [activeTab, setActiveTab] = useState('status');

    const onCustomActionSubmit = () => {
        let actionToSend = customAction.trim();
        // Check if auto nsfw is on AND the world allows it
        if (isAutoNsfw && worldData.allowNsfw) {
            // Check if the action already ends with "nsfw", case-insensitive, with optional spaces
            if (!/\s+nsfw\s*$/i.test(actionToSend)) {
                actionToSend += ' nsfw';
            }
        }
        handleAction(actionToSend);
        setCustomAction('');
    };
    
    const onSuggestAndSetAction = async () => {
        const suggested = await handleSuggestAction();
        if (suggested) {
            setCustomAction(suggested);
        }
    }

    const handleEntityClick = (entityName: string) => {
        const entity = knownEntities[entityName];
        if (entity) {
            setActiveEntity(entity);
        }
    };

    const handleUseItem = (itemName: string) => {
        setActiveEntity(null);
        setTimeout(() => handleAction(`Sử dụng vật phẩm: ${itemName}`), 100);
    };

    const handleLearnItem = (itemName: string) => {
        setActiveEntity(null);
        setTimeout(() => handleAction(`Học công pháp: ${itemName}`), 100);
    };

    const handleEquipItem = (itemName: string) => {
        setActiveEntity(null);
        setTimeout(() => handleAction(`Trang bị ${itemName}`), 100);
    };

    const handleUnequipItem = (itemName: string) => {
        setActiveEntity(null);
        setTimeout(() => handleAction(`Tháo ${itemName}`), 100);
    };

    const handleStatusClick = (status: Status) => {
        setActiveStatus(status);
    };

    const handleToggleMemoryPin = (index: number) => {
        setMemories(prev => prev.map((mem, i) => i === index ? { ...mem, pinned: !mem.pinned } : mem));
    };

    const handleQuestClick = (quest: Quest) => {
        setActiveQuest(quest);
    };

    const onSaveGameClick = () => {
        handleSaveGame();
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
    };
    
    const onSaveRulesClick = async (newRules: typeof customRules) => {
        await handleSaveRules(newRules);
        setShowRulesSavedSuccess(true);
        setTimeout(() => setShowRulesSavedSuccess(false), 3500);
    };


    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'status':
                const pcStatuses = statuses.filter(s => s.owner === 'pc' || (pcName && s.owner === pcName));
                return <StatusDisplay statuses={pcStatuses} onStatusClick={handleStatusClick} />;
            case 'quests':
                return <QuestLog quests={quests} onQuestClick={handleQuestClick} />;
            case 'party':
                const displayParty = party.filter(p => p.name !== pcName);
                return <PartyMemberTab party={displayParty} onMemberClick={handleEntityClick} />;
            default:
                return null;
        }
    };

    const hasActiveQuests = quests.some(q => q.status === 'active');

    const [fontFamilyState, setFontFamilyState] = useState(fontFamily);
    const [fontSizeState, setFontSizeState] = useState(fontSize);

    return (
        <div className="bg-transparent w-full h-full p-4 flex flex-col font-sans text-slate-900 dark:text-white relative" style={{ maxHeight: '98vh', height: '98vh' }}>
            {showSaveSuccess && (
                <div className="absolute top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
                    Lưu trữ thành công!
                </div>
            )}
            {showRulesSavedSuccess && (
                <div className="absolute top-20 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
                    Luật lệ đã được áp dụng!
                </div>
            )}
            {/* Menu 1: Top Navigation */}
            <div className="flex justify-between items-center bg-white/70 dark:bg-[#252945]/80 backdrop-blur-sm p-3 rounded-t-lg shadow-lg flex-shrink-0 border-b border-slate-300/20 dark:border-slate-600/20">
                 <button onClick={() => setIsRestartModalOpen(true)} title="Về trang chủ" className="flex items-center text-sm px-3 py-1.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded shadow-sm border border-slate-300 dark:border-slate-500 transition-colors text-slate-800 dark:text-white">
                    <HomeIcon className={`w-4 h-4 ${!isMobileView && 'mr-2'}`} />
                    {!isMobileView && <span>Home</span>}
                </button>
                <div className="text-center flex-1 min-w-0 mx-4">
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider truncate" title={worldData.genre || "Phiêu Lưu Ký"}>{worldData.genre || "Phiêu Lưu Ký"}</div>
                    <div className="flex justify-center items-baseline space-x-4">
                        <div className="text-xs text-slate-600 dark:text-slate-300 capitalize truncate" title={`Tính cách: ${worldData.customPersonality || worldData.personalityFromList}`}>Tính cách: {worldData.customPersonality || worldData.personalityFromList}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400" title="Tokens Lượt Này / Tổng Tokens">
                            Tokens (Lượt/Tổng): {lastCallTokens.toLocaleString()} / {totalTokensUsed.toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-white">
                    <button onClick={onSaveGameClick} title="Lưu Trữ Game" className="flex items-center px-3 py-1.5 bg-slate-600 dark:bg-slate-700 hover:bg-slate-500 dark:hover:bg-slate-600 rounded shadow-sm border border-slate-500/50 transition-colors">
                        <ArchiveIcon className={`w-4 h-4 ${!isMobileView && 'mr-1.5'}`} />
                        {!isMobileView && <span>Lưu Trữ</span>}
                    </button>
                    <button onClick={() => setIsCustomRulesModalOpen(true)} title="Nạp Tri Thức & Quản Lý Luật Lệ" className="flex items-center px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded shadow-sm border border-purple-500/50 transition-colors">
                        <DocumentAddIcon className={`w-4 h-4 ${!isMobileView && 'mr-1.5'}`} />
                         {!isMobileView && <span>Nạp Tri Thức</span>}
                    </button>
                    <button onClick={() => setIsKnowledgeModalOpen(true)} title="Xem Tri Thức Thế Giới" className="flex items-center px-3 py-1.5 bg-slate-600 dark:bg-slate-700 hover:bg-slate-500 dark:hover:bg-slate-600 rounded shadow-sm border border-slate-500/50 transition-colors">
                        <BrainIcon className={`w-4 h-4 ${!isMobileView && 'mr-1.5'}`} />
                        {!isMobileView && <span>Tri Thức</span>}
                    </button>
                    <button onClick={() => setIsMemoryModalOpen(true)} title="Xem Dòng Ký Ức" className="flex items-center px-3 py-1.5 bg-slate-600 dark:bg-slate-700 hover:bg-slate-500 dark:hover:bg-slate-600 rounded shadow-sm border border-slate-500/50 transition-colors">
                        <MemoryIcon className={`w-4 h-4 ${!isMobileView && 'mr-1.5'}`} />
                        {!isMobileView && <span>Ký Ức</span>}
                    </button>
                    <button onClick={() => setIsRestartModalOpen(true)} title="Bắt Đầu Lại" className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded shadow-sm border border-red-500/50 transition-colors">
                        <RefreshIcon className={`w-4 h-4 ${!isMobileView && 'mr-1.5'}`} />
                        {!isMobileView && <span>Bắt Đầu Lại</span>}
                    </button>
                </div>
            </div>

            {/* Menu 2: Tabs */}
            <div className="flex justify-around items-center bg-white/70 dark:bg-[#252945]/80 backdrop-blur-sm p-1 flex-shrink-0">
                <div className="flex-grow flex justify-around items-center">
                    <button onClick={() => setActiveTab('status')} className={`flex-1 text-center py-2 text-sm rounded transition-colors ${activeTab === 'status' ? 'bg-slate-200/60 dark:bg-slate-700/80 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-700/50'}`}>Trạng thái hiện tại</button>
                    <button onClick={() => setActiveTab('party')} className={`flex-1 text-center py-2 text-sm rounded transition-colors ${activeTab === 'party' ? 'bg-slate-200/60 dark:bg-slate-700/80 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-700/50'}`}>Tổ Đội Thành Viên</button>
                    <button onClick={() => setActiveTab('quests')} className={`relative flex-1 text-center py-2 text-sm rounded transition-colors ${activeTab === 'quests' ? 'bg-slate-200/60 dark:bg-slate-700/80 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-700/50'}`}>
                        Nhật Ký Nhiệm Vụ
                        {hasActiveQuests && <span className="absolute top-1 right-2 w-5 h-5 flex items-center justify-center text-yellow-600 dark:text-yellow-300"><ExclamationIcon className="w-4 h-4" /></span>}
                    </button>
                </div>
                {isMobileView && (
                     <button onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)} className="p-2 text-slate-600 dark:text-slate-400">
                        {isInfoPanelOpen ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                    </button>
                )}
            </div>

             <div className={`
                bg-white/70 dark:bg-[#2a2f4c]/80 backdrop-blur-sm rounded-b-lg flex-shrink-0 
                shadow-lg overflow-y-auto transition-all duration-300 ease-in-out
                ${isInfoPanelOpen 
                    ? 'max-h-40 border-x border-b border-slate-300/20 dark:border-slate-600/20' 
                    : 'max-h-0 border-none'
                }
            `}>
                {isInfoPanelOpen && renderActiveTabContent()}
            </div>
            

            {/* Menu 3: Main Content */}
            <div className={`flex-grow grid ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4 mt-4 overflow-hidden`}>
                {/* Story Panel */}
                <div className="flex flex-col bg-white/70 dark:bg-[#252945]/80 backdrop-blur-sm p-4 rounded-lg shadow-inner border border-slate-300/20 dark:border-slate-600/20 overflow-hidden">
                    <h2 className="text-xl font-semibold mb-3 text-pink-700 dark:text-pink-400 flex-shrink-0">Diễn Biến Câu Chuyện:</h2>
                    <div ref={storyContainerRef} className={`flex-grow overflow-y-auto pr-2 space-y-4 ${fontFamilyState} ${fontSizeState}`}>
                        {storyLog.map((line, index) => (
                            line.trim() === '' ? null : line.startsWith('>')
                                ? <p key={index} className='text-cyan-700 dark:text-cyan-300 italic pl-4'>{line}</p>
                                : <InteractiveText key={index} text={line} onEntityClick={handleEntityClick} knownEntities={knownEntities} />
                        ))}
                        {isLoading && isAiReady && storyLog.length > 0 && <div className="flex justify-center p-4"><SpinnerIcon className="w-8 h-8 text-slate-700 dark:text-white" /></div>}
                    </div>
                </div>

                {/* Choices Panel */}
                {(!isMobileView || isChoicesPanelVisible) && (
                    <div className="flex flex-col bg-white/70 dark:bg-[#252945]/80 backdrop-blur-sm p-4 rounded-lg shadow-inner border border-slate-300/20 dark:border-slate-600/20 overflow-hidden">
                        <h2 className="text-xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400 flex-shrink-0">Lựa Chọn Của Ngươi:</h2>
                        <div className="overflow-y-auto pr-2 flex-grow">
                            {turnError ? (
                                <div className="flex flex-col items-center justify-center h-full text-red-500 dark:text-red-400 text-center p-4 bg-red-500/10 rounded-lg">
                                    <ExclamationIcon className="w-8 h-8 mb-2"/>
                                    <p className="font-semibold">Đã xảy ra lỗi</p>
                                    <p className="text-sm mb-4">{turnError}</p>
                                    <button
                                        onClick={handleRetry}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-md transition-colors"
                                    >
                                        Thử Lại
                                    </button>
                                </div>
                            ) : !isAiReady ? (
                                <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400 text-center p-4">
                                    {apiKeyError || "AI chưa sẵn sàng. Vui lòng kiểm tra API Key và quay về trang chủ."}
                                </div>
                            ) : isLoading && choices.length === 0 ? (
                                <div className="flex items-center justify-center h-full py-4">
                                    <SpinnerIcon className="w-10 h-10 text-slate-700 dark:text-white" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {choices.map((choice, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAction(choice)}
                                            className={`w-full h-full text-left p-3 bg-slate-200 dark:bg-slate-700 hover:bg-purple-600 dark:hover:bg-purple-600 text-slate-800 dark:text-gray-200 hover:text-white rounded-md transition-colors duration-200 shadow-sm border border-slate-300 dark:border-slate-600 ${fontSizeState}`}
                                        >
                                            {choice.match(/^\d+\.\s/) ? choice : `${index + 1}. ${choice}`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700 flex-shrink-0">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Hoặc, nhập hành động tùy ý:</p>
                             {worldData.allowNsfw && (
                                <div 
                                    className="flex items-center mb-2 cursor-pointer" 
                                    onClick={() => setIsAutoNsfw(v => !v)}
                                    title="Tự động thêm 'nsfw' vào cuối mỗi hành động tùy ý để kích hoạt nội dung 18+."
                                >
                                    <input
                                        id="auto-nsfw-checkbox"
                                        type="checkbox"
                                        readOnly
                                        checked={isAutoNsfw}
                                        className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-purple-600 focus:ring-purple-500 pointer-events-none"
                                    />
                                    <label htmlFor="auto-nsfw-checkbox" className="ml-2 text-sm text-slate-700 dark:text-gray-300 cursor-pointer">
                                        Tự Động Kích Hoạt NSFW Cho Hành Động Được Nhập
                                    </label>
                                </div>
                            )}
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={customAction}
                                    onChange={(e) => setCustomAction(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && onCustomActionSubmit()}
                                    disabled={isLoading || !isAiReady || isCustomActionLocked}
                                    placeholder={isCustomActionLocked ? "Hành động tùy ý đã bị khóa bởi một luật lệ." : "Ví dụ: nhặt hòn đá lên..."}
                                    className="w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-l-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400 dark:placeholder-gray-400 disabled:bg-slate-500"
                                />
                                <button
                                    onClick={onSuggestAndSetAction}
                                    disabled={isLoading || !isAiReady}
                                    className="px-3 py-2 bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-400 dark:hover:bg-yellow-500 text-white font-semibold transition-colors disabled:bg-slate-500"
                                    aria-label="Gợi ý hành động"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onCustomActionSubmit}
                                    disabled={isLoading || !isAiReady || isCustomActionLocked}
                                    className="px-4 py-2 bg-cyan-500 dark:bg-cyan-600 hover:bg-cyan-400 dark:hover:bg-cyan-500 text-white font-semibold rounded-r-md transition-colors disabled:bg-slate-500"
                                >
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </div>
                 )}
            </div>
            <CustomizationFooter 
                fontFamily={fontFamilyState} setFontFamily={setFontFamilyState}
                fontSize={fontSizeState} setFontSize={setFontSizeState}
                isMobileView={isMobileView}
                onToggleMobileView={() => setIsMobileView(!isMobileView)}
                isChoicesPanelVisible={isChoicesPanelVisible}
                onToggleChoicesPanel={() => setIsChoicesPanelVisible(v => !v)}
            />
            <ConfirmationModal
                isOpen={isRestartModalOpen}
                onClose={() => setIsRestartModalOpen(false)}
                onConfirm={onBackToMenu}
                title="Xác nhận Quay Về Trang Chủ"
                message={<p>Toàn bộ tiến trình chưa lưu sẽ bị mất. Bạn có chắc chắn muốn quay về trang chủ không?</p>}
            />
            <EntityInfoModal
                entity={activeEntity}
                onClose={() => setActiveEntity(null)}
                onUseItem={handleUseItem}
                onLearnItem={handleLearnItem}
                onEquipItem={handleEquipItem}
                onUnequipItem={handleUnequipItem}
                statuses={statuses}
                onStatusClick={handleStatusClick}
            />
            <StatusDetailModal status={activeStatus} onClose={() => setActiveStatus(null)} />
            <MemoryModal isOpen={isMemoryModalOpen} onClose={() => setIsMemoryModalOpen(false)} memories={memories} onTogglePin={handleToggleMemoryPin} />
            <QuestDetailModal quest={activeQuest} onClose={() => setActiveQuest(null)} />
            <KnowledgeBaseModal
                isOpen={isKnowledgeModalOpen}
                onClose={() => setIsKnowledgeModalOpen(false)}
                pc={Object.values(knownEntities).find(p => p.type === 'pc')}
                knownEntities={knownEntities}
                onEntityClick={handleEntityClick}
                turnCount={turnCount}
            />
            <CustomRulesModal
                isOpen={isCustomRulesModalOpen}
                onClose={() => setIsCustomRulesModalOpen(false)}
                onSave={onSaveRulesClick}
                currentRules={customRules}
                onOpenChangeWritingStyle={() => setIsChangeWritingStyleModalOpen(true)}
            />
            <ChangeWritingStyleModal
                isOpen={isChangeWritingStyleModalOpen}
                onClose={() => setIsChangeWritingStyleModalOpen(false)}
                onConfirm={(newStyle) => {
                    setIsChangeWritingStyleModalOpen(false);
                    handleChangeWritingStyle(newStyle);
                }}
                currentStyle={worldData.aiWritingStyle}
            />
        </div>
    );
};