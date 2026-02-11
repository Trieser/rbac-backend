import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private jwt: JwtService) {}

  async register(body: { email: string; password: string } | string | undefined) {
      console.log('register body raw:', body, 'type:', typeof body);

      // Support cases where body might come as a JSON string
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body) as { email: string; password: string };
        } catch {
          throw new BadRequestException('Invalid JSON body');
        }
      }

      if (!body || typeof body !== 'object') {
        throw new BadRequestException('Email and password are required');
      }

      const { email, password } = body as { email: string; password: string };

      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const hash = await argon.hash(password);
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hash,
        },
      });

      return {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        password: user.password,
      };
    }

    async login(body: { email: string; password: string }) {
        console.log(body);
        const user = await this.prisma.user.findUnique({
          where: { email: body.email },
        });
      
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }
      
        const passwordValid = await argon.verify(user.password, body.password);
        if (!passwordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
      
        const payload = {
          sub: user.id,
          email: user.email,
        };
      
        return {
          accessToken: await this.jwt.signAsync(payload),
        };
      }
}
