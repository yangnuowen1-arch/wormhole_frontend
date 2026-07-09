import { useMemo, useState } from 'react'
import { RESOURCE_CATEGORIES, RESOURCES, type Resource } from '../data'

function ResourceCard({ r }: { r: Resource }) {
  return (
    <a
      href='#'
      className='flex items-center gap-3 rounded-xl border border-[#ececf0] bg-white p-3.5 no-underline transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4'
    >
      <span
        className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[0.9rem] font-bold sm:h-12 sm:w-12'
        style={{ backgroundColor: r.bg, color: r.color }}
      >
        {r.short}
      </span>

      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-1.5'>
          <span className='truncate text-[0.88rem] font-semibold text-[#1f2328] sm:text-[0.92rem]'>
            {r.name}
          </span>
          {r.tier && (
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[0.58rem] font-semibold ${
                r.tier === 'Enterprise'
                  ? 'bg-[#f0efff] text-[#6366f1]'
                  : 'bg-[#ecfdf5] text-[#10b981]'
              }`}
            >
              {r.tier}
            </span>
          )}
        </div>
        <div className='mt-1 truncate text-[0.7rem] text-[#9096a2] sm:text-[0.72rem]'>
          {r.orgType} · {r.models} · {r.followers}
        </div>
      </div>
    </a>
  )
}

export function ResourceHub() {
  const [active, setActive] = useState('all')

  const filtered = useMemo(
    () =>
      active === 'all'
        ? RESOURCES
        : RESOURCES.filter((r) => r.category === active),
    [active]
  )

  return (
    <section>
      <div className='mb-3 flex items-center justify-between sm:mb-4'>
        <h2 className='text-[0.95rem] font-bold text-[#1f2328] sm:text-[1.05rem]'>
          资源中心
        </h2>
        <span className='text-[0.72rem] text-[#9096a2] sm:text-[0.78rem]'>
          {filtered.length} 个结果
        </span>
      </div>

      <div className='mb-4 flex flex-wrap gap-1.5 sm:mb-5 sm:gap-2'>
        {RESOURCE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type='button'
            onClick={() => setActive(c.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.78rem] font-medium transition-colors sm:px-3.5 sm:text-[0.82rem] ${
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

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4'>
        {filtered.map((r) => (
          <ResourceCard
            key={r.id}
            r={r}
          />
        ))}
      </div>
    </section>
  )
}
