import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (context.getType() !== 'ws') {
            return true;
        }

        const client: Socket = context.switchToWs().getClient();
        const token = this.extractToken(client);

        if (!token) {
            return false;
        }

        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET', 'dev_secret'),
            });
            // Attach user to socket object so it can be accessed in the gateway
            client.data.user = payload;
            return true;
        } catch (err) {
            return false;
        }
    }

    private extractToken(client: Socket): string | undefined {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            return authHeader.split(' ')[1];
        }
        const queryToken = client.handshake.query.token;
        if (typeof queryToken === 'string') {
            return queryToken;
        }
        return undefined;
    }
}
