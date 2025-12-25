import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutShell } from "@/components/layout-shell";
import { useUser } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import PeopleList from "@/pages/people-list";
import PersonDetail from "@/pages/person-detail";
import TreeView from "@/pages/tree-view";
import AdminPanel from "@/pages/admin-panel";
import InboxPage from "@/pages/inbox";
import MessageThreadPage from "@/pages/message-thread";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <LayoutShell>
      <Component />
    </LayoutShell>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={AuthPage} />

      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/people">
        <ProtectedRoute component={PeopleList} />
      </Route>
      <Route path="/people/:id">
        <ProtectedRoute component={PersonDetail} />
      </Route>
      <Route path="/tree">
        <ProtectedRoute component={TreeView} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminPanel} />
      </Route>
      <Route path="/messages">
        <ProtectedRoute component={InboxPage} />
      </Route>
      <Route path="/messages/:id">
        <ProtectedRoute component={MessageThreadPage} />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
