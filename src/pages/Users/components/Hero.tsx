import { SHORTCUTS } from '../data'

export function Hero() {
  return (
    <section className='relative overflow-hidden rounded-xl border border-[#ececf0] bg-gradient-to-br from-[#f3f2ff] via-[#f7f6ff] to-[#eef6f5] px-5 py-6 sm:rounded-2xl sm:px-8 sm:py-8'>
      <h1 className='text-[1.6rem] font-extrabold tracking-tight text-[#1f2328] sm:text-[2.1rem]'>
        早上好👋
      </h1>
      <p className='mt-1.5 text-[0.85rem] text-[#5b6170] sm:text-[0.9rem]'>
        今天有 3 个新工具值得一看，快去发现吧。
      </p>

      <div className='mt-4 flex max-w-2xl items-center gap-2 rounded-xl border border-[#ececf0] bg-white px-3 py-2 shadow-sm sm:mt-5 sm:rounded-2xl sm:px-4 sm:py-2.5'>
        <span className='text-[#9096a2]'>⌕</span>
        <input
          className='flex-1 border-none bg-transparent text-[0.85rem] outline-none placeholder:text-[#9096a2] sm:text-[0.9rem]'
          placeholder='搜索工具、文档…'
        />
        <button
          type='button'
          className='hidden items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] px-3 py-1.5 text-[0.8rem] font-medium text-white sm:flex'
        >
          搜索
        </button>
      </div>

      <div className='mt-3 flex flex-wrap items-center gap-2 sm:mt-4'>
        <span className='mr-1 hidden text-[0.75rem] font-medium tracking-wide text-[#9096a2] sm:inline'>
          快捷入口
        </span>
        {SHORTCUTS.map((s) => (
          <button
            key={s.key}
            type='button'
            className='flex items-center gap-1.5 rounded-lg border border-[#ececf0] bg-white px-2.5 py-1.5 text-[0.75rem] font-medium text-[#1f2328] hover:shadow-sm sm:px-3 sm:text-[0.8rem]'
          >
            <span style={{ color: s.color }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
        <button
          type='button'
          className='hidden rounded-lg border border-dashed border-[#d5d8de] px-3 py-1.5 text-[0.8rem] text-[#9096a2] hover:bg-white sm:block'
        >
          + 添加快捷入口
        </button>
      </div>
    </section>
  )
}
