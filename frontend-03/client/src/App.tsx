import { useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import HomeworkDetail from "./pages/HomeworkDetail";
import PublishHomework from "./pages/PublishHomework";
import ReviewSubmission from "./pages/ReviewSubmission";
import ExcellentSubmissions from "./pages/ExcellentSubmissions";
import Profile from "./pages/Profile";
import MySubmissions from "./pages/MySubmissions";
import { useAuthStore } from "./lib/store";
import './styles/theme.css';

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/"} component={Dashboard} />
      <Route path={"/homework/:id"} component={HomeworkDetail} />
      <Route path={"/publish"} component={PublishHomework} />
      <Route path={"/review/:id"} component={ReviewSubmission} />
      <Route path={"/excellent"} component={ExcellentSubmissions} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/my-submissions"} component={MySubmissions} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { restoreFromStorage } = useAuthStore();

  useEffect(() => {
    restoreFromStorage();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
