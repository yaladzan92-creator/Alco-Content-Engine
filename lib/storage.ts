import { SharedContentContext, buildSharedContentContext } from './content-contract';

export interface ProjectMeta {
  project_id: string;
  project_name: string;
  updated_at: string;
}

export const STORAGE_KEYS = {
  ACTIVE_PROJECT_ID: 'alco_active_project_id',
  SELECTED_PROJECT_ID: 'alco_selected_project_id',
  PROJECT_LIST: 'alco_project_list',
};

export const getProjectKey = (projectId: string, dataType: string) => {
  return `alco_project_${projectId}_${dataType}`;
};

export const getProjectList = (): ProjectMeta[] => {
  if (typeof window === 'undefined') return [];
  try {
    const list = localStorage.getItem(STORAGE_KEYS.PROJECT_LIST);
    return list ? JSON.parse(list) : [];
  } catch (err) {
    return [];
  }
};

export const saveProjectList = (list: ProjectMeta[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECT_LIST, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save project list', err);
  }
};

export const getActiveProjectId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID) || localStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT_ID) || null;
};

export const setActiveProjectId = (projectId: string | null) => {
  if (typeof window === 'undefined') return;
  if (projectId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, projectId);
    // Keep in sync to guarantee single source of truth and prevent divergent IDs
    localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT_ID, projectId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT_ID);
  }
};

export const getSelectedProjectId = (): string | null => {
  return getActiveProjectId();
};

export const setSelectedProjectId = (projectId: string | null) => {
  setActiveProjectId(projectId);
};

export const clearGlobalTransientState = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('alco_selected_item');
    localStorage.removeItem('alco_selected_content_item');
    localStorage.removeItem('alco_shared_context');
  } catch (_) {}
};

