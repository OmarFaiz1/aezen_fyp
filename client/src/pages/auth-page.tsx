import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    tenantName: z.string().min(1, "Tenant name is required"),
});

export default function AuthPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            tenantName: "",
        },
    });

    async function onLogin(values: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        try {
            const res = await apiRequest("POST", "/auth/login", values);
            const data = await res.json();

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));
            toast({
                title: "Welcome back!",
                description: "You have successfully signed in.",
            });
            setLocation("/dashboard");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Invalid credentials",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function onRegister(values: z.infer<typeof registerSchema>) {
        setIsLoading(true);
        try {
            const res = await apiRequest("POST", "/auth/register", values);
            const data = await res.json();

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));
            toast({
                title: "Account created!",
                description: "Welcome to AEZEN.",
            });
            setLocation("/dashboard");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Registration failed",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-md border-none shadow-none">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Welcome to AEZEN
                        </CardTitle>
                        <CardDescription>
                            Sign in to your account or create a new one
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="admin@example.com"
                                            {...loginForm.register("email")}
                                        />
                                        {loginForm.formState.errors.email && (
                                            <p className="text-sm text-destructive">
                                                {loginForm.formState.errors.email.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            {...loginForm.register("password")}
                                        />
                                        {loginForm.formState.errors.password && (
                                            <p className="text-sm text-destructive">
                                                {loginForm.formState.errors.password.message}
                                            </p>
                                        )}
                                    </div>
                                    <Button className="w-full" type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Sign In
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="register">
                                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="register-email">Email</Label>
                                        <Input
                                            id="register-email"
                                            type="email"
                                            placeholder="user@example.com"
                                            {...registerForm.register("email")}
                                        />
                                        {registerForm.formState.errors.email && (
                                            <p className="text-sm text-destructive">
                                                {registerForm.formState.errors.email.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-password">Password</Label>
                                        <Input
                                            id="register-password"
                                            type="password"
                                            {...registerForm.register("password")}
                                        />
                                        {registerForm.formState.errors.password && (
                                            <p className="text-sm text-destructive">
                                                {registerForm.formState.errors.password.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tenantName">Tenant Name</Label>
                                        <Input
                                            id="tenantName"
                                            placeholder="My Company"
                                            {...registerForm.register("tenantName")}
                                        />
                                        {registerForm.formState.errors.tenantName && (
                                            <p className="text-sm text-destructive">
                                                {registerForm.formState.errors.tenantName.message}
                                            </p>
                                        )}
                                    </div>
                                    <Button className="w-full" type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Account
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
            <div className="hidden lg:flex flex-col justify-center p-12 bg-muted text-muted-foreground">
                <div className="max-w-md mx-auto space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">
                        AEZEN Chatbot Platform
                    </h1>
                    <p className="text-lg">
                        Manage your tenants, conversations, and AI configurations in one place.
                    </p>
                </div>
            </div>
        </div>
    );
}
