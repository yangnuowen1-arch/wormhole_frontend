import type { Shortcut } from '../data'

interface HeroProps {
  quickEntries: Shortcut[]
  recommendedCount: number
  userName: string
  onOpenQuickEntry: (entry: Shortcut) => void
}

export function Hero({
  quickEntries,
  recommendedCount,
  userName,
  onOpenQuickEntry
}: HeroProps) {
  return (
    <section className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
      <div>
        <h2 className='flex items-center gap-2 text-xl font-extrabold text-slate-900 sm:text-2xl'>
          <span>早上好，{userName}</span>
          <span className='animate-bounce'>👋</span>
        </h2>
        <p className='mt-1 text-xs font-semibold text-slate-500 sm:text-sm'>
          今天有 {recommendedCount} 个新工具推荐给您，快来发现吧。
        </p>
      </div>

      <div className='flex min-w-0 items-center gap-2 text-xs font-semibold sm:gap-3 sm:text-sm'>
        <span className='shrink-0 text-slate-400'>快捷入口</span>
        <div className='no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto'>
          {quickEntries.slice(0, 5).map((entry) => (
            <div
              key={entry.key}
              className='group flex shrink-0 items-center gap-1 rounded-lg border border-slate-100 bg-white px-2.5 py-1 font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-sky-700'
            >
              <button
                type='button'
                onClick={() => onOpenQuickEntry(entry)}
                className='flex cursor-pointer items-center gap-1.5 text-slate-600 no-underline transition-colors group-hover:text-sky-700'
              >
                {/* <span style={{ color: entry.color }}>{entry.icon}</span>  */}
                <span>{entry.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
