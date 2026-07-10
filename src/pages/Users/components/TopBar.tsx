export function TopBar() {
  return (
    <header className='flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-8'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-200'>
            <LayoutGridIcon />
          </span>
          <div className='hidden leading-none sm:block'>
            <h1 className='text-base font-extrabold tracking-wide text-slate-900'>
              智能工作台
            </h1>
            <span className='mt-1 block text-[11px] font-semibold text-slate-400'>
              企业资源中心 v2.5
            </span>
          </div>
        </div>

        <div className='relative w-full max-w-lg'>
          <SearchIcon className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='搜索资源、AI工具、文档...'
            className='w-full rounded-xl border border-transparent bg-slate-50 py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-100/70 focus:border-purple-200 focus:bg-white focus:ring-4 focus:ring-purple-50'
          />
        </div>
      </div>

      <div className='ml-3 flex items-center gap-2 sm:ml-4 sm:gap-4'>
        <button
          type='button'
          className='flex items-center gap-1.5 rounded-xl border border-purple-100 bg-purple-50 px-2.5 py-1.5 text-sm font-bold text-purple-700 transition-all hover:bg-purple-100 sm:px-3.5'
        >
          <SparklesIcon className='h-4 w-4' />
          <span className='hidden sm:inline'>显示设计解析</span>
          <span className='inline sm:hidden'>解析</span>
        </button>
        <div className='hidden h-4 w-px bg-slate-200 sm:block' />
        <button
          type='button'
          aria-label='通知'
          className='relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50'
        >
          <BellIcon className='h-4 w-4' />
          <span className='absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500' />
        </button>
        <button
          type='button'
          aria-label='设置'
          className='hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 sm:flex'
        >
          <SettingsIcon className='h-4 w-4' />
        </button>
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
