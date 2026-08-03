import { create } from "zustand";
import { getUserRolesInTenant } from "../services/tenant";

export const useTenantStore = create((set) => ({
  userRolesInTenant: {},
  loadingRoles: {},

  fetchUserRolesInTenant: async (tenantId) => {
    const state = useTenantStore.getState();

    // Ya están cargados
    if (state.userRolesInTenant[tenantId]) {
      return;
    }

    // Ya se están cargando
    if (state.loadingRoles[tenantId]) {
      return;
    }

    set((state) => ({
      loadingRoles: {
        ...state.loadingRoles,
        [tenantId]: true,
      },
    }));

    try {
      const roles = await getUserRolesInTenant(tenantId);

      set((state) => ({
        userRolesInTenant: {
          ...state.userRolesInTenant,
          [tenantId]: roles,
        },
        loadingRoles: {
          ...state.loadingRoles,
          [tenantId]: false,
        },
      }));
    } catch (error) {
      console.error(error);

      set((state) => ({
        loadingRoles: {
          ...state.loadingRoles,
          [tenantId]: false,
        },
      }));
    }
  },

  getUserRoles: (tenantId) => {
    const state = useTenantStore.getState();
    return state.userRolesInTenant[tenantId];
  },

  clearRoles: () =>
    set({
      userRolesInTenant: {},
      loadingRoles: {},
    }),
}));
