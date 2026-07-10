import { TOOLS } from '../data'

export function ToolsRow() {
  return (
    <section className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between sm:mb-5'>
        <h3 className='flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base'>
          <span className='text-amber-400'>★</span>
          <span>常用工具</span>
        </h3>
        <button
          type='button'
          className='text-sm font-bold text-purple-600 hover:text-purple-700 sm:text-sm'
        >
          管理列表
        </button>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {TOOLS.slice(0, 3).map((tool) => (
          <a
            key={tool.id}
            href={`https://${tool.domain}`}
            target='_blank'
            rel='noreferrer'
            className='group flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 no-underline transition-all duration-300 hover:border-purple-100 hover:bg-white hover:shadow-md hover:shadow-purple-50'
          >
            <span
              className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold'
              style={{ backgroundColor: tool.bg, color: tool.color }}
            >
              {tool.short}
            </span>
            <span className='min-w-0'>
              <span className='block truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-purple-600'>
                {tool.name}
              </span>
              <span className='block truncate text-[11px] font-semibold text-slate-400 sm:text-xs'>
                {tool.role}
              </span>
            </span>
          </a>
        ))}

        <button
          type='button'
          className='group flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-white p-3 transition-all duration-300 hover:border-purple-300'
        >
          <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500'>
            +
          </span>
          <span className='min-w-0 text-left'>
            <span className='block truncate text-sm font-bold text-slate-500'>
              添加工具
            </span>
            <span className='block truncate text-[11px] font-semibold text-slate-400 sm:text-xs'>
              自定义面板
            </span>
          </span>
        </button>
      </div>
    </section>
  )
}
