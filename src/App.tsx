import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider } from "@/contexts/AdminContext";
import Login from "./pages/Login";
import AdminLayout from "./components/admin/AdminLayout";
import SnippetList from "./pages/admin/SnippetList";
import SnippetEditor from "./pages/admin/SnippetEditor";
import DailyContent from "./pages/admin/DailyContent";
import RoadmapList from "./pages/admin/RoadmapList";
import RoadmapEditor from "./pages/admin/RoadmapEditor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="snippets" replace />} />
              <Route path="snippets" element={<SnippetList />} />
              <Route path="snippets/new" element={<SnippetEditor />} />
              <Route path="snippets/:id" element={<SnippetEditor />} />
              <Route path="daily" element={<DailyContent />} />
              <Route path="roadmaps" element={<RoadmapList />} />
              <Route path="roadmaps/new" element={<RoadmapEditor />} />
              <Route path="roadmaps/:id" element={<RoadmapEditor />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
