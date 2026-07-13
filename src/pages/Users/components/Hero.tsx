import type { Shortcut } from '../data'

interface HeroProps {
  editMode: boolean
  quickEntries: Shortcut[]
  recommendedCount: number
  userName: string
  onMoveQuickEntry: (id: string, direction: -1 | 1) => void
  onQuickEntryChange: (id: string, patch: Partial<Shortcut>) => void
  onPersistQuickEntrySort: () => void
}

export function Hero({
  editMode,
  quickEntries,
  recommendedCount,
  userName,
  onMoveQuickEntry,
  onPersistQuickEntrySort,
  onQuickEntryChange
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

      <div className='min-w-0 text-xs font-semibold sm:text-sm'>
        <div className='mb-2 flex items-center justify-between gap-3 sm:justify-end'>
          <span className='shrink-0 text-slate-400'>快捷入口</span>
          {editMode && (
            <button
              type='button'
              onClick={onPersistQuickEntrySort}
              className='rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:border-sky-200 hover:text-sky-700'
            >
              保存排序
            </button>
          )}
        </div>

        <div className='no-scrollbar flex max-w-full gap-1.5 overflow-x-auto sm:justify-end'>
          {quickEntries.slice(0, 6).map((entry, index) => (
            <div
              key={entry.key}
              className='group flex shrink-0 items-center gap-1 rounded-lg border border-slate-100 bg-white px-2.5 py-1 font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-sky-700'
            >
              {editMode ? (
                <>
                  <input
                    value={entry.label}
                    onChange={(event) =>
                      onQuickEntryChange(entry.key, {
                        label: event.target.value
                      })
                    }
                    className='w-20 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-300'
                    aria-label={`${entry.label} 名称`}
                  />
                  <button
                    type='button'
                    disabled={index === 0}
                    onClick={() => onMoveQuickEntry(entry.key, -1)}
                    className='rounded-md px-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30'
                    aria-label='上移快捷入口'
                  >
                    ↑
                  </button>
                  <button
                    type='button'
                    disabled={index === quickEntries.length - 1}
                    onClick={() => onMoveQuickEntry(entry.key, 1)}
                    className='rounded-md px-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30'
                    aria-label='下移快捷入口'
                  >
                    ↓
                  </button>
                </>
              ) : (
                <a
                  href={entry.targetUrl ?? '#'}
                  target={isExternalUrl(entry.targetUrl) ? '_blank' : undefined}
                  rel={
                    isExternalUrl(entry.targetUrl) ? 'noreferrer' : undefined
                  }
                  className='flex items-center gap-1.5 text-slate-600 no-underline transition-colors group-hover:text-sky-700'
                >
                  <span style={{ color: entry.color }}>{entry.icon}</span>
                  <span>{entry.label}</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function isExternalUrl(value?: string) {
  return Boolean(value?.startsWith('http://') || value?.startsWith('https://'))
}
