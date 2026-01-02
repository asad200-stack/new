import type { StoreRole } from "@prisma/client";

const order: Record<StoreRole, number> = {
  OWNER: 3,
  EDITOR: 2,
  VIEWER: 1,
};

export function hasRole(atLeast: StoreRole, actual: StoreRole) {
  return order[actual] >= order[atLeast];
}


