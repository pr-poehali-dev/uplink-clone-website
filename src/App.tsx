import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";
import LiveChat from "@/components/LiveChat";
import { ThemeProvider } from "@/hooks/useTheme";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useInteractiveAnimations } from "@/hooks/useInteractiveAnimations";
import { useVisualEditor } from "@/hooks/useVisualEditor";
import { useElementAnimations } from "@/hooks/useElementAnimations";

const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ServicePage = lazy(() => import("./pages/ServicePage"));
const PricingPage = lazy(() => import("./pages/Pricing"));
const ServicesIndex = lazy(() => import("./pages/ServicesIndex"));

const queryClient = new QueryClient();

function InteractiveAnimationsProvider() {
  useInteractiveAnimations();
  return null;
}

function VisualEditorProvider() {
  useVisualEditor();
  return null;
}

function DesignApplicator() {
  const { content } = useCmsContent();
  const location = useLocation();
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
    // Анимации и эффекты — всегда устанавливаем data-атрибуты на body
    // (не используем if-check чтобы не оставлять старые значения от pre-hydration)
    body.dataset.scrollAnim     = s.design_scroll_animation || "fade-up";
    body.dataset.animSpeed      = s.design_anim_speed || "normal";
    body.dataset.hoverCards     = s.design_hover_cards || "lift";
    body.dataset.hoverButtons   = s.design_hover_buttons || "glow";
    body.dataset.hoverMenu      = s.design_hover_menu || "underline";
    body.dataset.modalAnim      = s.design_modal_animation || "scale-in";
    body.dataset.bgEffect       = s.design_bg_effect || "none";
    body.dataset.btnStyle       = s.design_btn_style || "rounded";
    body.dataset.cardStyle      = s.design_card_style || "glass";
    body.dataset.shadowStyle    = s.design_shadow_style || "neon";

    // Применяем JS-анимации как CSS-классы на .hover-card и .hover-btn (глобальные)
    const JS_ANIMS = ["magnetic","tilt","spotlight","glitch","morph","flicker","rubber","swing","jello","float-up","trace","heartbeat","wipe","shockwave"];
    const applyAnimClass = (selector: string, animVal: string) => {
      document.querySelectorAll<HTMLElement>(selector).forEach(el => {
        // Пропускаем элементы с data-elem-id — у них приоритет выше
        if (el.dataset.elemId) return;
        JS_ANIMS.forEach(a => el.classList.remove(`anim-${a}`));
        if (JS_ANIMS.includes(animVal)) el.classList.add(`anim-${animVal}`);
      });
    };
    if (s.design_hover_cards) applyAnimClass(".hover-card", s.design_hover_cards);
    if (s.design_hover_buttons) applyAnimClass(".hover-btn", s.design_hover_buttons);

    // Анимации по секциям — вешаем data-атрибуты на [data-section="..."]
    if (content?.section_animations) {
      content.section_animations.forEach((sa) => {
        const el = document.querySelector<HTMLElement>(`[data-section="${sa.section_id}"]`);
        if (!el) return;
        if (sa.scroll_anim !== "inherit") el.dataset.scrollAnim = sa.scroll_anim;
        else el.removeAttribute("data-scroll-anim");
        if (sa.hover_cards !== "inherit") el.dataset.hoverCards = sa.hover_cards;
        else el.removeAttribute("data-hover-cards");
        if (sa.hover_buttons !== "inherit") el.dataset.hoverButtons = sa.hover_buttons;
        else el.removeAttribute("data-hover-buttons");
        if (sa.anim_speed !== "inherit") el.dataset.animSpeed = sa.anim_speed;
        else el.removeAttribute("data-anim-speed");

        // Переопределяем JS-hover-анимацию внутри секции (пропуская элементы с data-elem-id)
        if (sa.hover_cards !== "inherit") {
          el.querySelectorAll<HTMLElement>(".hover-card").forEach((card) => {
            if (card.dataset.elemId) return;
            JS_ANIMS.forEach(a => card.classList.remove(`anim-${a}`));
            if (JS_ANIMS.includes(sa.hover_cards)) card.classList.add(`anim-${sa.hover_cards}`);
          });
        }
        if (sa.hover_buttons !== "inherit") {
          el.querySelectorAll<HTMLElement>(".hover-btn").forEach((btn) => {
            if (btn.dataset.elemId) return;
            JS_ANIMS.forEach(a => btn.classList.remove(`anim-${a}`));
            if (JS_ANIMS.includes(sa.hover_buttons)) btn.classList.add(`anim-${sa.hover_buttons}`);
          });
        }
      });
    }

  }, [content?.settings, content?.section_animations, location.pathname]);
  return null;
}

function ElementAnimationsProvider() {
  const { content } = useCmsContent();
  useElementAnimations(content?.element_animations);
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
        <InteractiveAnimationsProvider />
        <VisualEditorProvider />
        <BrowserRouter>
          <ScrollToTop />
          <DesignApplicator />
          <ElementAnimationsProvider />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services/:slug" element={<ServicePage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/services" element={<ServicesIndex />} />
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