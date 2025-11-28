import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

import { queryClient } from "@/lib/queryClient";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const style = {
        "--sidebar-width": "20rem",
        "--sidebar-width-icon": "4rem",
    };

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const displayText = user ? `${user.role} of ${user.tenantName || 'Tenant'}` : 'User';
    const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : (user?.role?.substring(0, 2).toUpperCase() || 'US');

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        queryClient.clear(); // Clear all cached data (chats, etc.)
        toast({
            title: "Logged out",
            description: "You have been successfully logged out.",
        });
        setLocation("/auth");
    };

    return (
        <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1">
                    <header className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger data-testid="button-sidebar-toggle" />
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-10"
                                    data-testid="input-global-search"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" data-testid="button-notifications">
                                <Bell className="h-4 w-4" />
                            </Button>
                            <ThemeToggle />
                            <div className="flex items-center gap-2 ml-2">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                    {initials}
                                </div>
                                <span className="text-sm font-medium">{displayText}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </header>
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
