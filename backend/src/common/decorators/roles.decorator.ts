import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/dto/user.dto';

export const ROLES_KEY = 'roles';

// Attach required roles to any route handler using @Roles(UserRole.TEACHER)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
