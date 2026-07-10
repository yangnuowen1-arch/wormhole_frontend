import { SHORTCUTS } from '../data'

export function Hero() {
  return (
    <section className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
      <div>
        <h2 className='flex items-center gap-2 text-xl font-extrabold text-slate-900 sm:text-2xl'>
          <span>早上好，美夕</span>
          <span className='animate-bounce'>👋</span>
        </h2>
        <p className='mt-1 text-xs font-semibold text-slate-500 sm:text-sm'>
          今天有 3 个新工具推荐给您，快来发现吧。
        </p>
      </div>

      <div className='flex items-center gap-2 text-xs font-semibold sm:text-sm'>
        <span className='shrink-0 text-slate-400'>快捷入口:</span>
        <div className='no-scrollbar flex gap-1.5 overflow-x-auto'>
          {SHORTCUTS.slice(0, 4).map((shortcut) => (
            <a
              key={shortcut.key}
              href='#'
              className='shrink-0 rounded-lg border border-slate-100 bg-white px-2.5 py-1 font-semibold text-slate-600 no-underline transition-all hover:bg-slate-50 hover:text-purple-600'
            >
              {shortcut.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
