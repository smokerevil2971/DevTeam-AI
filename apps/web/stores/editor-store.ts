import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EditorFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isModified: boolean;
  lastSaved?: Date;
}

export interface EditorTab {
  id: string;
  fileId: string;
  name: string;
  path: string;
  language: string;
  isModified: boolean;
}

interface EditorState {
  // Open files and tabs
  openFiles: Map<string, EditorFile>;
  tabs: EditorTab[];
  activeTabId: string | null;

  // Editor settings
  showMinimap: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number;
  theme: 'light' | 'dark';

  // Actions - Files
  openFile: (file: EditorFile) => void;
  closeFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  markFileSaved: (fileId: string) => void;

  // Actions - Tabs
  setActiveTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;

  // Actions - Settings
  toggleMinimap: () => void;
  toggleLineNumbers: () => void;
  toggleWordWrap: () => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      openFiles: new Map(),
      tabs: [],
      activeTabId: null,

      showMinimap: true,
      showLineNumbers: true,
      wordWrap: false,
      fontSize: 14,
      theme: 'dark',

      openFile: (file) =>
        set((state) => {
          const newFiles = new Map(state.openFiles);
          newFiles.set(file.id, file);

          // Check if tab already exists
          const existingTab = state.tabs.find((t) => t.fileId === file.id);
          if (existingTab) {
            return {
              openFiles: newFiles,
              activeTabId: existingTab.id,
            };
          }

          // Create new tab
          const newTab: EditorTab = {
            id: `tab-${Date.now()}`,
            fileId: file.id,
            name: file.name,
            path: file.path,
            language: file.language,
            isModified: false,
          };

          return {
            openFiles: newFiles,
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id,
          };
        }),

      closeFile: (fileId) =>
        set((state) => {
          const newFiles = new Map(state.openFiles);
          newFiles.delete(fileId);

          const newTabs = state.tabs.filter((t) => t.fileId !== fileId);
          const closedTab = state.tabs.find((t) => t.fileId === fileId);

          let newActiveTabId = state.activeTabId;
          if (closedTab && state.activeTabId === closedTab.id) {
            const index = state.tabs.indexOf(closedTab);
            newActiveTabId =
              newTabs[Math.min(index, newTabs.length - 1)]?.id || null;
          }

          return {
            openFiles: newFiles,
            tabs: newTabs,
            activeTabId: newActiveTabId,
          };
        }),

      updateFileContent: (fileId, content) =>
        set((state) => {
          const newFiles = new Map(state.openFiles);
          const file = newFiles.get(fileId);
          if (file) {
            newFiles.set(fileId, { ...file, content, isModified: true });
          }

          const newTabs = state.tabs.map((t) =>
            t.fileId === fileId ? { ...t, isModified: true } : t,
          );

          return { openFiles: newFiles, tabs: newTabs };
        }),

      markFileSaved: (fileId) =>
        set((state) => {
          const newFiles = new Map(state.openFiles);
          const file = newFiles.get(fileId);
          if (file) {
            newFiles.set(fileId, {
              ...file,
              isModified: false,
              lastSaved: new Date(),
            });
          }

          const newTabs = state.tabs.map((t) =>
            t.fileId === fileId ? { ...t, isModified: false } : t,
          );

          return { openFiles: newFiles, tabs: newTabs };
        }),

      setActiveTab: (tabId) => set({ activeTabId: tabId }),

      closeTab: (tabId) => {
        const state = get();
        const tab = state.tabs.find((t) => t.id === tabId);
        if (tab) {
          state.closeFile(tab.fileId);
        }
      },

      reorderTabs: (fromIndex, toIndex) =>
        set((state) => {
          const newTabs = [...state.tabs];
          const [removed] = newTabs.splice(fromIndex, 1);
          newTabs.splice(toIndex, 0, removed);
          return { tabs: newTabs };
        }),

      toggleMinimap: () =>
        set((state) => ({ showMinimap: !state.showMinimap })),
      toggleLineNumbers: () =>
        set((state) => ({ showLineNumbers: !state.showLineNumbers })),
      toggleWordWrap: () => set((state) => ({ wordWrap: !state.wordWrap })),
      setFontSize: (fontSize) => set({ fontSize }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'devteam-editor',
      partialize: (state) => ({
        showMinimap: state.showMinimap,
        showLineNumbers: state.showLineNumbers,
        wordWrap: state.wordWrap,
        fontSize: state.fontSize,
        theme: state.theme,
      }),
    },
  ),
);
