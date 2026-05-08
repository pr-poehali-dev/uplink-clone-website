import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";
import LiveChat from "@/components/LiveChat";
import { ThemeProvider } from "@/hooks/useTheme";
import { useCmsContent } from "@/hooks/useCmsContent";

const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ServicePage = lazy(() => import("./pages/ServicePage"));
const PricingPage = lazy(() => import("./pages/Pricing"));

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
    const body = document.body;
    if (s.design_accent_color) {
      root.style.setProperty("--neon-blue", s.design_accent_color);
      root.style.setProperty("--range-thumb", s.design_accent_color);
      // RGB для rgba() в CSS
      const hex = s.design_accent_color.replace("#", "");
      const r = parseInt(hex.substring(0,2),16);
      const g = parseInt(hex.substring(2,4),16);
      const b = parseInt(hex.substring(4,6),16);
      if (!isNaN(r)) root.style.setProperty("--neon-blue-rgb", `${r}, ${g}, ${b}`);
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
    if (s.design_font_body) {
      const link2 = document.getElementById("gfont-body") as HTMLLinkElement | null;
      const family2 = encodeURIComponent(s.design_font_body);
      const href2 = `https://fonts.googleapis.com/css2?family=${family2}:wght@400;500;600&display=swap`;
      if (link2) { link2.href = href2; }
      else {
        const el2 = document.createElement("link");
        el2.id = "gfont-body"; el2.rel = "stylesheet"; el2.href = href2;
        document.head.appendChild(el2);
      }
      root.style.setProperty("--font-body", `'${s.design_font_body}', sans-serif`);
      document.body.style.fontFamily = `'${s.design_font_body}', sans-serif`;
    }
    // Анимации и эффекты — вешаем data-атрибуты на body (без перезагрузки)
    if (s.design_scroll_animation) body.dataset.scrollAnim = s.design_scroll_animation;
    if (s.design_anim_speed) body.dataset.animSpeed = s.design_anim_speed;
    if (s.design_hover_cards) body.dataset.hoverCards = s.design_hover_cards;
    if (s.design_hover_buttons) body.dataset.hoverButtons = s.design_hover_buttons;
    if (s.design_hover_menu) body.dataset.hoverMenu = s.design_hover_menu;
    if (s.design_modal_animation) body.dataset.modalAnim = s.design_modal_animation;
    if (s.design_bg_effect) body.dataset.bgEffect = s.design_bg_effect;
    if (s.design_btn_style) body.dataset.btnStyle = s.design_btn_style;
    if (s.design_card_style) body.dataset.cardStyle = s.design_card_style;
    if (s.design_shadow_style) body.dataset.shadowStyle = s.design_shadow_style;
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