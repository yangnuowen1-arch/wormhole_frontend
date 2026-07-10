import { PICKS } from '../data'

export function AssistantAndPicks() {
  return (
    <div className='space-y-5 sm:space-y-6'>
      <AssistantPanel />
      <TodayRecommend />
    </div>
  )
}

function AssistantPanel() {
  return (
    <section className='group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-900 to-purple-800 p-5 text-white shadow-xl shadow-purple-950/10 sm:p-6'>
      <div className='absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-purple-600/30 blur-3xl transition-transform duration-700 group-hover:scale-125' />

      <div className='relative z-10 flex h-full flex-col justify-between space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md'>
              <SparklesIcon className='h-4 w-4 text-purple-300' />
            </span>
            <span className='text-sm font-bold tracking-wide sm:text-sm'>
              AI 助手控制台
            </span>
          </div>
          <span className='rounded-full border border-purple-400/20 bg-purple-500/20 px-2 py-0.5 text-[10px] font-extrabold text-purple-300'>
            在线
          </span>
        </div>

        <div className='space-y-1.5'>
          <p className='text-[11px] font-bold uppercase tracking-wider text-purple-200/80'>
            快速问答与智能推荐
          </p>
          <p className='text-sm font-semibold leading-relaxed text-slate-100'>
            重找工具、对比性能、生成报告。一站式为您提供沉浸式生产力体验。
          </p>
        </div>

        <div className='relative'>
          <input
            type='text'
            placeholder="向助手提问：例如 '推荐最热门大模型'"
            className='w-full rounded-xl border border-white/10 bg-white/10 py-2 pl-3 pr-10 text-sm font-semibold text-slate-100 outline-none transition-all placeholder:text-white/50 hover:bg-white/15 focus:border-white focus:bg-white focus:text-slate-800 focus:placeholder:text-slate-400'
          />
          <button
            type='button'
            aria-label='发送'
            className='absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-white text-purple-900 shadow-md transition-all hover:bg-purple-50'
          >
            →
          </button>
        </div>
      </div>
    </section>
  )
}

function TodayRecommend() {
  return (
    <section className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h3 className='flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base'>
            <span className='text-purple-600'>📈</span>
            今日推荐
          </h3>
          <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600'>
            {PICKS.length} 条
          </span>
        </div>
        <button
          type='button'
          className='text-sm font-bold text-purple-600 hover:text-purple-700 sm:text-sm'
        >
          查看全部
        </button>
      </div>

      <div className='space-y-3'>
        {PICKS.map((pick) => (
          <a
            key={pick.id}
            href='#'
            className='group flex items-center gap-3 rounded-xl p-2 no-underline transition-colors hover:bg-slate-50'
          >
            <span
              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold'
              style={{ backgroundColor: pick.iconBg, color: pick.iconColor }}
            >
              {pick.icon}
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-purple-600'>
                {pick.title}
              </span>
              <span className='mt-0.5 block truncate text-[11px] font-semibold text-slate-400'>
                {pick.source}
              </span>
            </span>
            <span className='shrink-0 text-[11px] font-semibold text-slate-400'>{pick.time}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M12 3.5 13.7 8l4.8 1.7-4.8 1.8L12 16l-1.7-4.5-4.8-1.8L10.3 8 12 3.5Z' stroke='currentColor' strokeWidth='1.8' strokeLinejoin='round' />
    </svg>
  )
}
