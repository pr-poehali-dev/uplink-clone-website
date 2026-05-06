import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/webapp/Index";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";
import LiveChat from "@/components/LiveChat";
import { ThemeProvider } from "@/hooks/useTheme";
import { useCmsContent } from "@/hooks/useCmsContent";

const Admin = lazy(() => import("./pages/webapp/Admin"));
const NotFound = lazy(() => import("./pages/webapp/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/webapp/PrivacyPolicy"));
const ServicePage = lazy(() => import("./pages/webapp/ServicePage"));
const PricingPage = lazy(() => import("./pages/webapp/Pricing"));

const queryClient = new QueryClient();

function DesignApplicator() {
  const { content } = useCmsContent();
  useEffect(() => {
    if (!content?.settings) return;
    const s = content.settings;
    if (s.site_meta_description) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", s.site_meta_description);
    }
    const root = document.documentElement;
    if (s.design_accent_color) {
      root.style.setProperty("--neon-blue", s.design_accent_color);
      root.style.setProperty("--range-thumb", s.design_accent_color);
    }
    if (s.design_font_heading) {
      const link = document.getElementById("gfont-heading") as HTMLLinkElement | null;
      const family = encodeURIComponent(s.design_font_heading);
      const href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;600;700&display=swap`;
      if (link) { link.href = href; }
      else {
        const el = document.createElement("link");
        el.id = "gfont-heading"; el.rel = "stylesheet"; el.href = href;
        document.head.appendChild(el);
      }
      document.querySelectorAll<HTMLElement>("h1,h2,h3,h4,.font-\\[Oswald\\]").forEach(el => {
        el.style.fontFamily = `'${s.design_font_heading}', sans-serif`;
      });
    }
  }, [content?.settings]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CookieBanner />
        <LiveChat />
        <DesignApplicator />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services/:slug" element={<ServicePage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/pricing" element={<PricingPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;