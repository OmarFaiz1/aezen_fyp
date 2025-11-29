import {
  BarChart3,
  Bot,
  CreditCard,
  Database,
  FileText,
  MessageSquare,
  Phone,
  Settings,
  Ticket,
  Users,
  Zap,
  LayoutDashboard,
  MessageCircle,
  Building2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Knowledge Base",
    url: "/knowledge-base",
    icon: Database,
  },
  {
    title: "Bot Builder",
    url: "/bot-builder",
    icon: Bot,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: Zap,
  },
  {
    title: "Conversations",
    url: "/conversations",
    icon: MessageSquare,
  },
  {
    title: "My Tickets",
    url: "/my-tickets",
    icon: Ticket,
    badge: 0, // todo: fetch real count
  },
  {
    title: "Ticketing",
    url: "/ticketing",
    icon: Ticket,
  },
  {
    title: "CRM",
    url: "/crm",
    icon: Building2,
  },
  {
    title: "Team Management",
    url: "/team",
    icon: Users,
  },
  {
    title: "See Members",
    url: "/see-members",
    icon: Users,
  },
  {
    title: "AI Ticket Management",
    url: "/ai-tickets",
    icon: Bot,
  },
  {
    title: "Voice Calls",
    url: "/voice-calls",
    icon: Phone,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const permissions = user?.permissions || [];
  const role = user?.role;

  // Owner has access to everything
  const hasPermission = (itemUrl: string) => {
    if (role === 'Owner') return true;
    if (itemUrl === '/dashboard') return permissions.includes('dashboard');
    // Extract feature name from URL (e.g., /conversations -> conversations)
    const feature = itemUrl.substring(1);
    return permissions.includes(feature);
  };

  const filteredItems = menuItems.filter(item => {
    // Dashboard is usually accessible to everyone, but we can check permission if needed
    if (item.url === '/') return true; // Keep the root link but redirect it? No, fix the URL.
    return hasPermission(item.url);
  });

  // Fix Dashboard URL in menuItems
  const correctedMenuItems = menuItems.map(item => ({
    ...item,
    url: item.url === '/' ? '/dashboard' : item.url
  })).filter(item => hasPermission(item.url));

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">AEZEN</span>
            <span className="truncate text-xs text-muted-foreground">Admin Portal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {correctedMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-4 text-xs text-muted-foreground">
          © 2024 AEZEN Platform
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}