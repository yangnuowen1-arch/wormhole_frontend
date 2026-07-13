import { useMemo, useState, type FormEvent } from 'react'
import type { Resource } from '../data'

interface TopBarProps {
  editMode: boolean
  isAdmin: boolean
  recentSearches: string[]
  resources: Resource[]
  roleEntryLabel: string
  roleEntryText: string
  searchQuery: string
  userName: string
  onResourceSelect: (resource: Resource) => void
  onSearchQueryChange: (value: string) => void
  onSearchSubmit: (query: string) => void
  onToggleEditMode: () => void
}

export function TopBar({
  editMode,
  isAdmin,
  recentSearches,
  resources,
  roleEntryLabel,
  roleEntryText,
  searchQuery,
  userName,
  onResourceSelect,
  onSearchQueryChange,
  onSearchSubmit,
  onToggleEditMode,
}: TopBarProps) {
  const [focused, setFocused] = useState(false)
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return []
    }

    return resources
      .filter((resource) => {
        const content = [
          resource.name,
          resource.orgType,
          resource.category,
          resource.description,
          resource.models,
          resource.followers,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return content.includes(normalizedQuery)
      })
      .slice(0, 6)
  }, [normalizedQuery, resources])

  const showPanel = focused && (normalizedQuery ? searchResults.length > 0 : recentSearches.length > 0)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (searchQuery.trim()) {
      setFocused(false)
      onSearchSubmit(searchQuery)
    }
  }

  return (
    <header className='flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-8'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-200'>
            <LayoutGridIcon />
          </span>
          <div className='hidden leading-none sm:block'>
            <h1 className='text-base font-extrabold tracking-wide text-slate-900'>
              智能工作台
            </h1>
            <span className='mt-1 block text-[11px] font-semibold text-slate-400'>
              {userName} · 企业资源中心
            </span>
          </div>
        </div>

        <form
          className='relative w-full max-w-xl'
          onSubmit={handleSubmit}
        >
          <SearchIcon className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <input
            type='search'
            value={searchQuery}
            onBlur={() => window.setTimeout(() => setFocused(false), 140)}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            onFocus={() => setFocused(true)}
            placeholder='搜索资源、AI 工具、文档...'
            className='w-full rounded-xl border border-transparent bg-slate-50 py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-100/70 focus:border-sky-200 focus:bg-white focus:ring-4 focus:ring-sky-50'
          />

          {showPanel && (
            <div className='absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70'>
              {!normalizedQuery ? (
                <div className='p-2'>
                  <div className='px-2 pb-1 pt-1 text-[11px] font-bold text-slate-400'>
                    最近搜索
                  </div>
                  {recentSearches.slice(0, 4).map((query) => (
                    <button
                      key={query}
                      type='button'
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onSearchQueryChange(query)
                        onSearchSubmit(query)
                        setFocused(false)
                      }}
                      className='flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950'
                    >
                      <HistoryIcon className='h-4 w-4 text-slate-400' />
                      <span className='truncate'>{query}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className='p-2'>
                  <div className='px-2 pb-1 pt-1 text-[11px] font-bold text-slate-400'>
                    搜索结果
                  </div>
                  {searchResults.map((resource) => (
                    <button
                      key={resource.id}
                      type='button'
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onResourceSelect(resource)
                        setFocused(false)
                      }}
                      className='flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-slate-50'
                    >
                      <span
                        className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold'
                        style={{ backgroundColor: resource.bg, color: resource.color }}
                      >
                        {resource.short}
                      </span>
                      <span className='min-w-0 flex-1'>
                        <span className='block truncate text-sm font-bold text-slate-800'>
                          {resource.name}
                        </span>
                        <span className='block truncate text-[11px] font-semibold text-slate-400'>
                          {resource.orgType} · {resource.models}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      <div className='ml-3 flex items-center gap-2 sm:ml-4 sm:gap-3'>
        <a
          href={isAdmin ? '#admin-edit' : '#recommendations'}
          className='hidden items-center gap-1.5 rounded-xl border border-sky-100 bg-sky-50 px-3.5 py-1.5 text-sm font-bold text-sky-700 no-underline transition-all hover:bg-sky-100 md:flex'
        >
          <SparklesIcon className='h-4 w-4' />
          <span>{roleEntryLabel}</span>
          <span className='text-sky-500/80'>{roleEntryText}</span>
        </a>
        <div className='hidden h-4 w-px bg-slate-200 sm:block' />
        <button
          type='button'
          aria-label='通知'
          className='relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50'
        >
          <BellIcon className='h-4 w-4' />
          <span className='absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500' />
        </button>
        {isAdmin && (
          <button
            type='button'
            aria-label={editMode ? '退出编辑模式' : '进入编辑模式'}
            aria-pressed={editMode}
            onClick={onToggleEditMode}
            className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors sm:flex ${
              editMode
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <SettingsIcon className='h-4 w-4' />
          </button>
        )}
      </div>
    </header>
  )
}

function LayoutGridIcon() {
  return (
    <svg className='h-5 w-5' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z' stroke='currentColor' strokeWidth='1.8' strokeLinejoin='round' />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='m21 21-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
    </svg>
  )
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M12 8v4l2.5 1.5M21 12a9 9 0 1 1-2.64-6.36' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M21 4v5h-5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M12 3.5 13.7 8l4.8 1.7-4.8 1.8L12 16l-1.7-4.5-4.8-1.8L10.3 8 12 3.5ZM18 15l.9 2.2L21 18l-2.1.8L18 21l-.9-2.2L15 18l2.1-.8L18 15Z' stroke='currentColor' strokeWidth='1.8' strokeLinejoin='round' />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M18 9.8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7ZM14 20a2.2 2.2 0 0 1-4 0' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z' stroke='currentColor' strokeWidth='2' />
      <path d='M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.08a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.22.6.79 1 1.55 1H21a2 2 0 0 1 0 4h-.08a1.7 1.7 0 0 0-1.55 1Z' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}
