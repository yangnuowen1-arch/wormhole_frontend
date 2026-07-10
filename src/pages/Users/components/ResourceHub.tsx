import { useMemo, useState } from 'react'
import { RESOURCE_CATEGORIES, RESOURCES, type Resource } from '../data'

export function ResourceHub() {
  const [active, setActive] = useState('all')

  const filtered = useMemo(
    () =>
      active === 'all'
        ? RESOURCES
        : RESOURCES.filter((resource) => resource.category === active),
    [active],
  )

  return (
    <section className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6'>
      <div className='mb-5 flex flex-col justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-bold text-slate-900 sm:text-base'>
            资源中心
          </h3>
          <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600'>
            共 {RESOURCES.length} 个模型
          </span>
        </div>

        <div className='no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1 text-xs font-semibold sm:text-sm'>
          {RESOURCE_CATEGORIES.slice(0, 4).map((category) => {
            const isActive = category.id === active

            return (
              <button
                key={category.id}
                type='button'
                onClick={() => setActive(category.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {category.label.replace('资源', '')}
              </button>
            )
          })}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {filtered.slice(0, 8).map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
          />
        ))}
      </div>
    </section>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <a
      href='#'
      className='cursor-pointer rounded-xl border border-slate-100 bg-slate-50/30 p-4 no-underline transition-all duration-300 hover:border-purple-100 hover:bg-white hover:shadow-md'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <span
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold'
            style={{ backgroundColor: resource.bg, color: resource.color }}
          >
            {resource.short}
          </span>
          <span className='min-w-0'>
            <span className='block truncate text-sm font-bold text-slate-800'>
              {resource.name}
            </span>
            <span className='mt-0.5 block text-[11px] font-semibold text-slate-400'>
              模型数: {resource.models.replace(' 个模型', '')} | 关注度:{' '}
              {resource.followers.replace(' 关注者', '')}
            </span>
          </span>
        </div>

        {resource.tier && (
          <span
            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
              resource.tier === 'Enterprise'
                ? 'bg-purple-50 text-purple-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {resource.tier}
          </span>
        )}
      </div>

      <p className='mt-3 truncate text-xs font-semibold text-slate-500'>
        {resource.orgType} · {resource.category} · 企业资源与模型生态入口。
      </p>
    </a>
  )
}
