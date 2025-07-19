


import React, { useState, useRef } from 'react';
import {
    SpinnerIcon, SparklesIcon, SaveIcon, FileIcon, ArrowLeftIcon, BookOpenIcon,
    UserIcon, PencilIcon, DiamondIcon, PlusIcon, HomeIcon, ArchiveIcon,
    BrainIcon, MemoryIcon, InfoIcon, RefreshIcon, PinIcon, ExclamationIcon,
    CrossIcon, DocumentAddIcon
} from './Icons.tsx';
import * as GameIcons from './GameIcons.tsx';
import { Entity, Status, Quest, Memory, KnownEntities, CustomRule, EntityType } from '../types.ts';
import { getIconForEntity, getIconForStatus, getStatusTextColor, getStatusBorderColor, getStatusFontWeight, getIconForQuest } from '../utils.tsx';
import { useAI } from '../AIProvider.tsx';
import { AI_WRITING_STYLES } from '../constants.ts';
import { MBTI_PERSONALITIES } from '../data/mbti.ts';


// --- Suggestion Modal Component ---
export const SuggestionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    suggestions: string[];
    onSelect: (suggestion: string) => void;
    title: string;
}> = ({ isOpen, onClose, suggestions, onSelect, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white/90 dark:bg-[#252945]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                    {suggestions.length > 0 ? (
                        <ul className="space-y-2">
                            {suggestions.map((s, index) => (
                                <li
                                    key={index}
                                    onClick={() => onSelect(s)}
                                    className="p-3 bg-slate-100 dark:bg-[#373c5a] rounded-md hover:bg-purple-600 dark:hover:bg-purple-600 hover:text-white cursor-pointer transition-colors duration-200 text-sm text-slate-800 dark:text-gray-200"
                                >
                                    {s}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center">Không có gợi ý nào.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Confirmation Modal Component ---
export const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white/90 dark:bg-[#252945]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-md text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-600">
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <div className="p-6 text-sm text-slate-700 dark:text-gray-300">
                    {message}
                </div>
                <div className="p-3 bg-slate-50/80 dark:bg-[#1f2238]/80 rounded-b-lg flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white text-sm font-semibold transition-colors duration-200"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md text-white text-sm font-semibold transition-colors duration-200"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- API Settings Modal ---
export const ApiSettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const { apiKeys, isUsingDefaultKey, saveApiKeys, useDefaultKey } = useAI();
    if (!isOpen) return null;
    
    const [keysInput, setKeysInput] = useState(isUsingDefaultKey ? '' : apiKeys.join('\n'));

    const handleSaveClick = () => {
        const keys = keysInput.split('\n').map(k => k.trim()).filter(Boolean);
        if (keys.length > 0) {
            saveApiKeys(keys);
            onClose();
        }
    };

    const handleDefaultClick = () => {
        useDefaultKey();
        onClose();
    };

    const newKeysArray = keysInput.split('\n').map(k => k.trim()).filter(Boolean);
    const hasChanged = JSON.stringify(newKeysArray) !== JSON.stringify(apiKeys);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold mb-4 text-center text-purple-600 dark:text-purple-300" style={{ textShadow: '0 0 8px rgba(192, 132, 252, 0.5)' }}>Thiết Lập Nguồn AI</h2>
                <div className="bg-white/90 dark:bg-[#252945]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl p-6 space-y-6">

                    {/* Default AI Section */}
                    <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                        <p className="font-semibold text-sm mb-3 text-slate-800 dark:text-gray-300">Nguồn AI Mặc Định</p>
                        <button
                            onClick={handleDefaultClick}
                            disabled={isUsingDefaultKey}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-cyan-600 text-white font-semibold rounded-md shadow-md hover:bg-cyan-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:bg-slate-500 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Sử Dụng Gemini AI Mặc Định
                        </button>
                        {isUsingDefaultKey && <p className="text-xs text-green-500 dark:text-green-400 mt-2 px-1 text-center">Đang hoạt động</p>}
                    </div>

                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">hoặc</div>

                    {/* Custom API Key Section */}
                    <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                        <p className="font-semibold text-sm mb-2 text-slate-800 dark:text-gray-300">Sử Dụng API Key Của Bạn</p>
                        <label htmlFor="api-key-input" className="sr-only">Nhập API Key Gemini của bạn (mỗi key một dòng)</label>
                        <textarea
                            id="api-key-input"
                            rows={5}
                            placeholder="Nhập một hoặc nhiều API Key Gemini, mỗi key một dòng ví dụ 
apikey1
apikey2
apikeyN
                            "
                            value={keysInput}
                            onChange={(e) => setKeysInput(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                            API Key sẽ được lưu cục bộ. Ứng dụng sẽ tự động xoay vòng key nếu một key gặp lỗi (mỗi key 1 dòng, chép xong key 1 thì bấm Shift + Enter rồi chép key 2... không ghi chấm phẩy giữ các key ).
                        </p>
                        <button
                            onClick={handleSaveClick}
                            disabled={!keysInput.trim() || (!hasChanged && !isUsingDefaultKey)}
                            className="w-full mt-3 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-md text-white text-base font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-500 disabled:cursor-not-allowed"
                        >
                            Lưu và Sử Dụng Các Key Này
                        </button>
                        {!isUsingDefaultKey && <p className="text-xs text-green-500 dark:text-green-400 mt-2 px-1 text-center">Đang hoạt động</p>}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-slate-600 dark:bg-slate-700 hover:bg-slate-500 dark:hover:bg-slate-600 rounded-md text-white text-base font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Status Detail Modal ---
export const StatusDetailModal: React.FC<{ status: Status | null; onClose: () => void; }> = ({ status, onClose }) => {
    if (!status) return null;

    const textColor = getStatusTextColor(status);
    const borderColor = getStatusBorderColor(status).replace('/50', '/80');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className={`bg-white/90 dark:bg-[#2a2f4c]/90 backdrop-blur-sm border-2 ${borderColor} rounded-lg shadow-2xl w-full max-w-md text-slate-900 dark:text-white`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`p-4 border-b-2 ${borderColor} flex justify-between items-center`}>
                    <h3 className={`text-xl font-bold ${textColor} flex items-center gap-2`}>
                        <span className="w-6 h-6">{getIconForStatus(status)}</span>
                        {status.name}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="p-6 space-y-4 text-slate-700 dark:text-gray-300">
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-gray-100 text-sm uppercase tracking-wider mb-1">Mô tả</p>
                        <p className="italic text-base">"{status.description || 'Không có mô tả chi tiết.'}"</p>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700/60 mt-4 pt-4 space-y-3">
                        {status.effects && <p><strong className="font-semibold text-slate-800 dark:text-gray-100 w-32 inline-block">Hiệu ứng:</strong> {status.effects}</p>}
                        {status.duration && <p><strong className="font-semibold text-slate-800 dark:text-gray-100 w-32 inline-block">Thời gian:</strong> {status.duration}</p>}
                        {status.cureConditions && <p><strong className="font-semibold text-slate-800 dark:text-gray-100 w-32 inline-block">Cách chữa trị:</strong> {status.cureConditions}</p>}
                        {status.source && <p><strong className="font-semibold text-slate-800 dark:text-gray-100 w-32 inline-block">Nguồn gốc:</strong> {status.source}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Quest Detail Modal ---
export const QuestDetailModal: React.FC<{ quest: Quest | null; onClose: () => void; }> = ({ quest, onClose }) => {
    if (!quest) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white/90 dark:bg-[#2a2f4c]/90 backdrop-blur-sm border-2 border-yellow-400/80 rounded-lg shadow-2xl w-full max-w-lg text-slate-900 dark:text-white"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b-2 border-yellow-400/80 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                        <span className="w-6 h-6">{getIconForQuest(quest)}</span>
                        {quest.title}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="p-5 space-y-4 text-slate-700 dark:text-gray-300 max-h-[60vh] overflow-y-auto">
                    <p className="italic">{quest.description}</p>

                    <div className="mt-4 pt-4 border-t border-yellow-500/30">
                        <h4 className="font-semibold text-slate-800 dark:text-gray-100 mb-2">Mục tiêu:</h4>
                        <ul className="space-y-1.5 list-inside">
                            {quest.objectives.map((obj, index) => (
                                <li key={index} className={`flex items-center ${obj.completed ? 'text-gray-500 line-through' : 'text-yellow-800 dark:text-yellow-100'}`}>
                                    <span className="mr-3">{obj.completed ? '✅' : '🟡'}</span>
                                    <span>{obj.description}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-4 pt-4 border-t border-yellow-500/30 grid grid-cols-2 gap-4 text-sm">
                        {quest.giver && <p><strong className="font-semibold text-slate-800 dark:text-gray-100 block">Người giao:</strong> {quest.giver}</p>}
                        <p><strong className="font-semibold text-slate-800 dark:text-gray-100 block">Trạng thái:</strong> <span className="capitalize">{quest.status}</span></p>
                        {quest.reward && <p className="col-span-2"><strong className="font-semibold text-slate-800 dark:text-gray-100 block">Phần thưởng:</strong> {quest.reward}</p>}
                    </div>

                </div>
            </div>
        </div>
    );
};


// --- Entity Info Modal ---
export const EntityInfoModal: React.FC<{
    entity: Entity | null;
    onClose: () => void;
    onUseItem: (itemName: string) => void;
    onLearnItem: (itemName: string) => void;
    onEquipItem: (itemName: string) => void;
    onUnequipItem: (itemName: string) => void;
    statuses: Status[];
    onStatusClick: (status: Status) => void;
}> = ({ entity, onClose, onUseItem, onLearnItem, onEquipItem, onUnequipItem, statuses, onStatusClick }) => {
    if (!entity) return null;

    const typeColors: { [key in EntityType | string]: string } = {
        pc: 'text-yellow-600 dark:text-yellow-400',
        npc: 'text-blue-600 dark:text-blue-400',
        companion: 'text-blue-600 dark:text-blue-400',
        location: 'text-green-600 dark:text-green-400',
        faction: 'text-red-700 dark:text-red-500',
        item: 'text-amber-700 dark:text-amber-300',
        skill: 'text-amber-700 dark:text-amber-300',
        concept: 'text-purple-600 dark:text-purple-400'
    };
    const borderColor: { [key in EntityType | string]: string } = {
        pc: 'border-yellow-400',
        npc: 'border-blue-400',
        companion: 'border-blue-400',
        location: 'border-green-400',
        faction: 'border-red-500',
        item: 'border-amber-400',
        skill: 'border-amber-400',
        concept: 'border-purple-400'
    };
    
    const stateTextMap: {[key: string]: string} = {
        dead: 'Đã Chết',
        broken: 'Bị Hỏng',
        destroyed: 'Bị Phá Hủy'
    };

    const isPcsItem = entity.type === 'item' && entity.owner === 'pc';
    const isItemBroken = entity.state === 'broken' || entity.state === 'destroyed';
    const isLearnableItem = isPcsItem && entity.learnable;
    const isUsableItem = isPcsItem && entity.usable;
    const isEquippableItem = isPcsItem && entity.equippable;
    const npcStatuses = statuses.filter(s => s.owner === entity.name);
    
    const mbtiDetails = entity.personalityMbti && MBTI_PERSONALITIES[entity.personalityMbti] 
        ? MBTI_PERSONALITIES[entity.personalityMbti] 
        : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className={`bg-white/90 dark:bg-[#2a2f4c]/90 backdrop-blur-sm border-2 ${borderColor[entity.type] || 'border-slate-600'} rounded-lg shadow-2xl w-full max-w-lg text-slate-900 dark:text-white`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`p-4 border-b-2 ${borderColor[entity.type] || 'border-slate-600'} flex justify-between items-center`}>
                    <h3 className={`text-xl font-bold ${typeColors[entity.type] || 'text-slate-900 dark:text-white'} flex items-center gap-2`}>
                        <span className="w-6 h-6">{getIconForEntity(entity)}</span>
                        {entity.name}
                        {entity.equipped && <span className="text-xs text-green-400 dark:text-green-500 font-normal italic">(Đang trang bị)</span>}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="p-5 space-y-3 text-slate-700 dark:text-gray-300 max-h-[60vh] overflow-y-auto">
                    <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Loại:</strong> <span className="capitalize">{entity.type}</span></p>
                    {entity.state && stateTextMap[entity.state] && (
                         <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Trạng thái:</strong> <span className="font-bold text-red-600 dark:text-red-400">{stateTextMap[entity.state]}</span></p>
                    )}
                    {entity.personality && <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Tính cách (Bề ngoài):</strong> {entity.personality}</p>}

                    {mbtiDetails && (
                        <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">Tính cách (Cốt lõi - {entity.personalityMbti}): {mbtiDetails.title}</h4>
                            <p className="mt-1 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{mbtiDetails.description}</p>
                            <p className="mt-2 italic text-purple-700 dark:text-purple-300 bg-purple-500/10 p-2 rounded whitespace-pre-wrap">{mbtiDetails.example}</p>
                        </div>
                    )}

                    {entity.type === 'npc' && Array.isArray(entity.skills) && entity.skills.length > 0 && (
                        <div className="mt-2">
                            <strong className="font-semibold text-slate-800 dark:text-gray-100">Kỹ năng:</strong>
                            <ul className="list-disc list-inside pl-2 mt-1">
                                {entity.skills.map((skillName: string) => (
                                    <li key={skillName} className="text-sm">
                                        {skillName}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {npcStatuses.length > 0 && (
                        <div className="mt-2">
                            <strong className="font-semibold text-slate-800 dark:text-gray-100">Hiệu ứng hiện tại:</strong>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {npcStatuses.map(status => (
                                    <button
                                        key={status.name}
                                        onClick={() => onStatusClick(status)}
                                        className={`px-2 py-1 border rounded-md transition-colors duration-200 flex items-center gap-1.5 ${getStatusBorderColor(status)} hover:bg-slate-200 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 ${getStatusBorderColor(status).replace('border-', 'ring-').replace('/50', '')}`}
                                    >
                                        <span className="w-4 h-4">{getIconForStatus(status)}</span>
                                        <span className={`${getStatusTextColor(status)} ${getStatusFontWeight(status)} text-sm`}>
                                            {status.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {entity.gender && <p className="mt-2"><strong className="font-semibold text-slate-800 dark:text-gray-100">Giới tính:</strong> {entity.gender}</p>}
                    {entity.age && <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Tuổi:</strong> {entity.age}</p>}
                    {entity.relationship && <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Quan hệ:</strong> {entity.relationship}</p>}
                    {entity.realm && <p><strong className="font-semibold text-slate-800 dark:text-gray-100">{entity.type === 'skill' ? 'Cảnh giới Công Pháp:' : 'Cảnh giới:'}</strong> {entity.realm}</p>}
                    {typeof entity.durability === 'number' &&
                        <p>
                            <strong className="font-semibold text-slate-800 dark:text-gray-100">Độ bền:</strong>
                            <span className={entity.durability <= 0 ? 'text-red-600 font-bold' : ''}>
                                {` ${entity.durability} / 100 `}
                                {entity.durability <= 0 && <span className="ml-2">(Hỏng)</span>}
                            </span>
                        </p>
                    }
                    {typeof entity.uses === 'number' && <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Số lần dùng:</strong> {entity.uses}</p>}
                    <p><strong className="font-semibold text-slate-800 dark:text-gray-100">Mô tả:</strong> {entity.description || 'Chưa có mô tả.'}</p>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60 flex flex-col space-y-2">
                        {isEquippableItem && (
                            !entity.equipped ? (
                                <button
                                    onClick={() => onEquipItem(entity.name)}
                                    disabled={isItemBroken}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                                >
                                    Trang bị
                                </button>
                            ) : (
                                <button
                                    onClick={() => onUnequipItem(entity.name)}
                                    className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded transition-colors"
                                >
                                    Tháo ra
                                </button>
                            )
                        )}
                        {isLearnableItem && (
                            <button
                                onClick={() => onLearnItem(entity.name)}
                                 disabled={isItemBroken}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                Học Công Pháp
                            </button>
                        )}
                        {isUsableItem && (
                            <button
                                onClick={() => onUseItem(entity.name)}
                                disabled={isItemBroken || (typeof entity.uses === 'number' && entity.uses <= 0)}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                Sử dụng
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Memory Modal Component ---
export const MemoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    memories: Memory[];
    onTogglePin: (index: number) => void;
}> = ({ isOpen, onClose, memories, onTogglePin }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white/90 dark:bg-[#252945]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-lg text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Dòng Ký Ức</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                    {memories.length > 0 ? (
                        <ul className="space-y-3">
                            {memories.map((mem, index) => (
                                <li key={index} className="flex items-start justify-between gap-3 text-sm text-slate-700 dark:text-gray-300 border-l-2 border-purple-500 pl-3 py-1">
                                    <span>{mem.text}</span>
                                    <button
                                        onClick={() => onTogglePin(index)}
                                        className={`p-1 rounded-full transition-colors ${mem.pinned ? 'bg-yellow-400 text-slate-800' : 'bg-slate-500 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-white'}`}
                                        aria-label={mem.pinned ? 'Bỏ ghim' : 'Ghim'}
                                    >
                                        <PinIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">Chưa có ký ức mới.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Knowledge Base Modal ---
export const KnowledgeBaseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    pc: Entity | undefined;
    knownEntities: KnownEntities;
    onEntityClick: (entityName: string) => void;
    turnCount: number;
}> = ({ isOpen, onClose, pc, knownEntities, onEntityClick, turnCount }) => {
    if (!isOpen) return null;

    const allEntities = Object.values(knownEntities);
    const pcLearnedSkillNames = new Set(pc?.learnedSkills || []);

    const categorizedEntities = {
        pc_skills: allEntities.filter(e => e.type === 'skill' && pcLearnedSkillNames.has(e.name)),
        inventory: allEntities.filter(e => e.type === 'item' && e.owner === 'pc'),
        npc: allEntities.filter(e => e.type === 'npc' && e.name !== pc?.name),
        companion: allEntities.filter(e => e.type === 'companion'),
        location: allEntities.filter(e => e.type === 'location'),
        faction: allEntities.filter(e => e.type === 'faction'),
        skill_encyclopedia: allEntities.filter(e => e.type === 'skill'),
        item_encyclopedia: allEntities.filter(e => e.type === 'item'),
        concept: allEntities.filter(e => e.type === 'concept'),
    };

    const categoryTitles: { [key: string]: string } = {
        pc_skills: "Kỹ năng & Công pháp (Đã học)",
        inventory: "Hành Trang Nhân Vật",
        npc: "Nhân vật đã gặp",
        location: "Địa điểm đã biết",
        item_encyclopedia: "Bách Khoa Vật Phẩm",
        skill_encyclopedia: "Bách Khoa Kỹ Năng",
        faction: "Thế lực & Tổ chức",
        companion: "Đồng hành",
        concept: "Khái Niệm & Quy Tắc"
    };

    const handleItemClick = (name: string) => {
        onClose(); // Close this modal first
        setTimeout(() => onEntityClick(name), 100); // Open the entity detail modal after a short delay
    }

    const categoryOrder: string[] = ['pc_skills', 'inventory', 'npc', 'companion', 'location', 'faction', 'skill_encyclopedia', 'item_encyclopedia', 'concept'];


    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                className="bg-white/90 dark:bg-[#2a2f4c]/90 backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[85vh] text-slate-900 dark:text-white flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b-2 border-slate-200 dark:border-slate-600 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                        <BrainIcon className="w-6 h-6" />
                        Tri Thức Thế Giới
                    </h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none"><CrossIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-5 flex-grow overflow-y-auto">
                    {pc && (
                        <div className="bg-slate-200/50 dark:bg-slate-800/50 p-4 rounded-lg mb-6">
                            <h4 className="text-lg font-bold text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                                <span className="w-5 h-5">{getIconForEntity(pc)}</span>
                                {pc.name} - Lượt: {turnCount}
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 italic mt-1">"{pc.description}"</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2"><b>Tính cách:</b> {pc.personality}</p>
                            {pc.realm && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1"><b>Cảnh giới:</b> {pc.realm}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryOrder.map(categoryKey => {
                            const entities = categorizedEntities[categoryKey as keyof typeof categorizedEntities];
                            if (!entities || entities.length === 0) return null;
                            
                            entities.sort((a, b) => a.name.localeCompare(b.name));

                            return (
                                <div key={categoryKey}>
                                    <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 border-b border-purple-400/20 pb-1">{categoryTitles[categoryKey]}</h5>
                                    <ul className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                                        {entities.map(entity => (
                                            <li key={entity.name}>
                                                <button onClick={() => handleItemClick(entity.name)} className="text-left w-full text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-100 hover:underline text-sm flex items-center gap-2">
                                                    <span className="w-4 h-4 flex-shrink-0">{getIconForEntity(entity)}</span>
                                                    <span className={`${entity.state === 'dead' || entity.state === 'broken' ? 'line-through text-slate-500 dark:text-slate-500' : ''}`}>
                                                        {entity.name}
                                                        {categoryKey === 'inventory' && entity.equipped && <span className="text-xs text-green-400 dark:text-green-500 ml-2 font-normal italic">(Đang trang bị)</span>}
                                                        {(entity.type === 'skill' || entity.type === 'npc') && entity.realm ? ` (${entity.realm})` : ''}
                                                    </span>
                                                </button>
                                                {entity.type === 'npc' && Array.isArray(entity.skills) && entity.skills.length > 0 && (
                                                    <div className="pl-4 text-xs text-slate-600 dark:text-slate-400">
                                                        {entity.skills.map((skillName: string) => {
                                                            const skillEntity = knownEntities[skillName];
                                                            return (
                                                                <div key={skillName}>- {skillName} {skillEntity?.realm ? `(${skillEntity.realm})` : ''}</div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Custom Rules Modal ---
export const CustomRulesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (rules: CustomRule[]) => void;
    currentRules: CustomRule[];
    onOpenChangeWritingStyle: () => void;
}> = ({ isOpen, onClose, onSave, currentRules, onOpenChangeWritingStyle }) => {
    if (!isOpen) return null;
    const [rules, setRules] = useState<CustomRule[]>(currentRules);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        onSave(rules);
        onClose();
    };

    const handleAddRule = () => {
        setRules(prev => [...prev, { id: Date.now().toString(), content: '', isActive: true }]);
    };

    const handleDeleteRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
    };

    const handleRuleChange = (id: string, newContent: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, content: newContent } : r));
    };

    const handleToggleActive = (id: string, newIsActive: boolean) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: newIsActive } : r));
    };

    const handleSaveRulesToFile = () => {
        if (rules.length === 0) {
            alert("Không có luật nào để lưu.");
            return;
        }
        const jsonString = JSON.stringify(rules, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `AI-RolePlay-CustomRules-${timestamp}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleLoadRulesClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const loadedRules: CustomRule[] = JSON.parse(text);

                    if (Array.isArray(loadedRules) && loadedRules.every(r => typeof r === 'object' && r !== null && 'id' in r && 'content' in r && 'isActive' in r)) {
                        const existingIds = new Set(rules.map(r => r.id));
                        const rulesToAdd: CustomRule[] = [];

                        loadedRules.forEach(loadedRule => {
                            if (existingIds.has(loadedRule.id)) {
                                // ID conflict, generate a new one to allow adding.
                                rulesToAdd.push({ ...loadedRule, id: `${Date.now()}-${Math.random()}` });
                            } else {
                                rulesToAdd.push(loadedRule);
                            }
                        });

                        setRules(prev => [...prev, ...rulesToAdd]);
                        alert(`Đã tải và thêm thành công ${rulesToAdd.length} luật mới.`);
                    } else {
                        throw new Error('Định dạng tệp không hợp lệ.');
                    }
                }
            } catch (error) {
                console.error('Lỗi khi tải tệp luật:', error);
                alert('Không thể đọc tệp luật. Tệp có thể bị hỏng hoặc không đúng định dạng.');
            }
        };
        reader.readAsText(file);

        if (event.target) {
            event.target.value = '';
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4" onClick={onClose}>
            <div className="bg-white/90 dark:bg-[#252945]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-3xl h-full max-h-[85vh] flex flex-col text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><DocumentAddIcon className="w-6 h-6" /> Nạp Tri Thức & Quản Lý Luật Lệ</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="p-4 flex-grow overflow-y-auto space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Thêm luật lệ, vật phẩm, nhân vật, hoặc bất kỳ thông tin nào bạn muốn AI tuân theo. AI sẽ ưu tiên các luật lệ đang hoạt động,Luật lệ sẽ được áp dụng vào lượt sau.
                        <br />
                        Ví dụ: "Tạo ra một thanh kiếm tên là 'Hỏa Long Kiếm' có khả năng phun lửa, miêu tả chi tiết hoặc nhờ AI tự viết ra." hoặc "KHÓA HÀNH ĐỘNG TÙY Ý".
                    </p>
                    <button onClick={handleAddRule} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
                        <PlusIcon className="w-5 h-5" /> Thêm Luật Mới
                    </button>
                    {rules.map((rule, index) => (
                        <div key={rule.id} className="bg-slate-200/50 dark:bg-[#373c5a]/50 p-3 rounded-lg border border-slate-300 dark:border-slate-600 space-y-2">
                            <textarea
                                value={rule.content}
                                onChange={(e) => handleRuleChange(rule.id, e.target.value)}
                                placeholder={`Nội dung luật #${index + 1}...`}
                                className="w-full h-24 bg-white dark:bg-[#1f2238] border border-slate-300 dark:border-slate-500 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                            />
                            <div className="flex justify-between items-center">
                                <label htmlFor={`rule-toggle-${rule.id}`} className="flex items-center cursor-pointer">
                                    <input
                                        id={`rule-toggle-${rule.id}`}
                                        type="checkbox"
                                        checked={rule.isActive}
                                        onChange={(e) => handleToggleActive(rule.id, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-2 text-sm text-slate-700 dark:text-gray-300">Hoạt động</span>
                                </label>
                                <button onClick={() => handleDeleteRule(rule.id)} className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs font-semibold transition-colors">
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                    {rules.length === 0 && <p className="text-center text-slate-600 dark:text-slate-400 italic py-4">Chưa có luật lệ tùy chỉnh nào.</p>}
                </div>
                <div className="p-3 bg-slate-50/80 dark:bg-[#1f2238]/80 rounded-b-lg flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center space-x-2">
                         <button onClick={onOpenChangeWritingStyle} className="px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2">
                            <PencilIcon className="w-4 h-4" /> Thay Đổi Văn Phong AI
                        </button>
                        <button onClick={handleSaveRulesToFile} className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2">
                            <SaveIcon className="w-4 h-4" /> Lưu Luật Ra File
                        </button>
                        <button onClick={handleLoadRulesClick} className="px-3 py-2 bg-sky-600 hover:bg-sky-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2">
                            <FileIcon className="w-4 h-4" /> Tải Luật Từ File
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white text-sm font-semibold transition-colors duration-200">
                            Hủy
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-white text-sm font-semibold transition-colors duration-200">
                            Lưu Thay Đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Change Writing Style Modal ---
export const ChangeWritingStyleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (styleKey: string) => void;
    currentStyle: string;
}> = ({ isOpen, onClose, onConfirm, currentStyle }) => {
    if (!isOpen) return null;
    const [selectedStyle, setSelectedStyle] = useState(currentStyle);

    const handleConfirm = () => {
        onConfirm(selectedStyle);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[80] p-4" onClick={onClose}>
            <div className="bg-white/90 dark:bg-[#252945]/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-lg flex flex-col text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><PencilIcon className="w-5 h-5" /> Thay Đổi Văn Phong AI</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="p-3 bg-yellow-400/10 border border-yellow-500/30 rounded-md text-yellow-800 dark:text-yellow-200 text-sm">
                        <p className="font-bold mb-1 flex items-center gap-2"><ExclamationIcon className="w-5 h-5" /> Cảnh báo quan trọng!</p>
                        <p>Thay đổi văn phong sẽ tạo ra một bước ngoặt lớn trong cách kể chuyện. Thế giới và nhân vật sẽ được giữ nguyên, nhưng không khí và cách tường thuật của câu chuyện sẽ thay đổi kể từ lượt tiếp theo. </p>
                    </div>
                    <div>
                        <label htmlFor="aiWritingStyleSelect" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Chọn văn phong mới:</label>
                        <select
                            id="aiWritingStyleSelect"
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="default">Mặc định (Cân bằng)</option>
                            {Object.entries(AI_WRITING_STYLES).map(([key, { name }]) => (
                                <option key={key} value={key}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                 <div className="p-3 bg-slate-50/80 dark:bg-[#1f2238]/80 rounded-b-lg flex justify-end items-center">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 mr-3">
                        Hủy
                    </button>
                    <button onClick={handleConfirm} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white text-sm font-semibold transition-colors duration-200">
                        Xác Nhận Thay Đổi
                    </button>
                 </div>
            </div>
        </div>
    );
};
