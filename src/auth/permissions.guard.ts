import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    // Kalau endpoint tidak set @RequiredPermissions, tidak perlu cek RBAC
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { sub?: string; email?: string; userId?: string } | undefined;

    const userId = user?.userId ?? user?.sub;

    if (!userId) {
      throw new ForbiddenException('User not found in request');
    }

    // Ambil user dari DB beserta roles + permissions
    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }

    const userPermissions = new Set(
      dbUser.roles.flatMap((role) => role.permissions.map((p) => p.name)),
    );

    const hasAllRequired = requiredPermissions.every((perm) =>
      userPermissions.has(perm),
    );

    if (!hasAllRequired) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

