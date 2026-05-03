import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ForgeProvider } from "./forge/context";
import { ForgeWorkspace } from "./forge/ForgeWorkspace";

function Router() {
  return (
    <ForgeProvider>
      <Switch>
        <Route path="/">
          <ForgeWorkspace screenKey="portfolio" />
        </Route>

        <Route path="/portfolio">
          <ForgeWorkspace screenKey="portfolio" />
        </Route>
        <Route path="/portfolio/:storyId">
          {(params: { storyId: string }) => (
            <ForgeWorkspace screenKey="portfolio" routeStoryId={params.storyId} />
          )}
        </Route>

        <Route path="/command">
          <ForgeWorkspace screenKey="command" />
        </Route>
        <Route path="/command/:storyId">
          {(params: { storyId: string }) => (
            <ForgeWorkspace screenKey="command" routeStoryId={params.storyId} />
          )}
        </Route>

        <Route path="/delivery">
          <ForgeWorkspace screenKey="delivery" />
        </Route>
        <Route path="/delivery/:storyId">
          {(params: { storyId: string }) => (
            <ForgeWorkspace screenKey="delivery" routeStoryId={params.storyId} />
          )}
        </Route>

        <Route path="/context">
          <ForgeWorkspace screenKey="context" />
        </Route>
        <Route path="/context/:storyId">
          {(params: { storyId: string }) => (
            <ForgeWorkspace screenKey="context" routeStoryId={params.storyId} />
          )}
        </Route>

        <Route path="/architecture">
          <ForgeWorkspace screenKey="architecture" />
        </Route>
        <Route path="/architecture/:storyId">
          {(params: { storyId: string }) => (
            <ForgeWorkspace screenKey="architecture" routeStoryId={params.storyId} />
          )}
        </Route>

        <Route path="/governance">
          <ForgeWorkspace screenKey="governance" />
        </Route>
        <Route path="/governance/:storyId">
          {(params: { storyId: string }) => (
            <ForgeWorkspace screenKey="governance" routeStoryId={params.storyId} />
          )}
        </Route>

        <Route path="/config">
          <ForgeWorkspace screenKey="config" />
        </Route>
        <Route path="/config/:storyId">
          {(params: { storyId: string }) => (
            <ForgeWorkspace screenKey="config" routeStoryId={params.storyId} />
          )}
        </Route>

        <Route path="/output">
          <ForgeWorkspace screenKey="output" />
        </Route>
        <Route path="/output/:artifactId">
          {(params: { artifactId: string }) => (
            <ForgeWorkspace screenKey="output" routeArtifactId={params.artifactId} />
          )}
        </Route>

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </ForgeProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
