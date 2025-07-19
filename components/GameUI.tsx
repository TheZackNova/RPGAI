import React, { useMemo } from 'react';
import { Status, Quest, Entity, KnownEntities, EntityType } from '../types.ts';
import { getIconForStatus, getStatusTextColor, getStatusFontWeight, getStatusBorderColor, getIconForQuest, getIconForEntity } from '../utils.tsx';
import { ComputerDesktopIcon, DevicePhoneMobileIcon, ChevronUpIcon, ChevronDownIcon } from './Icons.tsx';

// --- Status Display Component ---
export const StatusDisplay: React.FC<{
    statuses: Status[];
    onStatusClick: (status: Status) => void;
}> = ({ statuses, onStatusClick }) => {
    return (
        <div className="p-4">
            <h3 className="font-semibold mb-2 text-slate-800 dark:text-white">Trạng thái hiện tại:</h3>
            <div>
                {statuses.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {statuses.map(status => (
                            <button
                                key={status.name}
                                onClick={() => onStatusClick(status)}
                                className={`px-2 py-1 border rounded-md transition-colors duration-200 flex items-center gap-1.5 ${getStatusBorderColor(status)} hover:bg-slate-300/50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 ${getStatusBorderColor(status).replace('border-', 'ring-').replace('/50', '')}`}
                            >
                                <span className="w-4 h-4">{getIconForStatus(status)}</span>
                                <span className={`${getStatusTextColor(status)} ${getStatusFontWeight(status)} text-sm`}>
                                    {status.name}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : <p className="text-sm text-slate-600 dark:text-slate-400">Đang trong tình trạng bình thường.</p>}
            </div>
        </div>
    );
};

// --- Quest Log Component ---
export const QuestLog: React.FC<{ quests: Quest[]; onQuestClick: (quest: Quest) => void }> = ({ quests, onQuestClick }) => {
    const activeQuests = quests.filter(q => q.status === 'active');
    const finishedQuests = quests.filter(q => q.status !== 'active');

    return (
        <div className="p-4">
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2 border-b border-yellow-400/20 pb-1">Đang Thực Hiện</h4>
                    {activeQuests.length > 0 ? (
                        <ul className="space-y-2">
                            {activeQuests.map(quest => (
                                <li key={quest.title} onClick={() => onQuestClick(quest)} className="text-sm p-2 bg-yellow-400/10 dark:bg-yellow-500/10 border-l-4 border-yellow-600 dark:border-yellow-400 rounded-r-md hover:bg-yellow-400/20 dark:hover:bg-yellow-500/20 transition-colors cursor-pointer">
                                    <p className="font-semibold text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                                        <span className="w-4 h-4">{getIconForQuest(quest)}</span>
                                        {quest.title}
                                    </p>
                                    <p className="text-xs text-yellow-800/80 dark:text-yellow-200/80 pl-6 mt-1">- {quest.objectives.find(o => !o.completed)?.description || "Hoàn thành các mục tiêu."}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-xs text-slate-600 dark:text-slate-400 pl-2 italic">Không có nhiệm vụ nào đang hoạt động.</p>}
                </div>

                {finishedQuests.length > 0 && (
                    <div className="pt-2">
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 border-b border-slate-300 dark:border-slate-600 pb-1">Đã Kết Thúc</h4>
                        <ul className="space-y-2">
                            {finishedQuests.sort((a, b) => a.title.localeCompare(b.title)).map(quest => (
                                <li key={quest.title} onClick={() => onQuestClick(quest)} className="text-sm p-2 bg-slate-200/50 dark:bg-slate-700/50 border-l-4 border-slate-400 dark:border-slate-500 rounded-r-md hover:bg-slate-300/50 dark:hover:bg-slate-600/50 transition-colors cursor-pointer opacity-70">
                                    <p className={`font-semibold ${quest.status === 'completed' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'} flex items-center gap-2`}>
                                        <span className="w-4 h-4">{getIconForQuest(quest)}</span>
                                        <span className="line-through">{quest.title}</span>
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Party Member Tab Content ---
export const PartyMemberTab: React.FC<{
    party: Entity[];
    onMemberClick: (entityName: string) => void;
}> = ({ party, onMemberClick }) => (
    <div className="p-4">
        <h3 className="font-semibold mb-2 text-slate-800 dark:text-white">Thành viên tổ đội:</h3>
        <div>
            {party.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {party.map(member => (
                        <button
                            key={member.name}
                            onClick={() => onMemberClick(member.name)}
                            className="px-3 py-1.5 bg-cyan-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/50 rounded-md text-sm hover:bg-blue-500/30 dark:hover:bg-blue-500/40 transition-colors flex items-center gap-2"
                        >
                            <span className="w-4 h-4">{getIconForEntity(member)}</span>
                            {member.name}
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">Tổ đội trống.</p>
            )}
        </div>
    </div>
);


// --- Interactive Text Renderer ---
export const InteractiveText: React.FC<{
    text: string;
    onEntityClick: (entityName: string) => void;
    knownEntities: KnownEntities;
}> = ({ text, onEntityClick, knownEntities }) => {
    const typeColors: { [key in EntityType | string]: string } = {
        pc: 'text-yellow-700 dark:text-yellow-400 font-bold',
        npc: 'text-blue-700 dark:text-blue-400 font-semibold',
        companion: 'text-blue-700 dark:text-blue-400 font-semibold',
        location: 'text-green-700 dark:text-green-400 font-semibold',
        faction: 'text-red-700 dark:text-red-500 font-semibold',
        item: 'am-kim', // custom class
        skill: 'am-kim', // custom class
        concept: 'text-purple-700 dark:text-purple-400 font-semibold'
    };

    const entityNames = useMemo(() =>
        Object.keys(knownEntities).sort((a, b) => b.length - a.length),
        [knownEntities]
    );

    const regex = useMemo(() => {
        if (entityNames.length === 0) {
            return /(\`.*?\`|\*\*⭐.*?\*⭐\*\*)/g;
        }
        const escapedNames = entityNames.map(name =>
            name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        );
        return new RegExp(`(${escapedNames.join('|')}|\`.*?\`|\\*\\*⭐.*?⭐\\*\\*)`, 'g');
    }, [entityNames]);

    const parts = text.split(regex);

    return (
        <div className="text-slate-900 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {parts.map((part, index) => {
                if (!part) return null;

                const isEntity = knownEntities[part];
                const isThought = part.startsWith('`') && part.endsWith('`');
                const isAnnouncement = part.startsWith('**⭐') && part.endsWith('⭐**');

                if (isAnnouncement) {
                    return (
                        <div key={index} className="p-3 bg-yellow-400/10 dark:bg-yellow-500/10 border-l-4 border-yellow-500 dark:border-yellow-400 rounded-r-md">
                            <p className="font-semibold text-yellow-700 dark:text-yellow-200">
                                <span className="mr-2">⭐</span>
                                {part.slice(3, -3).trim()}
                            </p>
                        </div>
                    );
                }

                if (isEntity) {
                    const entity = knownEntities[part];
                    const styleClass = typeColors[entity.type] || 'text-slate-900 dark:text-white font-semibold';
                    return (
                        <span
                            key={index}
                            onClick={() => onEntityClick(part)}
                            className={`${styleClass} cursor-pointer hover:underline transition-all`}
                        >
                            <span className="inline-block w-[1em] h-[1em] align-middle -mt-px mr-1.5">{getIconForEntity(entity)}</span>
                            {part}
                        </span>
                    );
                }

                if (isThought) {
                    return <i key={index} className="text-slate-600 dark:text-slate-400">{part.slice(1, -1)}</i>;
                }

                return <span key={index}>{part}</span>;
            })}
        </div>
    );
};


// --- Customization Footer Component ---
export const CustomizationFooter: React.FC<{
    fontFamily: string;
    setFontFamily: (font: string) => void;
    fontSize: string;
    setFontSize: (size: string) => void;
    isMobileView: boolean;
    onToggleMobileView: () => void;
    isChoicesPanelVisible: boolean;
    onToggleChoicesPanel: () => void;
}> = ({ fontFamily, setFontFamily, fontSize, setFontSize, isMobileView, onToggleMobileView, isChoicesPanelVisible, onToggleChoicesPanel }) => {

    const fontOptions = [
        { value: 'font-sans', label: 'Inter' },
        { value: 'font-serif', label: 'Merriweather' },
        { value: 'font-lora', label: 'Lora' },
        { value: 'font-mono', label: 'Roboto Mono' },
        { value: 'font-source-code', label: 'Source Code Pro' },
    ];

    const sizeOptions = [
        { value: 'text-xs', label: 'Cực nhỏ' },
        { value: 'text-sm', label: 'Nhỏ' },
        { value: 'text-base', label: 'Vừa' },
        { value: 'text-lg', label: 'Lớn' },
        { value: 'text-xl', label: 'Rất lớn' },
        { value: 'text-2xl', label: 'Cực lớn' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1f2238]/80 backdrop-blur-sm border-t border-slate-300 dark:border-slate-700 p-2 z-[100]">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-4 md:gap-x-8 gap-y-2">
                {/* Font Family Selector */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="font-family" className="text-sm font-medium text-slate-700 dark:text-slate-300">Phông chữ:</label>
                    <select
                        id="font-family"
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1 px-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>

                {/* Font Size Selector */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="font-size" className="text-sm font-medium text-slate-700 dark:text-slate-300">Cỡ chữ:</label>
                    <select
                        id="font-size"
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        className="bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1 px-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {sizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>

                {/* Mobile View Toggle Button */}
                <button
                    onClick={onToggleMobileView}
                    className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    title={isMobileView ? "Chuyển sang giao diện máy tính" : "Chuyển sang giao diện điện thoại"}
                >
                    {isMobileView ? (
                        <ComputerDesktopIcon className="w-5 h-5" />
                    ) : (
                        <DevicePhoneMobileIcon className="w-5 h-5" />
                    )}
                    <span className="hidden md:inline">{isMobileView ? 'Desktop' : 'Mobile'}</span>
                </button>

                 {/* Choices Panel Toggle */}
                 {isMobileView && (
                    <button
                        onClick={onToggleChoicesPanel}
                        className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        title={isChoicesPanelVisible ? "Ẩn bảng lựa chọn" : "Hiện bảng lựa chọn"}
                    >
                        {isChoicesPanelVisible ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                    </button>
                )}
            </div>
        </div>
    );
};