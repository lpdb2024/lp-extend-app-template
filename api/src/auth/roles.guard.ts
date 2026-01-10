import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';
import { LE_USER_ROLES } from 'src/constants/constants';

// Local type definition for LP Profile
interface Profile {
  id: number;
  name: string;
  description?: string;
  dateUpdated?: string;
  isAssignedToLPA?: boolean;
}

// Map from Firestore short role names to LP profile names
const ROLE_NAME_MAP: Record<string, string> = {
  ADMIN: LE_USER_ROLES.ADMIN, // 'ADMIN' -> 'Administrator'
  AGENT: LE_USER_ROLES.AGENT, // 'AGENT' -> 'Agent'
  AGENT_MANAGER: LE_USER_ROLES.AGENT_MANAGER, // 'AGENT_MANAGER' -> 'Agent Manager'
  CAMPAIGN_MANAGER: LE_USER_ROLES.CAMPAIGN_MANAGER, // 'CAMPAIGN_MANAGER' -> 'Campaign Manager'
  // Also map full names to themselves for flexibility
  Administrator: LE_USER_ROLES.ADMIN,
  Agent: LE_USER_ROLES.AGENT,
  'Agent Manager': LE_USER_ROLES.AGENT_MANAGER,
  'Campaign Manager': LE_USER_ROLES.CAMPAIGN_MANAGER,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles || roles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const token = request.token;
    console.info('[RolesGuard] Checking access:', {
      hasToken: !!token,
      hasUser: !!user,
      requiredRoles: roles,
      userProfiles: user?.profiles?.map((p: any) => p.name),
      userRoles: user?.roles,
    });
    if (!token || !user) {
      console.info('[RolesGuard] Denied: missing token or user');
      return false;
    }

    // Check LP profiles first (array of profile objects with name property)
    const hasProfileRole = roles.some((role) =>
      (user.profiles || []).some((profile: Profile) => profile.name === role),
    );
    if (hasProfileRole) return true;

    // Check Firestore roles (array of short role strings like 'ADMIN')
    // Map them to LP profile names for comparison
    const userRolesMapped = (user.roles || []).map(
      (r: string) => ROLE_NAME_MAP[r] || r,
    );
    const hasFirestoreRole = roles.some((role) =>
      userRolesMapped.includes(role),
    );

    return hasFirestoreRole;
  }
}
