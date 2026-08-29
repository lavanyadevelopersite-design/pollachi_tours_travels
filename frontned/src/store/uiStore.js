import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
  notificationPanelOpen: false,
  breadcrumbs: [],
  pageTitle: '',

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
  toggleMobileDrawer: () => set((s) => ({ mobileDrawerOpen: !s.mobileDrawerOpen })),
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
  toggleNotificationPanel: () =>
    set((s) => ({ notificationPanelOpen: !s.notificationPanelOpen })),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  setPageTitle: (pageTitle) => set({ pageTitle }),
}));

export default useUiStore;
