



import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useAI } from '../AIProvider.tsx';
import { WorldCreationData, StartingSkill } from '../types.ts';
import { personalityOptions, AI_WRITING_STYLES } from '../constants.ts';
import { mbtiOptions, MBTI_PERSONALITIES, MbtiPersonality } from '../data/mbti.ts';
import { SuggestionModal } from './Modals.tsx';
import { 
    ArrowLeftIcon, BookOpenIcon, UserIcon, PencilIcon, DiamondIcon, SpinnerIcon, SparklesIcon, PlusIcon, CrossIcon
} from './Icons.tsx';

const FormLabel: React.FC<{ htmlFor?: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">{children}</label>
);

const CustomSelect: React.FC<{ value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, name: string, children: React.ReactNode }> = ({ value, onChange, name, children }) => (
    <select name={name} value={value} onChange={onChange} className="w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
        {children}
    </select>
);

interface SuggestButtonProps {
    onClick: () => void;
    isLoading: boolean;
    disabled: boolean;
    colorClass: string;
}

const SuggestButton: React.FC<SuggestButtonProps> = ({ onClick, isLoading, disabled, colorClass }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={isLoading || disabled}
        className={`flex-shrink-0 px-3 py-2 text-sm font-semibold text-white rounded-r-md transition-colors duration-200 disabled:bg-slate-500 disabled:cursor-wait ${colorClass}`}
        style={{ minWidth: '80px' }}
    >
        {isLoading ? <SpinnerIcon className="w-5 h-5 mx-auto" /> : 'Gợi Ý'}
    </button>
);


