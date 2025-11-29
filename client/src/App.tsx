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
import MyTickets from "@/pages/my-tickets";
import CRM from "@/pages/crm";
import TeamManagement from "@/pages/team-management";
import SeeMembers from "@/pages/see-members";
import VoiceCalls from "@/pages/voice-calls";
import Analytics from "@/pages/analytics";
import Billing from "@/pages/billing";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";

import Layout from "@/components/layout";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// Update Router to wrap protected routes in Layout
import WebChat from "@/pages/webchat";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/webchat/:tenantId" component={WebChat} />
      <Route path="/" component={AuthPage} />

      {/* Protected Routes wrapped in Layout */}
      <Route path="/:rest*">
        {(params) => (
          <Layout>
            <Switch>
              <ProtectedRoute path="/dashboard" component={Dashboard} />
              <ProtectedRoute path="/knowledge-base" component={KnowledgeBase} />
              <ProtectedRoute path="/bot-builder" component={BotBuilderPage} />
              <ProtectedRoute path="/integrations" component={Integrations} />
              <ProtectedRoute path="/conversations" component={Conversations} />
              <ProtectedRoute path="/ticketing" component={Ticketing} />
              <ProtectedRoute path="/my-tickets" component={MyTickets} permission="my-tickets" />
              <ProtectedRoute path="/crm" component={CRM} />
              <ProtectedRoute path="/team" component={TeamManagement} />
              <ProtectedRoute path="/see-members" component={SeeMembers} permission="see-members" />
              <ProtectedRoute path="/voice-calls" component={VoiceCalls} />
              <ProtectedRoute path="/analytics" component={Analytics} />
              <ProtectedRoute path="/billing" component={Billing} />
              <ProtectedRoute path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

export default App;
