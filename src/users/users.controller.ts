import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  @Post(':userId/roles')
  async addRoleToUser(
    @Param('userId') userId: string,
    @Body() body: { roleId: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: body.roleId },
        },
      },
      include: { roles: { select: { id: true, name: true } } },
    });
  }
}