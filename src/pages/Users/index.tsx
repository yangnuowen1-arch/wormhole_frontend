import { useMemo, useState } from 'react'
import {
  NAV_ITEMS,
  STATS,
  SHORTCUTS,
  PICKS,
  PINNED,
  RESOURCE_CATEGORIES,
  RESOURCES,
  type Resource,
} from './data'

function Sidebar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col justify-between border-r border-[#ececf0] bg-white">
      <div>
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white text-lg">◈</span>
          <div className="leading-tight">
            <div className="text-[0.95rem] font-bold text-[#1f2328]">Portal</div>
            <div className="text-[0.72rem] text-[#9096a2]">Enterprise Hub</div>
          </div>
        </div>

        <nav className="mt-3 px-3">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[0.9rem] transition-colors ${
                item.id === active
                  ? 'bg-[#f0efff] font-semibold text-[#6366f1]'
                  : 'text-[#5b6170] hover:bg-[#f6f7f9]'
              }`}
            >
              <span className="w-4 text-center text-[0.95rem]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="border-t border-[#ececf0] p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-[0.75rem] font-bold text-white">JD</span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[0.85rem] font-semibold text-[#1f2328]">Jordan Davis</div>
            <div className="truncate text-[0.72rem] text-[#9096a2]">jordan@company.io</div>
          </div>
        </div>
        <button type="button" className="mt-3 w-full rounded-lg border border-[#ececf0] py-1.5 text-[0.8rem] text-[#9096a2] hover:bg-[#f6f7f9]">
          ‹ Collapse
        </button>
      </div>
    </aside>
  )
}

function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#ececf0] bg-[#fbfbfd]/80 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-2 text-[0.85rem]">
        <span className="text-[#9096a2]">Portal</span>
        <span className="text-[#c9ccd3]">›</span>
        <span className="font-medium text-[#1f2328]">Home</span>
      </div>
      <div className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-xl border border-[#ececf0] bg-white px-3 py-2 text-[0.85rem] text-[#9096a2]">
        <span>⌕</span>
        <input className="flex-1 border-none bg-transparent outline-none placeholder:text-[#9096a2]" placeholder="Search resources, tools, docs..." />
        <span className="rounded border border-[#ececf0] px-1.5 py-0.5 text-[0.7rem]">⌘K</span>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] px-3 py-1.5 text-[0.8rem] font-medium text-white">
          ✦ Ask AI
        </button>
        <button type="button" className="text-[#9096a2] hover:text-[#1f2328]">◔</button>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-[0.72rem] font-bold text-white">JD</span>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#ececf0] bg-gradient-to-br from-[#f3f2ff] via-[#f7f6ff] to-[#eef6f5] px-8 py-8">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[0.72rem] font-medium text-[#6366f1]">
        ◔ Tuesday, July 8
      </span>
      <h1 className="mt-4 text-[2.1rem] font-extrabold tracking-tight text-[#1f2328]">Good morning, Jordan.</h1>
      <p className="mt-1 text-[0.95rem] text-[#5b6170]">
        You have <span className="font-semibold text-[#6366f1]">3 unread alerts</span> and{' '}
        <span className="font-semibold text-[#6366f1]">27 resources</span> at your fingertips.
      </p>

      <div className="mt-5 flex max-w-2xl items-center gap-2 rounded-2xl border border-[#ececf0] bg-white px-4 py-2.5 shadow-sm">
        <span className="text-[#9096a2]">⌕</span>
        <input className="flex-1 border-none bg-transparent text-[0.9rem] outline-none placeholder:text-[#9096a2]" placeholder="Search tools, documentation, resources..." />
        <span className="text-[0.8rem] text-[#9096a2]">or</span>
        <button type="button" className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] px-3 py-1.5 text-[0.8rem] font-medium text-white">
          ✦ Ask AI
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[0.75rem] font-medium uppercase tracking-wide text-[#9096a2]">Quick access</span>
        {SHORTCUTS.map(s => (
          <button
            key={s.key}
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#ececf0] bg-white px-3 py-1.5 text-[0.8rem] font-medium text-[#1f2328] hover:shadow-sm"
          >
            <span style={{ color: s.color }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
        <button type="button" className="rounded-lg border border-dashed border-[#d5d8de] px-3 py-1.5 text-[0.8rem] text-[#9096a2] hover:bg-white">
          + Add shortcut
        </button>
      </div>
    </section>
  )
}

function StatsRow() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {STATS.map(s => (
        <div key={s.id} className="rounded-2xl border border-[#ececf0] bg-white p-5">
          <div className="flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f6f7f9] text-[#6366f1]">{s.icon}</span>
            <span className="text-[0.72rem] text-[#9096a2]">{s.hint}</span>
          </div>
          <div className="mt-4 text-2xl font-extrabold text-[#1f2328]">{s.value}</div>
          <div className="text-[0.82rem] text-[#9096a2]">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function AssistantAndPicks() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#4f2bd6] p-7 text-white">
        <span className="absolute right-5 top-5 rounded-full bg-white/15 px-2.5 py-1 text-[0.68rem] font-medium">● Live</span>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">✦</span>
        <div className="mt-8">
          <h3 className="text-[1.35rem] font-bold">AI Assistant</h3>
          <p className="mt-2 max-w-sm text-[0.88rem] text-white/80">
            Find tools, compare resources, generate reports, and get smart suggestions tailored to your workflow.
          </p>
          <button type="button" className="mt-5 text-[0.9rem] font-semibold text-white">
            Open assistant →
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#ececf0] bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[0.95rem] font-bold text-[#1f2328]">
            <span className="text-[#6366f1]">📈</span> Today's Picks
            <span className="rounded-full bg-[#f0efff] px-2 py-0.5 text-[0.7rem] font-semibold text-[#6366f1]">4</span>
          </div>
          <button type="button" className="text-[0.8rem] font-medium text-[#6366f1]">View all →</button>
        </div>
        <ul className="mt-3">
          {PICKS.map(p => (
            <li key={p.id} className="flex items-center gap-3 border-b border-[#f2f3f5] py-3 last:border-none">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[0.9rem]" style={{ backgroundColor: p.iconBg, color: p.iconColor }}>
                {p.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[0.85rem] font-medium text-[#1f2328]">{p.title}</div>
                <div className="text-[0.75rem] text-[#9096a2]">{p.source}</div>
              </div>
              <span className="flex-shrink-0 text-[0.72rem] text-[#9096a2]">{p.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PinnedRow() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[1rem] font-bold text-[#1f2328]">
          <span className="text-[#f59e0b]">★</span> Pinned
          <span className="text-[0.78rem] font-normal text-[#9096a2]">5 items</span>
        </h2>
        <button type="button" className="text-[0.82rem] font-medium text-[#6366f1]">Manage ⌄</button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {PINNED.map(p => (
          <a
            key={p.id}
            href={`https://${p.domain}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-3 rounded-2xl border border-[#ececf0] bg-white px-4 py-6 text-center no-underline transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-[0.85rem] font-bold" style={{ backgroundColor: p.bg, color: p.color }}>
              {p.short}
            </span>
            <div>
              <div className="text-[0.88rem] font-semibold text-[#1f2328]">{p.name}</div>
              <div className="text-[0.75rem] text-[#9096a2]">{p.domain}</div>
            </div>
          </a>
        ))}
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#d5d8de] px-4 py-6 text-[#9096a2] hover:bg-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f6f7f9] text-lg">+</span>
          <span className="text-[0.8rem]">Add pin</span>
        </button>
      </div>
    </section>
  )
}

