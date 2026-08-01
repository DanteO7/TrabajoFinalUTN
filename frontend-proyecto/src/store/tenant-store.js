import { create } from "zustand";
import { getUserRolesInTenant } from "../services/tenant";

export const useTenantStore = create((set) => ({
  userRolesInTenant: {}, // { tenantId: { roles: [...], hasAccessToTenant: bool } }
  loadingRoles: {},

  fetchUserRolesInTenant: async (tenantId) => {
    // Si ya lo tenemos en cache, no repetir la query
    set((state) => ({
      loadingRoles: { ...state.loadingRoles, [tenantId]: true },
    }));

    try {
      const roles = await getUserRolesInTenant(tenantId);
      set((state) => ({
        userRolesInTenant: {
          ...state.userRolesInTenant,
          [tenantId]: roles,
        },
        loadingRoles: { ...state.loadingRoles, [tenantId]: false },
      }));
    } catch (error) {
      console.error("Error fetching roles:", error);
      set((state) => ({
        loadingRoles: { ...state.loadingRoles, [tenantId]: false },
      }));
    }
  },

  getUserRoles: (tenantId) => {
    const state = useTenantStore.getState();
    return state.userRolesInTenant[tenantId];
  },
}));
