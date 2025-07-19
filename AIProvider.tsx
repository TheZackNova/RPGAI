
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// --- AI Context for dependency injection ---
interface AIContextType {
    makeApiCall: (params: any) => Promise<GenerateContentResponse>;
    isAiReady: boolean;
    apiKeyError: string | null;
    isUsingDefaultKey: boolean;
    apiKeys: string[];
    saveApiKeys: (keys: string[]) => void;
    useDefaultKey: () => void;
    openSettings: () => void;
}

export const AIContext = createContext<AIContextType>({
    makeApiCall: () => Promise.reject(new Error("AI Provider not initialized")),
    isAiReady: false,
    apiKeyError: "AI Provider not initialized",
    isUsingDefaultKey: true,
    apiKeys: [],
    saveApiKeys: () => {},
    useDefaultKey: () => {},
    openSettings: () => {},
});

export const useAI = () => useContext(AIContext);

export const AIProvider: React.FC<{ children: React.ReactNode, onSettingsChange: (isOpen: boolean) => void }> = ({ children, onSettingsChange }) => {
    const [apiKeys, setApiKeys] = useState<string[]>(() => {
        const storedKeys = localStorage.getItem('userApiKeys');
        if (storedKeys) {
            try {
                const parsedKeys = JSON.parse(storedKeys);
                if (Array.isArray(parsedKeys)) {
                    return parsedKeys;
                }
            } catch (e) {
                console.error("Failed to parse userApiKeys from localStorage", e);
            }
        }
        const oldKey = localStorage.getItem('userApiKey');
        if (oldKey) {
            return [oldKey];
        }
        return [];
    });
    const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
    const [isUsingDefaultKey, setIsUsingDefaultKey] = useState(() => {
        return !localStorage.getItem('userApiKeys') && !localStorage.getItem('userApiKey');
    });

    const { isAiReady, apiKeyError } = useMemo(() => {
        const hasDefaultKey = !!process.env.API_KEY;
        const hasCustomKeys = apiKeys && apiKeys.length > 0 && apiKeys.some(k => k.trim() !== '');

        if (isUsingDefaultKey) {
            if (hasDefaultKey) {
                return { isAiReady: true, apiKeyError: null };
            } else {
                return { isAiReady: false, apiKeyError: "AI mặc định chưa được cấu hình." };
            }
        } else {
            if (hasCustomKeys) {
                return { isAiReady: true, apiKeyError: null };
            } else {
                return { isAiReady: false, apiKeyError: "Chưa có API Key nào được cung cấp. Vui lòng thêm key trong phần thiết lập." };
            }
        }
    }, [apiKeys, isUsingDefaultKey]);

    const makeApiCall = async (params: any): Promise<GenerateContentResponse> => {
        if (!isAiReady) {
            throw new Error(apiKeyError || "AI chưa sẵn sàng.");
        }

        if (isUsingDefaultKey) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                return await ai.models.generateContent(params);
            } catch (error) {
                console.error("Default API key failed:", error);
                throw new Error("API Key mặc định có vẻ không hợp lệ hoặc đã hết hạn mức.");
            }
        }

        const validKeys = apiKeys.filter(k => k.trim());
        if (validKeys.length === 0) {
            throw new Error("Không có API Key hợp lệ nào được cung cấp.");
        }

        for (let i = 0; i < validKeys.length; i++) {
            const keyIndexToTry = (currentKeyIndex + i) % validKeys.length;
            const key = validKeys[keyIndexToTry];

            try {
                const ai = new GoogleGenAI({ apiKey: key });
                const result = await ai.models.generateContent(params);

                if (keyIndexToTry !== currentKeyIndex) {
                    setCurrentKeyIndex(keyIndexToTry);
                }
                return result;
            } catch (error: any) {
                const message = error.toString().toLowerCase();
                const isKeyError = message.includes('api key not valid') || message.includes('permission denied') || (error.status && error.status === 429);

                if (isKeyError) {
                    console.warn(`API key tại vị trí ${keyIndexToTry} thất bại. Lý do: ${error.message}. Thử key tiếp theo.`);
                } else {
                    throw error;
                }
            }
        }

        throw new Error("Tất cả API Key được cung cấp đều đã thất bại. Vui lòng kiểm tra lại key và hạn mức sử dụng.");
    };

    const saveApiKeys = (newKeys: string[]) => {
        localStorage.setItem('userApiKeys', JSON.stringify(newKeys));
        localStorage.removeItem('userApiKey');
        setApiKeys(newKeys);
        setCurrentKeyIndex(0);
        setIsUsingDefaultKey(false);
    };

    const useDefaultKey = () => {
        localStorage.removeItem('userApiKeys');
        localStorage.removeItem('userApiKey');
        setApiKeys([]);
        setIsUsingDefaultKey(true);
    };

    const openSettings = () => {
        onSettingsChange(true);
    };

    const value: AIContextType = {
        makeApiCall,
        isAiReady,
        apiKeyError,
        isUsingDefaultKey,
        apiKeys,
        saveApiKeys,
        useDefaultKey,
        openSettings,
    };

    return (
        <AIContext.Provider value={value}>
            {children}
        </AIContext.Provider>
    );
};
