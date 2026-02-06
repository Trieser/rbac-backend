import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) {}

    async register(email:string, password: string) {
        const hash = await argon.hash(password)

        return this.prisma.user.create({
            data: {
                email,
                password: hash,
            }
        })
    }

    async login(email:string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const valid = await argon.verify(user.password, password)

        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }
}
