


export type EntityType = 'pc' | 'npc' | 'location' | 'faction' | 'item' | 'skill' | 'status_effect' | 'companion' | 'concept';
export type EntityState = 'alive' | 'dead' | 'destroyed' | 'intact' | 'broken';

export interface Entity {
  name: string;
  type: EntityType;
  description: string;
  state?: EntityState; // alive, dead, broken, destroyed, intact
  gender?: string;
  age?: string;
  personality?: string;
  personalityMbti?: string; // e.g., 'INTJ', 'ESFP'
  relationship?: string; // For relationship tracking
  uses?: number; // For consumable items
  realm?: string; // For power levels or skill levels
  durability?: number;
  usable?: boolean;
  equippable?: boolean;
  equipped?: boolean; // New: For tracking equipped status
  consumable?: boolean;
  learnable?: boolean; // For 'công pháp' items
  owner?: string; // 'pc' or npc name for items
  skills?: string[]; // For NPCs
  learnedSkills?: string[]; // For PC to track learned skills
  skillType?: string; // For classifying skills (e.g., Nội Công, Ngạnh Công)
  [key: string]: any; 
}

export interface KnownEntities {
    [name: string]: Entity;
}

export interface StartingSkill {
  name: string;
  description: string;
}

export interface WorldCreationData {
    genre: string;
    worldDetail: string;
    writingStyle: string;
    difficulty: string;
    allowNsfw: boolean;
    characterName: string;
    customPersonality: string;
    personalityFromList: string;
    personalityMbti: string;
    gender: string;
    bio: string;
    startSkills: StartingSkill[];
    addGoal: boolean;
    aiWritingStyle: string;
}

export interface Status {
    name:string;
    description: string;
    type: 'buff' | 'debuff' | 'neutral' | 'injury';
    source: string;
    duration?: string; // e.g., '3 turns', 'permanent'
    effects?: string;
    cureConditions?: string;
    owner: string; // 'pc' or an NPC's name
}

export interface Memory {
    text: string;
    pinned: boolean;
}

export interface QuestObjective {
    description: string;
    completed: boolean;
}

export interface Quest {
    title: string;
    description: string;
    objectives: QuestObjective[];
    giver?: string;
    reward?: string;
    isMainQuest?: boolean;
    status: 'active' | 'completed' | 'failed';
}

export interface GameHistoryEntry {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface CustomRule {
  id: string;
  content: string;
  isActive: boolean;
}

export interface Chronicle {
    turn: string[];     // Summaries of ~10 turns
    chapter: string[];  // Summaries of ~5 turn-summaries (~50 turns)
    memoir: string[];   // Summaries of ~4 chapter-summaries (~200 turns)
}

// --- Save Game Data Structure ---
export interface SaveData {
    worldData: WorldCreationData;
    storyLog: string[];
    choices: string[];
    knownEntities: KnownEntities;
    statuses: Status[];
    quests: Quest[];
    gameHistory: GameHistoryEntry[];
    memories: Memory[];
    party: Entity[];
    customRules: CustomRule[];
    systemInstruction: string;
    turnCount: number;
    totalTokensUsed: number;
    lastCallTokens: number;
    chronicle: Chronicle;
}