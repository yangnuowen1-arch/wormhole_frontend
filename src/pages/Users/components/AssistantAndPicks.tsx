import { PICKS } from '../data'

export function AssistantAndPicks() {
  return (
    <div className='grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2'>
      <div className='relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4f2bd6] p-6 text-white sm:rounded-2xl sm:p-7'>
        <span className='absolute right-4 top-4 rounded-full bg-white/15 px-2 py-0.5 text-[0.65rem] font-medium sm:right-5 sm:top-5 sm:px-2.5 sm:py-1 sm:text-[0.68rem]'>
          ● 在线
        </span>
        <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg sm:h-11 sm:w-11 sm:text-xl'>
          ✦
        </span>
        <div className='mt-6 sm:mt-8'>
          <h3 className='text-[1.2rem] font-bold sm:text-[1.35rem]'>AI 助手</h3>
          <p className='mt-1.5 max-w-sm text-[0.82rem] text-white/80 sm:mt-2 sm:text-[0.88rem]'>
            查找工具、对比资源、生成报告，为你的工作流量身推荐。
          </p>
          <button
            type='button'
            className='mt-4 text-[0.85rem] font-semibold text-white sm:mt-5 sm:text-[0.9rem]'
          >
            打开助手 →
          </button>
        </div>
      </div>

      <div className='rounded-xl border border-[#ececf0] bg-white p-4 sm:rounded-2xl sm:p-5'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-[0.9rem] font-bold text-[#1f2328] sm:text-[0.95rem]'>
            <span className='text-[#6366f1]'>📈</span> 今日推荐
            <span className='rounded-full bg-[#f0efff] px-1.5 py-0.5 text-[0.68rem] font-semibold text-[#6366f1] sm:px-2 sm:text-[0.7rem]'>
              4
            </span>
          </div>
          <button
            type='button'
            className='text-[0.75rem] font-medium text-[#6366f1] sm:text-[0.8rem]'
          >
            查看全部
          </button>
        </div>
        <ul className='mt-3'>
          {PICKS.map((p) => (
            <li
              key={p.id}
              className='flex items-center gap-2.5 border-b border-[#f2f3f5] py-2.5 last:border-none sm:gap-3 sm:py-3'
            >
              <span
                className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[0.85rem] sm:h-8 sm:w-8 sm:text-[0.9rem]'
                style={{ backgroundColor: p.iconBg, color: p.iconColor }}
              >
                {p.icon}
              </span>
              <div className='min-w-0 flex-1'>
                <div className='truncate text-[0.8rem] font-medium text-[#1f2328] sm:text-[0.85rem]'>
                  {p.title}
                </div>
                <div className='text-[0.7rem] text-[#9096a2] sm:text-[0.75rem]'>
                  {p.source}
                </div>
              </div>
              <span className='flex-shrink-0 text-[0.68rem] text-[#9096a2] sm:text-[0.72rem]'>
                {p.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
