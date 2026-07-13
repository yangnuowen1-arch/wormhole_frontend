import { useMemo, useState } from 'react'
import type { Resource, ResourceCategory } from '../data'

type ResourceSortKey = 'sortOrder' | 'name' | 'models' | 'followers'

interface ResourceHubProps {
  categories: ResourceCategory[]
  editMode: boolean
  favoriteIds: string[]
  resources: Resource[]
  onCategoryChange: (id: string, patch: Partial<ResourceCategory>) => void
  onMoveCategory: (id: string, direction: -1 | 1) => void
  onMoveResource: (id: string, direction: -1 | 1) => void
  onOpenResource: (resource: Resource) => void
  onResourceChange: (id: string, patch: Partial<Resource>) => void
  onToggleFavorite: (resource: Resource) => void
}

export function ResourceHub({
  categories,
  editMode,
  favoriteIds,
  resources,
  onCategoryChange,
  onMoveCategory,
  onMoveResource,
  onOpenResource,
  onResourceChange,
  onToggleFavorite,
}: ResourceHubProps) {
  const [active, setActive] = useState('all')
  const [sortKey, setSortKey] = useState<ResourceSortKey>('sortOrder')

  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [categories],
  )

  const filtered = useMemo(() => {
    const next =
      active === 'all'
        ? resources
        : resources.filter((resource) => resource.category === active)

    return [...next].sort((a, b) => compareResources(a, b, sortKey))
  }, [active, resources, sortKey])

  return (
    <section className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6'>
      <div className='mb-5 flex flex-col justify-between gap-4 sm:mb-6 xl:flex-row xl:items-center'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-bold text-slate-900 sm:text-base'>
            资源中心
          </h3>
          <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600'>
            共 {resources.length} 个资源
          </span>
        </div>

        <div className='flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center'>
          <label className='flex shrink-0 items-center gap-2 text-xs font-bold text-slate-500'>
            <span>排序</span>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as ResourceSortKey)}
              className='rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-300'
            >
              <option value='sortOrder'>默认</option>
              <option value='name'>名称</option>
              <option value='models'>模型数</option>
              <option value='followers'>关注度</option>
            </select>
          </label>

          <div className='no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1 text-xs font-semibold sm:text-sm'>
            {orderedCategories.map((category, index) => {
              const isActive = category.id === active

              return (
                <div
                  key={category.id}
                  className={`flex shrink-0 items-center gap-1 rounded-lg transition-all ${
                    isActive ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {editMode ? (
                    <>
                      <input
                        value={category.label}
                        onChange={(event) => onCategoryChange(category.id, { label: event.target.value })}
                        className='w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 outline-none focus:border-sky-300'
                        aria-label={`${category.label} tab 名称`}
                      />
                      <button
                        type='button'
                        disabled={index === 0}
                        onClick={() => onMoveCategory(category.id, -1)}
                        className='px-1 text-slate-400 hover:text-slate-700 disabled:opacity-30'
                        aria-label='上移 tab'
                      >
                        ↑
                      </button>
                      <button
                        type='button'
                        disabled={index === orderedCategories.length - 1}
                        onClick={() => onMoveCategory(category.id, 1)}
                        className='px-1 text-slate-400 hover:text-slate-700 disabled:opacity-30'
                        aria-label='下移 tab'
                      >
                        ↓
                      </button>
                    </>
                  ) : (
                    <button
                      type='button'
                      onClick={() => setActive(category.id)}
                      className='rounded-lg px-3 py-1.5 font-semibold'
                    >
                      {category.label.replace('资源', '')}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {filtered.slice(0, 12).map((resource, index) => (
          <ResourceCard
            key={resource.id}
            editMode={editMode}
            isFavorite={favoriteIds.includes(resource.id)}
            resource={resource}
            categories={orderedCategories}
            canMoveUp={index > 0}
            canMoveDown={index < filtered.length - 1}
            onMoveResource={onMoveResource}
            onOpenResource={onOpenResource}
            onResourceChange={onResourceChange}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  )
}

function ResourceCard({
  canMoveDown,
  canMoveUp,
  categories,
  editMode,
  isFavorite,
  resource,
  onMoveResource,
  onOpenResource,
  onResourceChange,
  onToggleFavorite,
}: {
  canMoveDown: boolean
  canMoveUp: boolean
  categories: ResourceCategory[]
  editMode: boolean
  isFavorite: boolean
  resource: Resource
  onMoveResource: (id: string, direction: -1 | 1) => void
  onOpenResource: (resource: Resource) => void
  onResourceChange: (id: string, patch: Partial<Resource>) => void
  onToggleFavorite: (resource: Resource) => void
}) {
  return (
    <article className='cursor-pointer rounded-xl border border-slate-100 bg-slate-50/30 p-4 transition-all duration-300 hover:border-sky-100 hover:bg-white hover:shadow-md'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <button
            type='button'
            onClick={() => onOpenResource(resource)}
            className='shrink-0 text-left'
            aria-label={`打开 ${resource.name}`}
          >
            <span
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold'
            style={{ backgroundColor: resource.bg, color: resource.color }}
            >
              {resource.short}
            </span>
          </button>
          <div className='min-w-0 flex-1'>
            {editMode ? (
              <input
                value={resource.name}
                onChange={(event) => onResourceChange(resource.id, { name: event.target.value })}
                className='w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-bold text-slate-800 outline-none focus:border-sky-300'
                aria-label={`${resource.name} 名称`}
              />
            ) : (
              <button
                type='button'
                onClick={() => onOpenResource(resource)}
                className='block w-full truncate text-left text-sm font-bold text-slate-800 hover:text-sky-700'
              >
                {resource.name}
              </button>
            )}
            <span className='mt-0.5 block text-[11px] font-semibold text-slate-400'>
              模型数: {resource.models.replace(' 个模型', '')} | 关注度:{' '}
              {resource.followers.replace(' 关注者', '')}
            </span>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-1'>
          <button
            type='button'
            onClick={() => onToggleFavorite(resource)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              isFavorite
                ? 'bg-amber-50 text-amber-400 hover:bg-amber-100'
                : 'text-slate-300 hover:bg-slate-100 hover:text-amber-400'
            }`}
            aria-label={isFavorite ? '取消星标' : '加入常用工具'}
          >
            ★
          </button>
          {resource.tier && !editMode && (
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                resource.tier === 'Enterprise'
                  ? 'bg-sky-50 text-sky-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {resource.tier}
            </span>
          )}
        </div>
      </div>

      <div className='mt-3'>
        {editMode ? (
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]'>
            <select
              value={resource.category}
              onChange={(event) => onResourceChange(resource.id, { category: event.target.value })}
              className='rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-300'
              aria-label={`${resource.name} 分类`}
            >
              {categories
                .filter((category) => category.id !== 'all')
                .map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.label}
                  </option>
                ))}
            </select>
            <div className='flex items-center gap-1'>
              <button
                type='button'
                disabled={!canMoveUp}
                onClick={() => onMoveResource(resource.id, -1)}
                className='rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 hover:border-sky-200 hover:text-sky-700 disabled:opacity-30'
              >
                上移
              </button>
              <button
                type='button'
                disabled={!canMoveDown}
                onClick={() => onMoveResource(resource.id, 1)}
                className='rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 hover:border-sky-200 hover:text-sky-700 disabled:opacity-30'
              >
                下移
              </button>
            </div>
          </div>
        ) : (
          <p className='truncate text-xs font-semibold text-slate-500'>
            {resource.orgType} · {resource.category} · {resource.description ?? '企业资源与模型生态入口。'}
          </p>
        )}
      </div>
    </article>
  )
}

function compareResources(a: Resource, b: Resource, sortKey: ResourceSortKey) {
  if (sortKey === 'name') {
    return a.name.localeCompare(b.name, 'zh-Hans-CN')
  }

  if (sortKey === 'models') {
    return (b.modelCount ?? countFromText(b.models)) - (a.modelCount ?? countFromText(a.models))
  }

  if (sortKey === 'followers') {
    return (b.followerCount ?? countFromText(b.followers)) - (a.followerCount ?? countFromText(a.followers))
  }

  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
}

function countFromText(value: string) {
  const normalized = value.replace(/,/g, '').toLowerCase()
  const match = normalized.match(/([\d.]+)/)

  if (!match) {
    return 0
  }

  const base = Number(match[1])
  if (Number.isNaN(base)) {
    return 0
  }

  if (normalized.includes('k')) {
    return base * 1000
  }

  return base
}
