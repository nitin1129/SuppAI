"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Dumbbell, Film, Flame, ImageOff, Inbox, Pencil, Plus, Search, Trash2, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import {
  DIETS,
  DIET_META,
  MEAL_CATEGORIES,
  deleteMeal,
  fetchMeals,
  saveMeal,
  youtubeId,
  type Diet,
  type Meal,
  type NewMeal,
} from "@/lib/meals/service";

const EASE = [0.22, 1, 0.36, 1] as const;

type Filter = "all" | Diet;

/* ---------- form draft ---------- */
type Draft = {
  id?: string;
  name: string;
  image: string;
  category: string;
  diet: Diet;
  tag: string;
  description: string;
  youtubeUrl: string;
  kcal: string;
  protein: string;
  timeMins: string;
  servings: string;
  ingredients: string;
  steps: string;
};

const EMPTY: Draft = {
  name: "", image: "", category: "Lunch", diet: "veg", tag: "", description: "", youtubeUrl: "",
  kcal: "", protein: "", timeMins: "15", servings: "1", ingredients: "", steps: "",
};

function toDraft(m: Meal): Draft {
  return {
    id: m.id, name: m.name, image: m.image, category: m.category, diet: m.diet, tag: m.tag,
    description: m.description, youtubeUrl: m.youtubeUrl ?? "",
    kcal: String(m.kcal), protein: String(m.protein), timeMins: String(m.timeMins), servings: String(m.servings),
    ingredients: m.ingredients.join("\n"), steps: m.steps.join("\n"),
  };
}
function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "meal"; }

export function AdminMeals() {
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Draft | null>(null);

  useEffect(() => { fetchMeals().then(setMeals); }, []);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, veg: 0, egg: 0, nonveg: 0, vegan: 0 };
    for (const m of meals ?? []) { c.all += 1; c[m.diet] += 1; }
    return c;
  }, [meals]);
  const withVideo = useMemo(() => (meals ?? []).filter((m) => youtubeId(m.youtubeUrl)).length, [meals]);

  const filtered = useMemo(() => {
    if (!meals) return [];
    const q = query.trim().toLowerCase();
    return meals
      .filter((m) => (filter === "all" ? true : m.diet === filter))
      .filter((m) => !q || m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.tag.toLowerCase().includes(q));
  }, [meals, filter, query]);

  async function handleSave(draft: Draft) {
    const input: NewMeal = {
      id: draft.id,
      name: draft.name.trim(),
      image: draft.image.trim() || `https://picsum.photos/seed/${slug(draft.name)}/640/480`,
      category: draft.category,
      diet: draft.diet,
      tag: draft.tag.trim() || draft.category,
      description: draft.description.trim(),
      youtubeUrl: draft.youtubeUrl.trim() || undefined,
      kcal: Number(draft.kcal) || 0,
      protein: Number(draft.protein) || 0,
      timeMins: Number(draft.timeMins) || 0,
      servings: Number(draft.servings) || 1,
      ingredients: draft.ingredients.split("\n").map((s) => s.trim()).filter(Boolean),
      steps: draft.steps.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    setMeals(await saveMeal(input));
    setEditing(null);
  }

  async function handleDelete(id: string) {
    setMeals(await deleteMeal(id));
    setEditing(null);
  }

  return (
    <>
      <AdminTopbar title="Meals" subtitle="Curate the meal suggestions shown on the Get Healthy page." />

      <main className="no-scrollbar flex-1 overflow-y-auto px-8 py-7">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SectionTile label="Total meals" value={String(counts.all)} sub="in the library" icon={UtensilsCrossed} accent />
          <SectionTile label="Veg options" value={String(counts.veg + counts.vegan)} sub={`${counts.vegan} vegan`} icon={Flame} />
          <SectionTile label="Non-veg options" value={String(counts.nonveg + counts.egg)} sub={`${counts.egg} with egg`} icon={Dumbbell} />
          <SectionTile label="With video" value={String(withVideo)} sub="have a YouTube guide" icon={Film} />
        </div>

        {/* Controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "veg", "egg", "nonveg", "vegan"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition ${filter === f ? "bg-[#006E42] text-white" : "bg-white text-[#0f3a26]/70 ring-1 ring-[#0f3a26]/8 hover:ring-[#006E42]/30"}`}>
                {f === "all" ? "All" : DIET_META[f].label}
                <span className={`rounded-full px-1.5 text-[10px] tabular-nums ${filter === f ? "bg-white/15" : "bg-[#0f3a26]/8"}`}>{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 md:w-64">
              <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search meals…" className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none" />
            </div>
            <button onClick={() => setEditing({ ...EMPTY })} className="inline-flex items-center gap-1.5 rounded-xl bg-[#006E42] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#005634]">
              <Plus className="h-4 w-4" /> New meal
            </button>
          </div>
        </div>

        {/* Grid */}
        {!meals ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl bg-white p-14 text-center ring-1 ring-[#0f3a26]/8">
            <Inbox className="h-7 w-7 text-[#0f3a26]/30" />
            <p className="mt-3 text-[14px] font-bold text-[#0f3a26]">No meals here yet</p>
            <p className="mt-1 text-[12.5px] text-[#0f3a26]/55">Add a meal and it appears on Get Healthy right away.</p>
            <button onClick={() => setEditing({ ...EMPTY })} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#006E42] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#005634]"><Plus className="h-4 w-4" /> New meal</button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((m) => <MealCard key={m.id} meal={m} onEdit={() => setEditing(toDraft(m))} />)}
          </div>
        )}
      </main>

      <MealForm draft={editing} onClose={() => setEditing(null)} onSave={handleSave} onDelete={handleDelete} />
    </>
  );
}

