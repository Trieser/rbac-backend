import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.role.findMany({
            include: {
                permissions: true,
            },
        });   
    }
    
    findOne(id: string) {
        return this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: true,
            },
        })
    }
}