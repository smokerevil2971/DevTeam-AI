import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PanelSizes {
  sidebar: number;
  rightPanel: number;
  bottomPanel: number;
  fileTree: number;
}

interface UIState {
  // Panel visibility and sizes
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;
  panelSizes: PanelSizes;

  // Modal states
  commandPaletteOpen: boolean;
  settingsOpen: boolean;
  newProjectModalOpen: boolean;

  // Active views
  activeView: 'dashboard' | 'editor' | 'chat' | 'projects' | 'settings';

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Notifications
  notificationsOpen: boolean;
  unreadCount: number;

  // Actions - Panels
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  setPanelSize: (panel: keyof PanelSizes, size: number) => void;

  // Actions - Modals
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openNewProjectModal: () => void;
  closeNewProjectModal: () => void;

  // Actions - Views
  setActiveView: (view: UIState['activeView']) => void;

  // Actions - Theme
  setTheme: (theme: UIState['theme']) => void;

  // Actions - Notifications
  toggleNotifications: () => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Panel defaults
      sidebarCollapsed: false,
      rightPanelOpen: false,
      bottomPanelOpen: false,
      panelSizes: {
        sidebar: 240,
        rightPanel: 320,
        bottomPanel: 200,
        fileTree: 240,
      },

      // Modal defaults
      commandPaletteOpen: false,
      settingsOpen: false,
      newProjectModalOpen: false,

      // View defaults
      activeView: 'dashboard',

      // Theme default
      theme: 'dark',

      // Notification defaults
      notificationsOpen: false,
      unreadCount: 0,

      // Panel actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      toggleRightPanel: () =>
        set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),

      toggleBottomPanel: () =>
        set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen })),

      setPanelSize: (panel, size) =>
        set((state) => ({
          panelSizes: { ...state.panelSizes, [panel]: size },
        })),

      // Modal actions
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),

      openNewProjectModal: () => set({ newProjectModalOpen: true }),
      closeNewProjectModal: () => set({ newProjectModalOpen: false }),

      // View actions
      setActiveView: (activeView) => set({ activeView }),

      // Theme actions
      setTheme: (theme) => set({ theme }),

      // Notification actions
      toggleNotifications: () =>
        set((state) => ({ notificationsOpen: !state.notificationsOpen })),

      setUnreadCount: (unreadCount) => set({ unreadCount }),

      incrementUnread: () =>
        set((state) => ({ unreadCount: state.unreadCount + 1 })),

      clearUnread: () => set({ unreadCount: 0 }),
    }),
    {
      name: 'devteam-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        panelSizes: state.panelSizes,
        theme: state.theme,
      }),
    },
  ),
);
