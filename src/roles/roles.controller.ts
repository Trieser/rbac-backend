import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RequiredPermissions } from '../auth/permissions.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequiredPermissions('role:read')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @RequiredPermissions('role:read')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }
}