/* ---------- card ---------- */
function MealCard({ meal, onEdit }: { meal: Meal; onEdit: () => void }) {
  const [broken, setBroken] = useState(false);
  const diet = DIET_META[meal.diet];
  const hasVideo = !!youtubeId(meal.youtubeUrl);
  return (
    <button onClick={onEdit} className="group overflow-hidden rounded-2xl bg-white text-left ring-1 ring-[#0f3a26]/8 transition hover:ring-[#006E42]/35">
      <div className="relative aspect-[16/10] bg-[#f1f7f3]">
        {broken ? (
          <span className="grid h-full w-full place-items-center text-[#0f3a26]/25"><ImageOff className="h-6 w-6" /></span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={meal.image} alt="" onError={() => setBroken(true)} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        )}
        <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${diet.cls}`}>{diet.label}</span>
        {hasVideo && <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm"><Film className="h-3 w-3" /> Video</span>}
        <span className="absolute bottom-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-[#006E42] opacity-0 shadow-sm backdrop-blur-sm transition group-hover:opacity-100"><Pencil className="h-3.5 w-3.5" /></span>
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-2 text-[10.5px] font-medium text-[#0f3a26]/50">
          <span className="rounded bg-[#006E42]/8 px-1.5 py-0.5 text-[#006E42]">{meal.category}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{meal.timeMins}m</span>
        </div>
        <p className="mt-1.5 line-clamp-1 text-[14px] font-bold tracking-tight text-[#0f3a26]">{meal.name || "Untitled meal"}</p>
        <div className="mt-2 flex items-center gap-3 text-[11.5px] font-semibold text-[#0f3a26]/70">
          <span className="inline-flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-[#c79a3d]" />{meal.kcal} kcal</span>
          <span className="inline-flex items-center gap-1"><Dumbbell className="h-3.5 w-3.5 text-[#006E42]" />{meal.protein}g</span>
        </div>
      </div>
    </button>
  );
}

/* ---------- form drawer ---------- */
function MealForm({ draft, onClose, onSave, onDelete }: { draft: Draft | null; onClose: () => void; onSave: (d: Draft) => void; onDelete: (id: string) => void }) {
  const [d, setD] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    if (draft) { setD(draft); setSaving(false); setConfirmDel(false); }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    if (draft) document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [draft, onClose]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const vid = youtubeId(d.youtubeUrl);
  const isEdit = !!d.id;
  const valid = d.name.trim().length > 1 && Number(d.kcal) > 0;

  async function submit() {
    if (!valid) return;
    setSaving(true);
    await onSave(d);
  }

  return (
    <AnimatePresence>
      {draft && (
        <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-[#0c1614]/45" onClick={onClose} aria-hidden />
          <motion.div role="dialog" aria-modal="true" aria-label={isEdit ? "Edit meal" : "New meal"} className="relative flex h-full w-full max-w-md flex-col bg-[#fbfdfb] shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.34, ease: EASE }}>
            {/* header */}
            <div className="flex items-center justify-between border-b border-[#0f3a26]/8 bg-white px-5 py-4">
              <div>
                <h2 className="text-[15px] font-bold tracking-tight text-[#0f3a26]">{isEdit ? "Edit meal" : "New meal"}</h2>
                <p className="text-[11.5px] text-[#0f3a26]/55">Shown as a suggestion on Get Healthy.</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-[#0f3a26]/50 transition hover:bg-[#0f3a26]/6 hover:text-[#0f3a26]"><X className="h-4 w-4" /></button>
            </div>

            {/* body */}
            <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <Field label="Meal name" required>
                <input value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Paneer quinoa power bowl" className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select value={d.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                    {MEAL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Tag / badge">
                  <input value={d.tag} onChange={(e) => set("tag", e.target.value)} placeholder="High protein" className={inputCls} />
                </Field>
              </div>

              <Field label="Diet type">
                <div className="flex flex-wrap gap-1.5">
                  {DIETS.map((dt) => (
                    <button key={dt.key} type="button" onClick={() => set("diet", dt.key)} className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${d.diet === dt.key ? "bg-[#006E42] text-white" : `${dt.cls} ring-1 ring-inset ring-[#0f3a26]/8`}`}>{dt.label}</button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Calories (kcal)" required>
                  <input value={d.kcal} onChange={(e) => set("kcal", e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="450" className={inputCls} />
                </Field>
                <Field label="Protein (g)">
                  <input value={d.protein} onChange={(e) => set("protein", e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="30" className={inputCls} />
                </Field>
                <Field label="Time (mins)">
                  <input value={d.timeMins} onChange={(e) => set("timeMins", e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="20" className={inputCls} />
                </Field>
                <Field label="Servings">
                  <input value={d.servings} onChange={(e) => set("servings", e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="1" className={inputCls} />
                </Field>
              </div>

              <Field label="Short description">
                <textarea value={d.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="One line on why it is a good pick." className={`${inputCls} resize-none`} />
              </Field>

              <Field label="Image URL" hint="Leave blank to auto-generate a placeholder.">
                <input value={d.image} onChange={(e) => set("image", e.target.value)} placeholder="https://…" className={inputCls} />
              </Field>

              <Field label="YouTube URL" hint="Recipe video shown on the meal card.">
                <input value={d.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/watch?v=…" className={inputCls} />
                {d.youtubeUrl.trim() && (
                  <p className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium ${vid ? "text-[#006E42]" : "text-[#c14040]"}`}>
                    <Film className="h-3 w-3" />{vid ? "Video linked" : "Not a valid YouTube link"}
                  </p>
                )}
              </Field>

              <Field label="Ingredients" hint="One per line.">
                <textarea value={d.ingredients} onChange={(e) => set("ingredients", e.target.value)} rows={4} placeholder={"100g paneer, cubed\n1 cup cooked quinoa\n…"} className={`${inputCls} resize-none`} />
              </Field>

              <Field label="Method" hint="One step per line.">
                <textarea value={d.steps} onChange={(e) => set("steps", e.target.value)} rows={4} placeholder={"Pan-sear the paneer.\nWarm the chickpeas.\n…"} className={`${inputCls} resize-none`} />
              </Field>
            </div>

            {/* footer */}
            <div className="flex items-center gap-2 border-t border-[#0f3a26]/8 bg-white px-5 py-4">
              {isEdit && (
                confirmDel ? (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => d.id && onDelete(d.id)} className="rounded-lg bg-[#c14040] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-[#a83535]">Delete</button>
                    <button onClick={() => setConfirmDel(false)} className="rounded-lg px-2 py-2 text-[12px] font-medium text-[#0f3a26]/55 hover:text-[#0f3a26]">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDel(true)} aria-label="Delete meal" className="grid h-9 w-9 place-items-center rounded-lg text-[#0f3a26]/40 transition hover:bg-[#c14040]/8 hover:text-[#c14040]"><Trash2 className="h-4 w-4" /></button>
                )
              )}
              <div className="ml-auto flex items-center gap-2">
                <button onClick={onClose} className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-[#0f3a26]/60 transition hover:text-[#0f3a26]">Cancel</button>
                <button onClick={submit} disabled={!valid || saving} className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-45">
                  {saving ? "Saving…" : isEdit ? "Save changes" : "Add meal"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputCls = "w-full rounded-xl border border-[#0f3a26]/12 bg-white px-3.5 py-2.5 text-[13.5px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[11.5px] font-semibold text-[#0f3a26]/60">
        {label}{required && <span className="text-[#c14040]">*</span>}
        {hint && <span className="ml-auto font-normal text-[10.5px] text-[#0f3a26]/40">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function SectionTile({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }>; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${accent ? "bg-[#006E42] ring-[#006E42]" : "bg-white ring-[#0f3a26]/8"}`}>
      <div className="flex items-center justify-between">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${accent ? "text-[#9af2c4]" : "text-[#0f3a26]/45"}`}>{label}</p>
        <Icon className={`h-4 w-4 ${accent ? "text-[#9af2c4]" : "text-[#006E42]"}`} />
      </div>
      <p className={`mt-2 text-[24px] font-bold tabular-nums tracking-tight ${accent ? "text-white" : "text-[#0f3a26]"}`}>{value}</p>
      <p className={`mt-0.5 text-[11px] ${accent ? "text-white/70" : "text-[#0f3a26]/50"}`}>{sub}</p>
    </div>
  );
}
