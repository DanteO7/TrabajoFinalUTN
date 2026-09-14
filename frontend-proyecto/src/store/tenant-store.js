import { create } from "zustand";
import { getMyPermissionInTenant } from "../services/tenant";

const EMPTY_ARRAY = [];

export const useTenantStore = create((set) => ({
  userPermissionsInTenant: {},
  loadingPermissions: {},

  fetchUserPermissionsInTenant: async (tenantId) => {
    const state = useTenantStore.getState();

    if (state.userPermissionsInTenant[tenantId]) {
      return;
    }

    if (state.loadingPermissions[tenantId]) {
      return;
    }

    set((state) => ({
      loadingPermissions: {
        ...state.loadingPermissions,
        [tenantId]: true,
      },
    }));

    try {
      const userData = await getMyPermissionInTenant(tenantId);

      set((state) => ({
        userPermissionsInTenant: {
          ...state.userPermissionsInTenant,
          [tenantId]: userData,
        },
        loadingPermissions: {
          ...state.loadingPermissions,
          [tenantId]: false,
        },
      }));
    } catch (error) {
      console.error(error);

      set((state) => ({
        loadingPermissions: {
          ...state.loadingPermissions,
          [tenantId]: false,
        },
      }));
    }
  },

  getUserPermissions: (tenantId) => {
    const state = useTenantStore.getState();
    return state.userPermissionsInTenant[tenantId];
  },

  getUserRoles: (tenantId) => {
    const state = useTenantStore.getState();
    return state.userPermissionsInTenant[tenantId]?.roles || EMPTY_ARRAY;
  },

  hasPermission: (tenantId, permission) => {
    const state = useTenantStore.getState();

    const userData = state.userPermissionsInTenant[tenantId];

    if (!userData) {
      return false;
    }

    return userData.permissions.includes(permission);
  },

  clearPermissions: () =>
    set({
      userPermissionsInTenant: {},
      loadingPermissions: {},
    }),
}));
