import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/81e5aaf1-fb4f-4564-a4b6-a63e79ae89a4";
const PROJECTS_URL = "https://functions.poehali.dev/056cb137-9ffd-410b-aae3-2b93f0354a1f";
const UPLOAD_URL = "https://functions.poehali.dev/54330845-c41a-4d8b-922a-68e6829b05d1";

const STYLES = ["минимализм", "лофт", "скандинавский", "арт-деко", "классика", "модерн"];
const TYPES = ["гостиная", "кухня", "кабинет", "спальня", "столовая", "гардероб", "прихожая", "ванная"];

interface Project {
  id: number;
  title: string;
  style: string;
  type: string;
  year: string;
  img: string;
}

const EMPTY: Omit<Project, "id"> = { title: "", style: "минимализм", type: "гостиная", year: new Date().getFullYear().toString(), img: "" };

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [form, setForm] = useState<Omit<Project, "id"> & { id?: number }>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isAuth = !!token;

  useEffect(() => {
    if (isAuth) loadProjects();
  }, [isAuth]);

  async function login() {
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || "Ошибка входа"); return; }
      localStorage.setItem("admin_token", data.token);
      setToken(data.token);
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await fetch(PROJECTS_URL);
      const data = await res.json();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage(file: File): Promise<string> {
    setUploadingImg(true);
    try {
      const b64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ file: b64, content_type: file.type }),
      });
      const data = await res.json();
      return data.url || "";
    } finally {
      setUploadingImg(false);
    }
  }

  async function saveProject() {
    setSaving(true);
    try {
      const isEdit = modal === "edit" && form.id;
      const url = isEdit ? `${PROJECTS_URL}/${form.id}` : PROJECTS_URL;
      const method = isEdit ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: form.title, style: form.style, type: form.type, year: form.year, img_url: form.img }),
      });
      setModal(null);
      await loadProjects();
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id: number) {
    setDeleting(id);
    try {
      await fetch(`${PROJECTS_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadProjects();
    } finally {
      setDeleting(null);
    }
  }

  function logout() {
    localStorage.removeItem("admin_token");
    setToken("");
  }

  function openAdd() {
    setForm({ ...EMPTY });
    setModal("add");
  }

  function openEdit(p: Project) {
    setForm({ id: p.id, title: p.title, style: p.style, type: p.type, year: p.year, img: p.img });
    setModal("edit");
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="font-display text-3xl text-foreground mb-1">Свирель<span className="text-primary">.</span></div>
            <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">Панель управления</p>
          </div>
          <div className="bg-card border border-border p-8 space-y-4">
            <div>
              <label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@mail.ru"
                className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">Пароль</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
                placeholder="••••••••"
                className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors" />
            </div>
            {loginError && <p className="font-body text-xs text-red-400">{loginError}</p>}
            <button onClick={login} disabled={loginLoading}
              className="w-full bg-primary text-primary-foreground font-body text-sm tracking-widest uppercase py-3 hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loginLoading ? "Вход..." : "Войти"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="font-display text-xl text-foreground hover:text-primary transition-colors">
            Свирель<span className="text-primary">.</span>
          </a>
          <span className="text-border">|</span>
          <span className="font-body text-xs text-muted-foreground uppercase tracking-widest">Админка</span>
        </div>
        <button onClick={logout} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
          <Icon name="LogOut" size={14} />
          Выйти
        </button>
      </header>

      <main className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-foreground">Проекты</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">{projects.length} работ в портфолио</p>
          </div>
          <button onClick={openAdd}
            className="bg-primary text-primary-foreground font-body text-xs tracking-widest uppercase px-6 py-3 hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Icon name="Plus" size={14} />
            Добавить работу
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground font-body">Загрузка...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border">
            <Icon name="ImagePlus" size={40} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-body text-muted-foreground">Нет проектов. Добавьте первую работу.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div key={p.id} className="bg-card border border-border group relative overflow-hidden">
                <div className="relative overflow-hidden" style={{ height: "200px" }}>
                  {p.img ? (
                    <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 bg-muted">
                      <Icon name="Image" size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openEdit(p)}
                      className="bg-primary text-primary-foreground p-2 hover:bg-primary/90 transition-colors">
                      <Icon name="Pencil" size={16} />
                    </button>
                    <button onClick={() => deleteProject(p.id)} disabled={deleting === p.id}
                      className="bg-red-600 text-white p-2 hover:bg-red-700 transition-colors disabled:opacity-50">
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg text-foreground leading-tight">{p.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="font-body text-xs text-primary">{p.style}</span>
                    <span className="text-muted-foreground/30 text-xs">·</span>
                    <span className="font-body text-xs text-muted-foreground">{p.type}</span>
                    <span className="text-muted-foreground/30 text-xs">·</span>
                    <span className="font-body text-xs text-muted-foreground">{p.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4"
          onClick={() => setModal(null)}>
          <div className="bg-card border border-border w-full max-w-lg p-8"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">{modal === "add" ? "Добавить работу" : "Редактировать"}</h2>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">Фото</label>
                <div className="relative">
                  {form.img ? (
                    <div className="relative">
                      <img src={form.img} alt="preview" className="w-full object-cover mb-2" style={{ height: "160px" }} />
                      <button onClick={() => setForm(f => ({ ...f, img: "" }))}
                        className="absolute top-2 right-2 bg-background/80 text-foreground p-1 hover:bg-background">
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full border border-dashed border-border py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      {uploadingImg ? (
                        <><Icon name="Loader2" size={24} className="animate-spin" /><span className="font-body text-xs">Загружаю...</span></>
                      ) : (
                        <><Icon name="Upload" size={24} /><span className="font-body text-xs tracking-wider uppercase">Загрузить фото</span></>
                      )}
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) { const url = await uploadImage(file); setForm(f => ({ ...f, img: url })); }
                    }} />
                </div>
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">Название</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Гостиная «Архитектор»"
                  className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">Стиль</label>
                  <select value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))}
                    className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">Тип</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground uppercase tracking-widest block mb-2">Год</label>
                <input type="text" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                  placeholder="2024" maxLength={4}
                  className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors" />
              </div>

              <button onClick={saveProject} disabled={saving || !form.title}
                className="w-full bg-primary text-primary-foreground font-body text-sm tracking-widest uppercase py-3 hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2">
                {saving ? "Сохраняю..." : modal === "add" ? "Добавить" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