export const CreateWorld: React.FC<{ onBack: () => void; onStartGame: (data: WorldCreationData) => void; }> = ({ onBack, onStartGame }) => {
    const { makeApiCall, isAiReady, apiKeyError } = useAI();
    const [formData, setFormData] = useState<WorldCreationData>({
        genre: '',
        worldDetail: '',
        writingStyle: 'second_person',
        difficulty: 'normal',
        allowNsfw: false,
        characterName: '',
        customPersonality: '',
        personalityFromList: '',
        personalityMbti: '',
        gender: 'ai_decides',
        bio: '',
        startSkills: [],
        addGoal: false,
        aiWritingStyle: 'default',
    });
    
    const [selectedMbtiDetails, setSelectedMbtiDetails] = useState<MbtiPersonality | null>(null);

    const [currentSkillName, setCurrentSkillName] = useState('');
    const [currentSkillDescription, setCurrentSkillDescription] = useState('');

    const [loadingStates, setLoadingStates] = useState({
        genre: false,
        worldDetail: false,
        character: false,
    });
    const [isAnySuggestionLoading, setIsAnySuggestionLoading] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);
    const suggestionLock = useRef(false);

    const [genreSuggestions, setGenreSuggestions] = useState<string[]>([]);
    const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);

    useEffect(() => {
        if (formData.personalityMbti && MBTI_PERSONALITIES[formData.personalityMbti]) {
            setSelectedMbtiDetails(MBTI_PERSONALITIES[formData.personalityMbti]);
        } else {
            setSelectedMbtiDetails(null);
        }
    }, [formData.personalityMbti]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'customPersonality') {
            setFormData(prev => ({
                ...prev,
                customPersonality: value,
                personalityFromList: '' // Clear list selection when typing custom
            }));
        } else if (name === 'personalityFromList') {
            setFormData(prev => ({
                ...prev,
                personalityFromList: value,
                customPersonality: '' // Clear custom input when selecting from list
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: isCheckbox ? checked : value
            }));
        }
    };
    
    const handleAddSkill = () => {
        if (!currentSkillName.trim()) {
            return;
        }
        setFormData(prev => ({
            ...prev,
            startSkills: [...prev.startSkills, { name: currentSkillName.trim(), description: currentSkillDescription.trim() }]
        }));
        setCurrentSkillName('');
        setCurrentSkillDescription('');
    };

    const handleDeleteSkill = (index: number) => {
        setFormData(prev => ({
            ...prev,
            startSkills: prev.startSkills.filter((_, i) => i !== index)
        }));
    };

    const handleGenreSuggestion = async () => {
        if (!isAiReady) {
            setSuggestionError(apiKeyError || "AI chưa sẵn sàng. Vui lòng kiểm tra thiết lập API Key.");
            return;
        }
        if (suggestionLock.current) return;
        suggestionLock.current = true;
        setIsAnySuggestionLoading(true);
        setLoadingStates(prev => ({ ...prev, genre: true }));
        setSuggestionError(null);
        const prompt = 'Gợi ý 5 chủ đề/bối cảnh độc đáo (tiếng Việt) cho game phiêu lưu văn bản, phong cách tiểu thuyết mạng. Mỗi cái trên một dòng.';

        try {
            const response = await makeApiCall({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const text = response.text.trim();
            const suggestions = text.split('\n').map(s => s.replace(/^[*-]\s*/, '').trim()).filter(Boolean);
            setGenreSuggestions(suggestions);
            setIsGenreModalOpen(true);
        } catch (error: any) {
            console.error('Error generating genre suggestions:', error);
            setSuggestionError(error.message || "Gặp lỗi khi tạo gợi ý. Vui lòng thử lại.");
            setGenreSuggestions([]);
        } finally {
            suggestionLock.current = false;
            setIsAnySuggestionLoading(false);
            setLoadingStates(prev => ({ ...prev, genre: false }));
        }
    };

    const handleWorldDetailSuggestion = async () => {
        if (!isAiReady) {
            setSuggestionError(apiKeyError || "AI chưa sẵn sàng. Vui lòng kiểm tra thiết lập API Key.");
            return;
        }
        if (suggestionLock.current) return;
        suggestionLock.current = true;
        setIsAnySuggestionLoading(true);
        setLoadingStates(prev => ({ ...prev, worldDetail: true }));
        setSuggestionError(null);

        const prompt = `Dựa trên thể loại "${formData.genre}" và ý tưởng "${formData.worldDetail}", hãy viết một bối cảnh thế giới chi tiết và hấp dẫn (khoảng 3-5 dòng) theo văn phong tiểu thuyết mạng Trung Quốc. Bối cảnh cần khơi gợi sự tò mò và giới thiệu một xung đột hoặc yếu tố đặc biệt của thế giới. AI tự kể tiếp. Ví dụ: "Giang Hồ hiểm ác đầy rẫy anh hùng hảo hán và ma đầu tàn bạo, nơi công pháp và bí tịch quyết định tất cả, hệ thống cho phép bạn đoạt lấy nội lực, kinh nghiệm chiến đấu từ các cao thủ chính tà, khiến bạn phải ẩn mình giữa vô vàn ân oán giang hồ và lựa chọn giữa chính đạo giả tạo hay ma đạo tàn khốc."`;

        try {
            const response = await makeApiCall({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const text = response.text.trim();
            setFormData(prev => ({ ...prev, worldDetail: text }));
        } catch (error: any) {
            console.error(`Error generating suggestion for world detail:`, error);
            setSuggestionError(error.message || "Gặp lỗi khi tạo gợi ý. Vui lòng thử lại.");
        } finally {
            suggestionLock.current = false;
            setIsAnySuggestionLoading(false);
            setLoadingStates(prev => ({ ...prev, worldDetail: false }));
        }
    };

    const handleCharacterSuggestion = async () => {
        if (!isAiReady) {
            setSuggestionError(apiKeyError || "AI chưa sẵn sàng. Vui lòng kiểm tra thiết lập API Key.");
            return;
        }
        if (suggestionLock.current) return;
        suggestionLock.current = true;
        setIsAnySuggestionLoading(true);
        setLoadingStates(prev => ({ ...prev, character: true }));
        setSuggestionError(null);

        const finalPersonality = formData.customPersonality || formData.personalityFromList;
        const prompt = `Dựa trên thông tin nhân vật sau, hãy tạo một tiểu sử và kỹ năng khởi đầu phù hợp cho game nhập vai văn bản:
- Tên nhân vật (do người dùng đặt): '${formData.characterName || 'Chưa có'}'
- Thể loại: '${formData.genre || 'Chưa có'}'
- Bối cảnh: '${formData.worldDetail || 'Chưa có'}'
- Giới tính: '${formData.gender}'
- Tính cách: '${finalPersonality || 'Chưa có'}'
Vui lòng tạo ra một tiểu sử ngắn (2-3 câu) và một kỹ năng khởi đầu phù hợp. KHÔNG được thay đổi tên nhân vật. Văn phong cần giống tiểu thuyết mạng. Trả về kết quả dưới dạng JSON với hai khóa: "bio" và một object "skill" chứa hai khóa con là "name" và "description".`;

        const characterSuggestionSchema = {
            type: Type.OBJECT,
            properties: {
                bio: { type: Type.STRING, description: 'Tiểu sử nhân vật gợi ý (2-3 câu, tiếng Việt).' },
                skill: {
                    type: Type.OBJECT,
                    description: 'Kỹ năng khởi đầu gợi ý.',
                    properties: {
                        name: { type: Type.STRING, description: 'Tên của kỹ năng.' },
                        description: { type: Type.STRING, description: 'Mô tả của kỹ năng.' }
                    },
                    required: ['name', 'description']
                }
            },
            required: ['bio', 'skill']
        };

        try {
            const response = await makeApiCall({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: characterSuggestionSchema,
                }
            });
            const responseText = response.text.trim();
            const suggestions = JSON.parse(responseText);

            setFormData(prev => ({
                ...prev,
                bio: suggestions.bio || '',
            }));
            
            if (suggestions.skill) {
                setCurrentSkillName(suggestions.skill.name || '');
                setCurrentSkillDescription(suggestions.skill.description || '');
            }

        } catch (error: any) {
            console.error('Error generating character suggestions:', error);
            setSuggestionError(error.message || "Gặp lỗi khi tạo gợi ý nhân vật. Vui lòng thử lại.");
        } finally {
            suggestionLock.current = false;
            setIsAnySuggestionLoading(false);
            setLoadingStates(prev => ({ ...prev, character: false }));
        }
    };

    return (
        <div className="bg-white/80 dark:bg-[#252945]/80 backdrop-blur-md border border-slate-300 dark:border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white font-sans overflow-y-auto" style={{ maxHeight: '95vh' }}>
            <button onClick={onBack} className="flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 mb-4">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Về Trang Chủ
            </button>
            <h1 className="text-3xl font-bold text-center mb-8 tracking-wide">Kiến Tạo Thế Giới</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 border border-slate-300 dark:border-slate-700 rounded-lg">
                    <h2 className="text-lg font-semibold flex items-center border-b border-slate-300 dark:border-slate-700 pb-2 mb-4">
                        <BookOpenIcon className="w-5 h-5 mr-3 text-pink-600 dark:text-pink-400" /> Bối Cảnh Truyện
                    </h2>
                    <div>
                        <FormLabel htmlFor="genre">Thể loại:</FormLabel>
                        <div className="flex items-center">
                            <input id="genre" name="genre" type="text" value={formData.genre} onChange={handleInputChange} placeholder="VD: Tiên hiệp, Huyền huyễn..." className="w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-l-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400 dark:placeholder-gray-400" />
                            <SuggestButton onClick={handleGenreSuggestion} isLoading={loadingStates.genre} disabled={isAnySuggestionLoading} colorClass="bg-pink-500 hover:bg-pink-600" />
                        </div>
                    </div>
                    <div>
                        <FormLabel htmlFor="worldDetail">Thế Giới/Bối Cảnh Chi Tiết:</FormLabel>
                        <div className="flex items-center">
                            <textarea id="worldDetail" name="worldDetail" value={formData.worldDetail} onChange={handleInputChange} placeholder="VD: Đại Lục Phong Vân..." rows={3} className="w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-l-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400 dark:placeholder-gray-400" />
                            <SuggestButton onClick={handleWorldDetailSuggestion} isLoading={loadingStates.worldDetail} disabled={isAnySuggestionLoading} colorClass="bg-pink-500 hover:bg-pink-600" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-4 border border-slate-300 dark:border-slate-700 rounded-lg">
                    <h2 className="text-lg font-semibold flex items-center border-b border-slate-300 dark:border-slate-700 pb-2 mb-4">
                        <UserIcon className="w-5 h-5 mr-3 text-sky-600 dark:text-sky-400" /> Nhân Vật Chính
                    </h2>
                    <div>
                        <FormLabel htmlFor="characterName">Danh Xưng/Tên:</FormLabel>
                        <input id="characterName" name="characterName" type="text" value={formData.characterName} onChange={handleInputChange} placeholder="VD: Diệp Phàm, Hàn Lập..." className="w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400 dark:placeholder-gray-400" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FormLabel htmlFor="personalityFromList">Tính Cách (Bề ngoài):</FormLabel>
                            <CustomSelect name="personalityFromList" value={formData.personalityFromList} onChange={handleInputChange}>
                                <option value="">Chọn tính cách có sẵn...</option>
                                {personalityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                            </CustomSelect>
                            <input name="customPersonality" type="text" value={formData.customPersonality} onChange={handleInputChange} placeholder="Hoặc nhập tính cách tùy ý" className={`w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400 dark:placeholder-gray-400 mt-2`} />
                        </div>
                        <div>
                           <FormLabel htmlFor="personalityMbti">Tính Cách (Cốt lõi - MBTI):</FormLabel>
                            <CustomSelect name="personalityMbti" value={formData.personalityMbti} onChange={handleInputChange}>
                                <option value="">Để AI quyết định</option>
                                {mbtiOptions.map(p => <option key={p.key} value={p.key}>{p.name}</option>)}
                            </CustomSelect>
                            {selectedMbtiDetails && (
                                <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{selectedMbtiDetails.title}</h4>
                                    <p className="mt-1 text-slate-600 dark:text-slate-300">{selectedMbtiDetails.description}</p>
                                    <p className="mt-2 italic text-purple-700 dark:text-purple-300 bg-purple-500/10 p-2 rounded">{selectedMbtiDetails.example}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <FormLabel>Giới Tính:</FormLabel>
                        <CustomSelect name="gender" value={formData.gender} onChange={handleInputChange}>
                            <option value="ai_decides">Để AI quyết định</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                        </CustomSelect>
                    </div>
                    <div>
                        <FormLabel htmlFor="bio">Sơ Lược Tiểu Sử:</FormLabel>
                        <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} placeholder="VD: Một phế vật mang huyết mạch thượng cổ..." rows={2} className="w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400 dark:placeholder-gray-400"></textarea>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Kỹ Năng Khởi Đầu (Tùy chọn)</h3>
                        <div className="space-y-2 bg-slate-200/50 dark:bg-slate-800/50 p-3 rounded-lg">
                            <FormLabel htmlFor="currentSkillName">Tên Kỹ năng:</FormLabel>
                            <input id="currentSkillName" name="currentSkillName" type="text" value={currentSkillName} onChange={(e) => setCurrentSkillName(e.target.value)} placeholder="VD: Thuật Ẩn Thân..." className="w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400 dark:placeholder-gray-400" />
                            
                            <FormLabel htmlFor="currentSkillDescription">Mô tả Kỹ năng:</FormLabel>
                            <textarea id="currentSkillDescription" name="currentSkillDescription" value={currentSkillDescription} onChange={(e) => setCurrentSkillDescription(e.target.value)} placeholder="VD: Che giấu khí tức, khó bị phát hiện hơn..." rows={2} className="w-full bg-slate-100 dark:bg-[#373c5a] border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400 dark:placeholder-gray-400" />
                            
                            <button type="button" onClick={handleAddSkill} disabled={!currentSkillName.trim()} className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-slate-500 disabled:cursor-not-allowed">
                                <PlusIcon className="w-5 h-5" /> Thêm Kỹ năng
                            </button>
                        </div>
                        {formData.startSkills.length > 0 && (
                            <div className="mt-2 space-y-2">
                                <h4 className="text-xs font-semibold uppercase text-slate-600 dark:text-gray-400">Danh sách Kỹ năng:</h4>
                                <ul className="space-y-1">
                                    {formData.startSkills.map((skill, index) => (
                                        <li key={index} className="flex items-center justify-between bg-slate-100 dark:bg-[#373c5a]/70 p-2 rounded-md text-sm">
                                            <span className="text-slate-800 dark:text-gray-200 font-medium">{skill.name}</span>
                                            <button type="button" onClick={() => handleDeleteSkill(index)} className="p-1 rounded-full text-red-500 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors">
                                                <CrossIcon className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleCharacterSuggestion}
                        disabled={isAnySuggestionLoading || !isAiReady}
                        className="w-full mt-3 flex items-center justify-center px-4 py-2.5 bg-sky-600 text-white font-semibold rounded-md shadow-md hover:bg-sky-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:bg-slate-500 disabled:cursor-wait"
                    >
                        {loadingStates.character ? <SpinnerIcon className="w-5 h-5 mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                        Gợi Ý Tiểu sử & Kỹ năng
                    </button>
                </div>

                <div className="lg:col-span-2 p-4 border border-slate-300 dark:border-slate-700 rounded-lg">
                    <h2 className="text-lg font-semibold flex items-center pb-2 mb-4">
                        <PencilIcon className="w-5 h-5 mr-3 text-yellow-600 dark:text-yellow-400" /> Cài đặt Văn phong
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FormLabel htmlFor="writingStyle">Ngôi kể:</FormLabel>
                            <CustomSelect name="writingStyle" value={formData.writingStyle} onChange={handleInputChange}>
                                <option value="second_person">Ngôi thứ hai - "Ngươi" là nhân vật chính</option>
                                <option value="first_person">Ngôi thứ nhất - Nhân vật chính xưng "Ta/Tôi"</option>
                            </CustomSelect>
                        </div>
                        <div>
                            <FormLabel htmlFor="aiWritingStyle">Văn Phong AI:</FormLabel>
                            <CustomSelect name="aiWritingStyle" value={formData.aiWritingStyle} onChange={handleInputChange}>
                                <option value="default">Mặc định (Cân bằng)</option>
                                {Object.entries(AI_WRITING_STYLES).map(([key, { name }]) => (
                                    <option key={key} value={key}>{name}</option>
                                ))}
                            </CustomSelect>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 p-4 border border-slate-300 dark:border-slate-700 rounded-lg">
                    <h2 className="text-lg font-semibold flex items-center pb-2 mb-4">
                        <DiamondIcon className="w-5 h-5 mr-3 text-red-600 dark:text-red-400" /> Độ Khó & Nội Dung
                    </h2>
                    <FormLabel>Chọn Độ Khó:</FormLabel>
                    <CustomSelect name="difficulty" value={formData.difficulty} onChange={handleInputChange}>
                        <option value="easy">Dễ - Tạo ra cho đủ số thôi</option>
                        <option value="normal">Thường - Cân bằng, phù hợp đa số</option>
                        <option value="hard">Khó - Thử thách cao, Muốn ăn hành</option>
                    </CustomSelect>
                    <div className="mt-4 flex items-center">
                        <input id="addGoal" name="addGoal" type="checkbox" checked={formData.addGoal} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-purple-600 focus:ring-purple-500" />
                        <label htmlFor="addGoal" className="ml-3 text-sm text-slate-700 dark:text-gray-300">Tự động tạo mục tiêu ban đầu</label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">AI sẽ tạo một nhiệm vụ khởi đầu dựa trên bối cảnh và tiểu sử của bạn.</p>

                    <div className="mt-4 flex items-center">
                        <input id="allowNsfw" name="allowNsfw" type="checkbox" checked={formData.allowNsfw} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-purple-600 focus:ring-purple-500" />
                        <label htmlFor="allowNsfw" className="ml-3 text-sm text-slate-700 dark:text-gray-300">Cho phép nội dung 18+ (Cực kỳ chi tiết)</label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">Khi được chọn, AI sẽ kể câu chuyện có tình tiết 18+ (có yếu tố bạo lực) và hành động tùy ý nsfw .</p>
                </div>


            </div>

            <div className="mt-8 flex flex-col items-center">
                {suggestionError && (
                    <p className="text-red-500 dark:text-red-400 text-sm mb-4 text-center">{suggestionError}</p>
                )}
                <button
                    onClick={() => onStartGame(formData)}
                    disabled={!isAiReady}
                    className="w-full max-w-lg bg-[#2dd4bf] hover:bg-[#14b8a6] text-slate-900 font-bold py-3 px-6 rounded-lg shadow-lg text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:bg-slate-500 disabled:cursor-not-allowed">
                    {isAiReady ? 'Khởi Tạo Thế Giới' : (apiKeyError || 'AI chưa sẵn sàng')}
                </button>
            </div>

            <SuggestionModal
                isOpen={isGenreModalOpen}
                onClose={() => setIsGenreModalOpen(false)}
                suggestions={genreSuggestions}
                onSelect={(suggestion) => {
                    setFormData(prev => ({ ...prev, genre: suggestion }));
                    setIsGenreModalOpen(false);
                }}
                title="Gợi ý thể loại"
            />
        </div>
    );
}
