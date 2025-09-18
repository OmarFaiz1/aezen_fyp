import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Import all pages
import Dashboard from "@/pages/dashboard";
import KnowledgeBase from "@/pages/knowledge-base";
import BotBuilderPage from "@/pages/bot-builder";
import Integrations from "@/pages/integrations";
import Conversations from "@/pages/conversations";
import Ticketing from "@/pages/ticketing";
import CRM from "@/pages/crm";
import TeamManagement from "@/pages/team-management";
import VoiceCalls from "@/pages/voice-calls";
import Analytics from "@/pages/analytics";
import Billing from "@/pages/billing";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/bot-builder" component={BotBuilderPage} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/conversations" component={Conversations} />
      <Route path="/ticketing" component={Ticketing} />
      <Route path="/crm" component={CRM} />
      <Route path="/team" component={TeamManagement} />
      <Route path="/voice-calls" component={VoiceCalls} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/billing" component={Billing} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
                      AD
                    </div>
                    <span className="text-sm font-medium">Admin</span>
                  </div>
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