export const ensureContentItemIdentity = (item: any, projectId: string, fallbackIndex?: number): any => {
  if (!item || typeof item !== 'object') return item;
  const no = item.no !== undefined && item.no !== null ? item.no : (fallbackIndex !== undefined ? fallbackIndex + 1 : 1);
  const contentItemId = item.content_item_id || `${projectId}_item_${no}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    ...item,
    project_id: projectId,
    projectId: projectId,
    content_item_id: contentItemId,
  };
};

export const validateProjectContext = (
  projectId: string | null,
  blueprint: any,
  context: any
): { valid: boolean; reason?: string } => {
  if (!projectId || typeof projectId !== 'string' || !projectId.trim()) {
    return { valid: false, reason: 'Tidak ada project aktif terpilih.' };
  }
  if (!blueprint || typeof blueprint !== 'object') {
    return { valid: false, reason: 'Strategy Blueprint tidak tersedia untuk project aktif ini.' };
  }
  if (!context || typeof context !== 'object') {
    return { valid: false, reason: 'Shared Content Context tidak tersedia untuk project aktif ini.' };
  }
  if (blueprint.project_id && blueprint.project_id !== projectId) {
    return {
      valid: false,
      reason: `Mismatch: Blueprint terikat ke project ${blueprint.project_id}, bukan ${projectId}.`
    };
  }
  if (context.project_id && context.project_id !== projectId) {
    return {
      valid: false,
      reason: `Mismatch: Shared Context terikat ke project ${context.project_id}, bukan ${projectId}.`
    };
  }
  return { valid: true };
};

export const updateProjectMeta = (projectId: string, projectName: string) => {
  const list = getProjectList();
  const index = list.findIndex(p => p.project_id === projectId);
  if (index >= 0) {
    list[index].project_name = projectName;
    list[index].updated_at = new Date().toISOString();
  } else {
    list.push({
      project_id: projectId,
      project_name: projectName,
      updated_at: new Date().toISOString()
    });
  }
  saveProjectList(list);
};

export const saveProjectData = (projectId: string, dataType: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    const key = getProjectKey(projectId, dataType);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save project data:', err);
  }
};

export const loadProjectData = (projectId: string, dataType: string, defaultValue: any = null) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const key = getProjectKey(projectId, dataType);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (err) {
    console.error('Failed to load project data:', err);
    return defaultValue;
  }
};

export const removeProjectData = (projectId: string, dataType: string) => {
  if (typeof window === 'undefined') return;
  try {
    const key = getProjectKey(projectId, dataType);
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to remove project data:', err);
  }
};

export const updateItemInProject = (projectId: string, updatedItem: any) => {
  if (typeof window === 'undefined' || !projectId || !updatedItem) return;
  try {
    const currentItems = loadProjectData(projectId, 'items', []) as any[];
    if (Array.isArray(currentItems) && currentItems.length > 0) {
      const idx = currentItems.findIndex((i) => {
        if (i.content_item_id && updatedItem.content_item_id) {
          return i.content_item_id === updatedItem.content_item_id;
        }
        if (i.no !== undefined && updatedItem.no !== undefined) {
          return i.no === updatedItem.no;
        }
        return i.tanggal === updatedItem.tanggal && i.headline === updatedItem.headline;
      });
      if (idx >= 0) {
        currentItems[idx] = { ...currentItems[idx], ...updatedItem, project_id: projectId, projectId };
        saveProjectData(projectId, 'items', currentItems);
      }
    }
  } catch (err) {
    console.error('Failed to update item in project data:', err);
  }
};

export const getProjectSelectedItem = (projectId: string): any => {
  return loadProjectData(projectId, 'selectedContentItem', null);
};

export const saveProjectSelectedItem = (projectId: string, item: any): void => {
  if (!projectId) return;
  if (!item) {
    removeProjectData(projectId, 'selectedContentItem');
    return;
  }
  const normalized = ensureContentItemIdentity(item, projectId);
  saveProjectData(projectId, 'selectedContentItem', normalized);
};

export const getProjectCharacterDNA = (projectId: string, sourceItemKey?: string) => {
  const type = sourceItemKey ? `character_dna_${sourceItemKey}` : 'character_dna';
  const data = loadProjectData(projectId, type);
  if (data) return data;
  
  // Fallback to active saved character if specific one not found
  const activeCharId = getProjectActiveCharacterId(projectId);
  if (activeCharId) {
    const saved = getProjectSavedCharacters(projectId);
    const active = saved.find(c => c.character_id === activeCharId);
    if (active) return active;
  }
  return null;
};

export const saveProjectCharacterDNA = (projectId: string, data: any, sourceItemKey?: string) => {
  const type = sourceItemKey ? `character_dna_${sourceItemKey}` : 'character_dna';
  saveProjectData(projectId, type, data);
};

export const getProjectSavedCharacters = (projectId: string): any[] => {
  const list = loadProjectData(projectId, 'saved_characters', []);
  if (Array.isArray(list) && list.length > 0) return list;

  // Fallback: check legacy single character_dna
  const legacy = loadProjectData(projectId, 'character_dna');
  if (legacy && legacy.identity?.display_name) {
    const legacyItem = {
      ...legacy,
      character_id: legacy.character_id || `char_legacy_${Date.now()}`,
    };
    saveProjectData(projectId, 'saved_characters', [legacyItem]);
    return [legacyItem];
  }
  return [];
};

export const saveProjectSavedCharacters = (projectId: string, characters: any[]): void => {
  saveProjectData(projectId, 'saved_characters', characters);
};

export const getProjectActiveCharacterId = (projectId: string): string | null => {
  return loadProjectData(projectId, 'active_character_id', null);
};

export const saveProjectActiveCharacterId = (projectId: string, characterId: string | null): void => {
  saveProjectData(projectId, 'active_character_id', characterId);
};

export const saveSingleSavedCharacter = (projectId: string, character: any): any[] => {
  const existingList = getProjectSavedCharacters(projectId);
  const targetId = character.character_id || `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const normalized = {
    ...character,
    character_id: targetId,
    project_id: projectId,
    timestamps: {
      created_at: character.timestamps?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  const existingIdx = existingList.findIndex(c => c.character_id === targetId);
  let updatedList: any[];
  if (existingIdx >= 0) {
    updatedList = [...existingList];
    updatedList[existingIdx] = normalized;
  } else {
    updatedList = [normalized, ...existingList];
  }

  saveProjectSavedCharacters(projectId, updatedList);
  saveProjectActiveCharacterId(projectId, targetId);
  saveProjectCharacterDNA(projectId, normalized);
  return updatedList;
};

export const deleteSingleSavedCharacter = (projectId: string, characterId: string): any[] => {
  const existingList = getProjectSavedCharacters(projectId);
  const updatedList = existingList.filter(c => c.character_id !== characterId);
  saveProjectSavedCharacters(projectId, updatedList);

  const currentActiveId = getProjectActiveCharacterId(projectId);
  if (currentActiveId === characterId) {
    const nextActive = updatedList[0]?.character_id || null;
    saveProjectActiveCharacterId(projectId, nextActive);
    if (nextActive) {
      saveProjectCharacterDNA(projectId, updatedList[0]);
    } else {
      removeProjectData(projectId, 'character_dna');
    }
  }

  return updatedList;
};

export interface CalendarSettings {
  coreTopic: string;
  startDate: string;
  skipDays: string[];
  gender: string;
  ageRange: [number, number];
  formats: string[];
  carouselSlides: number;
  reelsDuration: string;
  ratio: { tofu: number; mofu: number; bofu: number };
  formatRatio: Record<string, number>;
  selectedVoices: string[];
  hookMix: { type: string; percentage?: number }[];
  selectedFormula: string;
  referenceType: string;
  selectedCTAs: string[];
  isFastMode: boolean;
}

export const getDefaultCalendarSettings = (
  blueprint?: any | null,
  projectName?: string
): CalendarSettings => {
  const brandName =
    blueprint?.brand_identity?.brand_name ||
    blueprint?.brand_context?.brand_name ||
    blueprint?.project_name ||
    projectName;

  const coreTopic = brandName ? `${brandName} Campaign` : 'Content Campaign';
  const todayStr = new Date().toISOString().split('T')[0];

  return {
    coreTopic,
    startDate: todayStr,
    skipDays: [],
    gender: 'Both',
    ageRange: [20, 45],
    formats: ['Single', 'Carousel', 'Reels'],
    carouselSlides: 5,
    reelsDuration: '30s',
    ratio: { tofu: 8, mofu: 6, bofu: 4 },
    formatRatio: { Single: 30, Carousel: 40, Reels: 30 },
    selectedVoices: ['The Efficiency Expert'],
    hookMix: [
      { type: 'Call-Out', percentage: 40 },
      { type: 'Curiosity Gap', percentage: 35 },
      { type: 'Social Proof', percentage: 25 },
    ],
    selectedFormula: 'Awareness & Soft Selling',
    referenceType: 'Logika AI',
    selectedCTAs: ['Link Bio'],
    isFastMode: false,
  };
};

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = getDefaultCalendarSettings();

export const getProjectCalendarSettings = (projectId: string): CalendarSettings | null => {
  return loadProjectData(projectId, 'calendarSettings', null);
};

export const saveProjectCalendarSettings = (projectId: string, settings: CalendarSettings) => {
  saveProjectData(projectId, 'calendarSettings', settings);
};

export const loadProjectSharedContext = (projectId: string): SharedContentContext | null => {
  if (!projectId || projectId === 'default' || projectId === 'default_project') return null;
  // 1. Primary storage key used across the application
  let context = loadProjectData(projectId, 'context', null);
  // 2. Secondary/fallback storage key
  if (!context) {
    context = loadProjectData(projectId, 'sharedContext', null);
  }
  // 3. Fallback from project's own blueprint storage if context was not saved
  if (!context) {
    const blueprint = loadProjectData(projectId, 'blueprint', null);
    if (blueprint && (blueprint.brand_identity?.brand_name || blueprint.project_name)) {
      context = buildSharedContentContext(blueprint);
    }
  }

  if (context && typeof context === 'object') {
    // Normalization & legacy repair: if context was loaded from this project's storage
    // but contains a stale/missing project_id, normalize it to canonical projectId
    if (context.project_id !== projectId) {
      context = {
        ...context,
        project_id: projectId,
      };
      // Persist the repaired context back to this same project's storage namespace
      saveProjectData(projectId, 'context', context);
      saveProjectData(projectId, 'sharedContext', context);
    }
    return context;
  }
  return null;
};

export const saveProjectSharedContext = (projectId: string, context: any): void => {
  if (!projectId || !context || projectId === 'default' || projectId === 'default_project') return;
  const normalized = {
    ...context,
    project_id: projectId,
  };
  saveProjectData(projectId, 'context', normalized);
  saveProjectData(projectId, 'sharedContext', normalized);
};

export const loadProjectCalendarItems = (projectId: string): any[] => {
  if (!projectId || projectId === 'default' || projectId === 'default_project') return [];
  const items = loadProjectData(projectId, 'items', []);
  if (Array.isArray(items)) {
    return items.map((item, idx) => ensureContentItemIdentity(item, projectId, idx));
  }
  return [];
};

export const saveProjectCalendarItems = (projectId: string, items: any[]): void => {
  if (!projectId || projectId === 'default' || projectId === 'default_project') return;
  const normalized = Array.isArray(items) ? items.map((item, idx) => ensureContentItemIdentity(item, projectId, idx)) : [];
  saveProjectData(projectId, 'items', normalized);
};

export const loadProjectSelectedItem = (projectId: string): any => {
  if (!projectId || projectId === 'default' || projectId === 'default_project') return null;
  return getProjectSelectedItem(projectId);
};

