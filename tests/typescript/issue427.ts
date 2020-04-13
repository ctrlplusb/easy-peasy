import { Computed, computed } from 'easy-peasy';

interface AppModel {
  currentRoleId?: number;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface RolesModel {
  rolesMap: { [roleId: string]: Role };
  currentRole: Computed<RolesModel, Role | undefined, StoreModel>;
  currentRoleName: Computed<RolesModel, string | undefined, StoreModel>;
}

interface StoreModel {
  app: AppModel;
  roles: RolesModel;
}

const storeModel: StoreModel = {
  app: {
    currentRoleId: 1,
  },
  roles: {
    rolesMap: {
      '1': { id: 1, name: 'Role example', description: 'Role description' },
    },
    currentRole: computed(
      [
        (_, storeState) => storeState.app.currentRoleId,
        (state) => state.rolesMap,
      ],
      (roleId, rolesMap) => (roleId != null ? rolesMap[roleId] : undefined),
    ),
    currentRoleName: computed(
      [(state) => state.currentRole],
      (role) => role && role.name,
    ),
  },
};
