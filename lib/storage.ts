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
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
};

export const setActiveProjectId = (projectId: string | null) => {
  if (typeof window === 'undefined') return;
  if (projectId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, projectId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
  }
};

export const getSelectedProjectId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT_ID);
};

export const setSelectedProjectId = (projectId: string | null) => {
  if (typeof window === 'undefined') return;
  if (projectId) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT_ID, projectId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT_ID);
  }
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
      const idx = currentItems.findIndex(
        (i) => i.no === updatedItem.no || (i.tanggal === updatedItem.tanggal && i.headline === updatedItem.headline)
      );
      if (idx >= 0) {
        currentItems[idx] = { ...currentItems[idx], ...updatedItem };
        saveProjectData(projectId, 'items', currentItems);
      }
    }
  } catch (err) {
    console.error('Failed to update item in project data:', err);
  }
};

export const getProjectCharacterDNA = (projectId: string, sourceItemKey?: string) => {
  const type = sourceItemKey ? `character_dna_${sourceItemKey}` : 'character_dna';
  return loadProjectData(projectId, type);
};

export const saveProjectCharacterDNA = (projectId: string, data: any, sourceItemKey?: string) => {
  const type = sourceItemKey ? `character_dna_${sourceItemKey}` : 'character_dna';
  saveProjectData(projectId, type, data);
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

