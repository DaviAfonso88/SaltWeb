import { PERMISSIONS, Permission, Role } from "../participant/constants";

export type { Role, Permission };

export const SESSION_COOKIE_NAME = "salt-session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function hasPermission(role: Role, permission: Permission): boolean {
  const rolePermissions = PERMISSIONS[role] as readonly string[];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
