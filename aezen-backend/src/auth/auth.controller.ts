import { Controller, Request, Post, UseGuards, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
// We would typically use a LocalAuthGuard here, but for brevity we'll skip the local strategy implementation
// and just do a direct login endpoint for now, or assume the user passes credentials.

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any) {
        // In a real app, validate credentials first.
        // Here we assume the body contains validated user info or we call validateUser
        const user = await this.authService.validateUser(body.email, body.password);
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() createUserDto: any) {
        // Note: In a real app, use a DTO with validation pipe
        return this.authService.register(createUserDto);
    }
}
