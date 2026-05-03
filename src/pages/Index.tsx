import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const IMAGES = {
  living: "https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/cbf47af7-4416-43fd-b40e-9ff61968040c.jpg",
  kitchen: "https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/4888529c-52ca-4d6f-84c6-962501d3f2c1.jpg",
  office: "https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/9d095bb8-def4-4fbd-b6a4-cbe36f9fef0a.jpg",
  bedroom: "https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/133153b8-ed24-4243-9589-e9b60defdc85.jpg",
  dining: "https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/bcb31839-9761-43ed-815e-66e4fd7253a2.jpg",
  dressing: "https://cdn.poehali.dev/projects/c8251e23-dc0a-4a78-bd81-39b33391a768/files/80731633-c04b-4716-82a4-eacb66bd18cf.jpg",
};

const PROJECTS = [
  { id: 1, title: "Гостиная «Архитектор»", style: "минимализм", type: "гостиная", img: IMAGES.living, year: "2024" },
  { id: 2, title: "Кухня «Noir»", style: "лофт", type: "кухня", img: IMAGES.kitchen, year: "2024" },
  { id: 3, title: "Кабинет «Атлас»", style: "скандинавский", type: "кабинет", img: IMAGES.office, year: "2023" },
  { id: 4, title: "Спальня «Изумруд»", style: "арт-деко", type: "спальня", img: IMAGES.bedroom, year: "2024" },
  { id: 5, title: "Столовая «Бруклин»", style: "лофт", type: "столовая", img: IMAGES.dining, year: "2023" },
  { id: 6, title: "Гардероб «Шампань»", style: "арт-деко", type: "гардероб", img: IMAGES.dressing, year: "2024" },
];

