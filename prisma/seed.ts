import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Permissions
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'user:read' },
      update: {},
      create: { name: 'user:read', description: 'Read user data' },
    }),
    prisma.permission.upsert({
      where: { name: 'user:write' },
      update: {},
      create: { name: 'user:write', description: 'Create/update/delete users' },
    }),
    prisma.permission.upsert({
      where: { name: 'role:read' },
      update: {},
      create: { name: 'role:read', description: 'Read roles and permissions' },
    }),
    prisma.permission.upsert({
      where: { name: 'role:write' },
      update: {},
      create: { name: 'role:write', description: 'Create/update/delete roles and assign to users' },
    }),
  ]);

  // Roles: admin gets all, user gets user:read + user:write
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
      permissions: { connect: permissions.map((p) => ({ id: p.id })) },
    },
  });

  await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user',
      permissions: {
        connect: permissions.filter((p) => p.name === 'user:read' || p.name === 'user:write').map((p) => ({ id: p.id })),
      },
    },
  });

  // Assign admin role to admin@test.com if exists
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@test.com' },
    include: { roles: true },
  });
  if (adminUser && !adminUser.roles.some((r) => r.name === 'admin')) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { roles: { connect: { id: adminRole.id } } },
    });
    console.log('Assigned admin role to admin@test.com');
  }

  console.log('Seed completed: permissions, roles created; admin@test.com has admin role if present.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
