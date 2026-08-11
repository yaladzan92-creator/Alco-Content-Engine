export interface ProjectMeta {
  project_id: string;
  project_name: string;
  updated_at: string;
}

export const STORAGE_KEYS = {
  ACTIVE_PROJECT_ID: 'alco_active_project_id',
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

export const getProjectCharacterDNA = (projectId: string, sourceItemKey?: string) => {
  const type = sourceItemKey ? `character_dna_${sourceItemKey}` : 'character_dna';
  return loadProjectData(projectId, type);
};

export const saveProjectCharacterDNA = (projectId: string, data: any, sourceItemKey?: string) => {
  const type = sourceItemKey ? `character_dna_${sourceItemKey}` : 'character_dna';
  saveProjectData(projectId, type, data);
};

