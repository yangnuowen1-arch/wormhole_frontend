import { TOOLS } from '../data'

export function ToolsRow() {
  return (
    <section>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-[0.95rem] font-bold text-[#1f2328] sm:text-[1rem]'>
          <span className='text-[#f59e0b]'>★</span> 常用工具
        </h2>
        <button
          type='button'
          className='text-[0.78rem] font-medium text-[#6366f1] sm:text-[0.82rem]'
        >
          管理 ⌄
        </button>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
        {TOOLS.map((t) => (
          <a
            key={t.id}
            href={`https://${t.domain}`}
            target='_blank'
            rel='noreferrer'
            className='flex items-center gap-3 rounded-xl border border-[#ececf0] bg-white p-3 no-underline transition-all hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl'
          >
            <span
              className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[0.85rem] font-bold'
              style={{ backgroundColor: t.bg, color: t.color }}
            >
              {t.short}
            </span>
            <div className='min-w-0'>
              <div className='truncate text-[0.85rem] font-semibold text-[#1f2328]'>
                {t.name}
              </div>
              <div className='truncate text-[0.7rem] text-[#9096a2]'>
                {t.role}
              </div>
            </div>
          </a>
        ))}

        <button
          type='button'
          className='flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#d5d8de] p-3 text-[0.8rem] text-[#9096a2] hover:bg-white sm:rounded-2xl'
        >
          <span className='text-lg leading-none'>+</span>
          添加工具
        </button>
      </div>
    </section>
  )
}