function ResourceCard({ r }: { r: Resource }) {
  return (
    <a
      href={`https://${r.domain}`}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col rounded-2xl border border-[#ececf0] bg-white p-4 no-underline transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg text-[0.78rem] font-bold" style={{ backgroundColor: r.bg, color: r.color }}>
          {r.short}
        </span>
        {r.isNew ? (
          <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[0.62rem] font-bold uppercase text-[#10b981]">New</span>
        ) : r.starred ? (
          <span className="text-[0.85rem] text-[#f59e0b]">★</span>
        ) : null}
      </div>
      <div className="mt-3 text-[0.92rem] font-semibold text-[#1f2328]">{r.name}</div>
      <p className="mt-1 line-clamp-2 text-[0.78rem] leading-relaxed text-[#9096a2]">{r.desc}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-md bg-[#f6f7f9] px-2 py-0.5 text-[0.68rem] font-medium text-[#5b6170]">{r.categoryLabel}</span>
        <span className="truncate text-[0.7rem] text-[#c0c4cc]">{r.domain}</span>
      </div>
    </a>
  )
}

function AllResources() {
  const [active, setActive] = useState('all')

  const filtered = useMemo(
    () => (active === 'all' ? RESOURCES : RESOURCES.filter(r => r.category === active)),
    [active],
  )

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[1.05rem] font-bold text-[#1f2328]">All Resources</h2>
        <span className="text-[0.78rem] text-[#9096a2]">{filtered.length} results</span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {RESOURCE_CATEGORIES.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.82rem] font-medium transition-colors ${
              c.id === active
                ? 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white'
                : 'border border-[#ececf0] bg-white text-[#5b6170] hover:bg-[#f6f7f9]'
            }`}
          >
            <span>{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filtered.map(r => (
          <ResourceCard key={r.id} r={r} />
        ))}
      </div>
    </section>
  )
}

function Users() {
  const [activeNav, setActiveNav] = useState('home')

  return (
    <div className="flex min-h-screen bg-[#fbfbfd] text-[#1f2328]">
      <Sidebar active={activeNav} onSelect={setActiveNav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1500px] space-y-6 px-6 py-6">
          <Hero />
          <StatsRow />
          <AssistantAndPicks />
          <PinnedRow />
          <AllResources />
        </main>
      </div>
    </div>
  )
}

export default Users