const STYLE_FILTERS = ["все", "минимализм", "лофт", "скандинавский", "арт-деко"];
const TYPE_FILTERS = ["все", "гостиная", "кухня", "кабинет", "спальня", "столовая", "гардероб"];
const SECTIONS = ["главная", "о студии", "портфолио", "контакты"];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function Index() {
  const [activeSection, setActiveSection] = useState("главная");
  const [styleFilter, setStyleFilter] = useState("все");
  const [typeFilter, setTypeFilter] = useState("все");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<null | typeof PROJECTS[0]>(null);

  const aboutAnim = useInView();
  const portfolioAnim = useInView();
  const contactAnim = useInView();

  const filtered = PROJECTS.filter((p) => {
    const styleOk = styleFilter === "все" || p.style === styleFilter;
    const typeOk = typeFilter === "все" || p.type === typeFilter;
    return styleOk && typeOk;
  });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
    setActiveSection(id === "home" ? "главная" : id === "about" ? "о студии" : id === "portfolio" ? "портфолио" : "контакты");
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "home", label: "главная" },
        { id: "about", label: "о студии" },
        { id: "portfolio", label: "портфолио" },
        { id: "contacts", label: "контакты" },
      ];
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s.id);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActiveSection(s.label);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground grain-overlay">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5"
        style={{ background: "linear-gradient(to bottom, hsl(20,10%,6%) 0%, transparent 100%)" }}>
        <button onClick={() => scrollTo("home")}
          className="font-display text-2xl tracking-widest text-foreground hover:text-primary transition-colors">
          С<span className="text-primary">неля</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {SECTIONS.map((s) => (
            <button key={s}
              onClick={() => scrollTo(s === "главная" ? "home" : s === "о студии" ? "about" : s === "портфолио" ? "portfolio" : "contacts")}
              className={`nav-link font-body text-sm tracking-widest uppercase ${activeSection === s ? "active text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}>
              {s}
            </button>
          ))}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? "X" : "Menu"} size={22} />
        </button>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-10">
          {SECTIONS.map((s) => (
            <button key={s}
              onClick={() => scrollTo(s === "главная" ? "home" : s === "о студии" ? "about" : s === "портфолио" ? "portfolio" : "contacts")}
              className="font-display text-4xl italic text-foreground hover:text-primary transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-end pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.living} alt="hero" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(20,10%,6%) 30%, transparent 70%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(20,10%,6%) 0%, transparent 60%)" }} />
        </div>

        <div className="relative z-10 px-6 md:px-16 max-w-6xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-6 animate-slide-right opacity-0"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
            Студия авторской мебели
          </p>
          <h1 className="font-display text-7xl md:text-[9rem] leading-[0.9] tracking-tight mb-8 animate-fade-up opacity-0"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            Мебель,<br />
            <em className="text-gradient not-italic">которую</em><br />
            <span className="text-foreground/30">помнят</span>
          </h1>
          <p className="font-body text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-10 animate-fade-up opacity-0"
            style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
            Проектируем и создаём мебель под ваш интерьер. Каждый предмет — история пространства, в котором вы живёте.
          </p>
          <div className="flex gap-4 animate-fade-up opacity-0" style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}>
            <button onClick={() => scrollTo("portfolio")}
              className="font-body text-sm tracking-widest uppercase bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-colors">
              Смотреть проекты
            </button>
            <button onClick={() => scrollTo("contacts")}
              className="font-body text-sm tracking-widest uppercase border border-border text-foreground px-8 py-4 hover:border-primary hover:text-primary transition-colors">
              Обсудить проект
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 md:right-16 hidden md:flex flex-col items-center gap-2 text-muted-foreground/40">
          <div className="w-px h-16 bg-gradient-to-b from-transparent to-primary/50 mt-4" />
        </div>
      </section>

      {/* STATS BAR */}
      <div className="border-y border-border py-8 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { num: "8+", label: "лет в деле" },
            { num: "240+", label: "реализованных проектов" },
            { num: "12", label: "городов присутствия" },
            { num: "100%", label: "авторское производство" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl md:text-5xl text-gradient">{s.num}</div>
              <div className="font-body text-xs text-muted-foreground mt-1 tracking-wider uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 md:px-16">
        <div ref={aboutAnim.ref}
          className={`max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center transition-all duration-700 ${aboutAnim.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">О студии</p>
            <h2 className="font-display text-5xl md:text-6xl leading-tight mb-8">
              Мы создаём<br />
              <em className="text-gradient">пространство</em><br />
              для жизни
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              «С неля» — студия авторской мебели, основанная в 2016 году. Мы специализируемся на создании мебели под заказ для жилых и коммерческих интерьеров. Каждый проект начинается с детального знакомства с вашим пространством и образом жизни.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-10">
              Наш подход — баланс между эстетикой и функциональностью. Мы работаем с натуральными материалами: массивом дерева, натуральными тканями, металлом ручной ковки.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: "Leaf", label: "Натуральные материалы" },
                { icon: "Ruler", label: "Точные замеры" },
                { icon: "Award", label: "Гарантия 5 лет" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-start gap-2">
                  <div className="w-10 h-10 border border-primary/30 flex items-center justify-center text-primary">
                    <Icon name={f.icon} size={18} />
                  </div>
                  <span className="font-body text-xs text-muted-foreground leading-tight">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <img src={IMAGES.kitchen} alt="О студии" className="w-full object-cover"
              style={{ height: "520px", filter: "brightness(0.85)" }} />
            <div className="absolute -bottom-6 -left-6 bg-card border border-border p-6 hidden md:block">
              <div className="font-display text-3xl text-gradient">2016</div>
              <div className="font-body text-xs text-muted-foreground tracking-wider uppercase mt-1">Год основания</div>
            </div>
            <div className="absolute top-6 -right-4 w-1 h-24 bg-primary/60" />
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="py-24 px-6 md:px-16 bg-card/30">
        <div ref={portfolioAnim.ref}
          className={`max-w-6xl mx-auto transition-all duration-700 ${portfolioAnim.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">Наши работы</p>
              <h2 className="font-display text-5xl md:text-6xl leading-tight">Портфолио</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <span className="font-body text-xs text-muted-foreground uppercase tracking-widest self-center mr-2">Стиль:</span>
            {STYLE_FILTERS.map((f) => (
              <button key={f} onClick={() => setStyleFilter(f)}
                className={`filter-btn font-body text-xs tracking-wider uppercase px-4 py-2 border transition-colors ${styleFilter === f ? "active border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mb-12">
            <span className="font-body text-xs text-muted-foreground uppercase tracking-widest self-center mr-2">Тип:</span>
            {TYPE_FILTERS.map((f) => (
              <button key={f} onClick={() => setTypeFilter(f)}
                className={`filter-btn font-body text-xs tracking-wider uppercase px-4 py-2 border transition-colors ${typeFilter === f ? "active border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}>
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground font-body">
              Нет проектов по выбранным фильтрам
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <div key={p.id} className="project-card cursor-pointer group" onClick={() => setLightbox(p)}>
                  <div className="overflow-hidden relative" style={{ height: "300px" }}>
                    <img src={p.img} alt={p.title} className="card-img w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-all duration-400 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-primary text-primary px-5 py-2 font-body text-xs tracking-widest uppercase">
                        Смотреть
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 font-body text-xs text-foreground/50">{p.year}</div>
                  </div>
                  <div className="pt-4 pb-2">
                    <h3 className="font-display text-xl text-foreground mb-1">{p.title}</h3>
                    <div className="flex gap-2">
                      <span className="font-body text-xs text-primary tracking-wider uppercase">{p.style}</span>
                      <span className="text-muted-foreground/30 text-xs">·</span>
                      <span className="font-body text-xs text-muted-foreground tracking-wider uppercase">{p.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 px-6 md:px-16">
        <div ref={contactAnim.ref}
          className={`max-w-6xl mx-auto grid md:grid-cols-2 gap-16 transition-all duration-700 ${contactAnim.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">Напишите нам</p>
            <h2 className="font-display text-5xl md:text-6xl leading-tight mb-8">
              Начнём<br />
              <em className="text-gradient">ваш проект</em>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-10 max-w-sm">
              Расскажите о вашей идее — мы подготовим концепцию и смету в течение 48 часов.
            </p>
            <div className="space-y-6">
              {[
                { icon: "Phone", label: "+7 (800) 000-00-00" },
                { icon: "Mail", label: "hello@snelja.ru" },
                { icon: "MapPin", label: "Москва, ул. Дизайнерская, 12" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-border flex items-center justify-center text-primary flex-shrink-0">
                    <Icon name={c.icon} size={16} />
                  </div>
                  <span className="font-body text-foreground/80">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border p-8 md:p-10">
            <h3 className="font-display text-2xl mb-6">Оставить заявку</h3>
            <div className="space-y-4">
              <div>
                <label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">Имя</label>
                <input type="text" placeholder="Ваше имя"
                  className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">Телефон</label>
                <input type="tel" placeholder="+7 (___) ___-__-__"
                  className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">Расскажите о проекте</label>
                <textarea rows={4} placeholder="Тип помещения, стиль, примерный бюджет..."
                  className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none" />
              </div>
              <button className="w-full bg-primary text-primary-foreground font-body text-sm tracking-widest uppercase py-4 hover:bg-primary/90 transition-colors mt-2">
                Отправить заявку
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 px-6 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-display text-xl tracking-widest">
            С<span className="text-primary">неля</span>
          </div>
          <p className="font-body text-xs text-muted-foreground tracking-wider">
            © 2024 Студия авторской мебели «С неля»
          </p>
          <div className="flex gap-6">
            {["VK", "Instagram", "Telegram"].map((s) => (
              <button key={s} className="font-body text-xs text-muted-foreground hover:text-primary transition-colors tracking-wider uppercase">
                {s}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4 md:p-12"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-foreground/60 hover:text-foreground transition-colors">
            <Icon name="X" size={28} />
          </button>
          <div className="max-w-4xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.img} alt={lightbox.title} className="w-full object-cover max-h-[70vh]" />
            <div className="mt-6 flex justify-between items-end">
              <div>
                <h3 className="font-display text-3xl text-foreground">{lightbox.title}</h3>
                <div className="flex gap-3 mt-2">
                  <span className="font-body text-sm text-primary tracking-wider uppercase">{lightbox.style}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="font-body text-sm text-muted-foreground tracking-wider uppercase">{lightbox.type}</span>
                </div>
              </div>
              <span className="font-display text-5xl text-foreground/10">{lightbox.year}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
