import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'dev_secret'),
        });
    }

    async validate(payload: any) {
        console.log(`[JwtStrategy] Validating payload:`, payload);
        const user = await this.usersService.findOneById(payload.sub);

        if (!user) {
            console.error(`[JwtStrategy] User not found for ID: ${payload.sub}`);
            throw new UnauthorizedException();
        }

        // Attach tenantId and role to the request object (via return value)
        return {
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
    }
}
