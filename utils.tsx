

import React from 'react';
import { Entity, Status, Quest } from './types.ts';
import { 
    BrainIcon, CrossIcon, InfoIcon
} from './components/Icons.tsx';
import * as GameIcons from './components/GameIcons.tsx';

// --- Icon Factory ---
export const getIconForEntity = (entity: Entity): React.ReactNode => {
    if (!entity) return <GameIcons.SparklesIcon />;
    const name = entity.name.toLowerCase();
    const type = entity.type;

    if (type === 'item') {
        if (name.includes('kiếm')) return <GameIcons.SwordIcon />;
        if (name.includes('đao')) return <GameIcons.SaberIcon />;
        if (name.includes('thương')) return <GameIcons.SpearIcon />;
        if (name.includes('cung')) return <GameIcons.BowIcon />;
        if (name.includes('trượng')) return <GameIcons.StaffIcon />;
        if (name.includes('búa')) return <GameIcons.AxeIcon />;
        if (name.includes('chủy thủ') || name.includes('dao găm')) return <GameIcons.DaggerIcon />;
        if (name.includes('khiên')) return <GameIcons.ShieldIcon />;
        if (name.includes('giáp')) return <GameIcons.ChestplateIcon />;
        if (name.includes('nón') || name.includes('mũ')) return <GameIcons.HelmetIcon />;
        if (name.includes('ủng') || name.includes('giày')) return <GameIcons.BootsIcon />;
        if (name.includes('thuốc')) return <GameIcons.PotionIcon />;
        if (name.includes('đan')) return <GameIcons.PillIcon />;
        if (name.includes('sách') || name.includes('pháp') || name.includes('quyển')) return <GameIcons.BookIcon />;
        if (name.includes('cuốn') || name.includes('chỉ')) return <GameIcons.ScrollIcon />;
        if (name.includes('nhẫn')) return <GameIcons.RingIcon />;
        if (name.includes('dây chuyền')) return <GameIcons.AmuletIcon />;
        if (name.includes('chìa khóa')) return <GameIcons.KeyIcon />;
        if (name.includes('tiền') || name.includes('vàng') || name.includes('bạc')) return <GameIcons.CoinIcon />;
        if (name.includes('đá') || name.includes('ngọc')) return <GameIcons.GemIcon />;
        if (name.includes('thịt') || name.includes('thực')) return <GameIcons.MeatIcon />;
        return <GameIcons.ChestIcon />;
    }

    if (type === 'skill') {
        // Prioritize skillType for icons
        if (entity.skillType === 'Nội Công' || entity.skillType === 'Tâm Pháp' || entity.skillType === 'Khí Công') return <BrainIcon />;
        if (entity.skillType === 'Ngạnh Công') return <GameIcons.ShieldIcon />;
        if (entity.skillType === 'Khinh Công') return <GameIcons.FeatherIcon />;
        if (entity.skillType === 'Độc Công') return <GameIcons.PoisonIcon />;
        
        // Fallback to name-based matching for weapon skills etc.
        if (name.includes('kiếm')) return <GameIcons.SwordIcon />;
        if (name.includes('đao')) return <GameIcons.SaberIcon />;
        if (name.includes('quyền') || name.includes('chưởng')) return <GameIcons.FistIcon />;
        if (name.includes('cước')) return <GameIcons.BootIcon_Skill />;
        if (name.includes('thân pháp')) return <GameIcons.FeatherIcon />;
        if (name.includes('hỏa') || name.includes('lửa')) return <GameIcons.FireIcon />;
        if (name.includes('lôi') || name.includes('sét')) return <GameIcons.LightningIcon />;
        if (name.includes('thủy') || name.includes('nước')) return <GameIcons.WaterDropIcon />;
        if (name.includes('độc')) return <GameIcons.PoisonIcon />;
        if (name.includes('tâm pháp') || name.includes('công pháp') || name.includes('quyết')) return <GameIcons.BookIcon />;
        return <GameIcons.ScrollIcon />;
    }

    if (type === 'npc' || type === 'companion') return <GameIcons.NpcIcon />;
    if (type === 'location') return <GameIcons.MapIcon />;
    if (type === 'faction') return <GameIcons.FlagIcon />;
    if (type === 'concept') return <BrainIcon />;

    return <GameIcons.SparklesIcon />;
};

export const getIconForStatus = (status: Status): React.ReactNode => {
    if (!status) return <InfoIcon />;
    const name = status.name.toLowerCase();
    const type = status.type;

    if (type === 'buff') return <GameIcons.UpArrowIcon />;
    if (name.includes('độc')) return <GameIcons.PoisonIcon />;
    if (name.includes('chảy máu')) return <GameIcons.BloodDropIcon />;
    if (name.includes('bỏng') || name.includes('hỏa')) return <GameIcons.FireIcon />;
    if (name.includes('tê liệt') || name.includes('choáng')) return <GameIcons.LightningIcon />;
    if (name.includes('gãy') || name.includes('trọng thương') || name.includes('thương tích')) return <GameIcons.BandagedHeartIcon />;
    if (name.includes('tan vỡ') || name.includes('đau khổ')) return <GameIcons.BrokenHeartIcon />;
    if (name.includes('yếu') || name.includes('suy nhược')) return <GameIcons.DownArrowIcon />;
    if (type === 'injury') return <GameIcons.BandagedHeartIcon />;
    if (type === 'debuff') return <GameIcons.DownArrowIcon />;
    
    return <GameIcons.HeartIcon />;
};

export const getIconForQuest = (quest: Quest): React.ReactNode => {
    if (!quest) return <GameIcons.ScrollIcon />;
    if (quest.status === 'completed') return <GameIcons.CheckmarkIcon />;
    if (quest.status === 'failed') return <CrossIcon />;
    return <GameIcons.ScrollIcon />;
};


// --- Status Styling Helper Functions ---
export const getStatusTextColor = (status: Status): string => {
    if (status.type === 'buff') {
        return 'text-green-600 dark:text-green-400';
    }
    if (status.type === 'debuff' || status.type === 'injury') {
        if (/\b(nặng|trọng|vĩnh viễn)\b/i.test(status.name) || status.duration === 'Vĩnh viễn') {
             return 'text-red-700 dark:text-red-500';
        }
        if (/\b(nhẹ)\b/i.test(status.name)) {
            return 'text-yellow-600 dark:text-yellow-400';
        }
        return 'text-red-600 dark:text-red-400';
    }
    return 'text-slate-600 dark:text-slate-400'; // Neutral
};

export const getStatusFontWeight = (status: Status): string => {
    if ((status.type === 'debuff' || status.type === 'injury') && (/\b(nặng|trọng|vĩnh viễn)\b/i.test(status.name) || status.duration === 'Vĩnh viễn')) {
        return 'font-bold';
    }
    if (status.type === 'buff' || status.type === 'debuff' || status.type === 'injury') {
        return 'font-semibold';
    }
    return 'font-normal';
}

export const getStatusBorderColor = (status: Status): string => {
    if (status.type === 'buff') {
        return 'border-green-400/50';
    }
    if (status.type === 'debuff' || status.type === 'injury') {
        if (/\b(nặng|trọng|vĩnh viễn)\b/i.test(status.name) || status.duration === 'Vĩnh viễn') {
             return 'border-red-500/50';
        }
        if (/\b(nhẹ)\b/i.test(status.name)) {
            return 'border-yellow-400/50';
        }
        return 'border-red-400/50';
    }
    return 'border-slate-400 dark:border-slate-600/50';
};