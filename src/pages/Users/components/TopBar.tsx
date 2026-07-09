export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className='sticky top-0 z-20 flex items-center gap-3 border-b border-[#ececf0] bg-[#fbfbfd]/80 px-4 py-3 backdrop-blur sm:gap-4 sm:px-6'>
      {/* 移动端汉堡菜单，打开侧边抽屉 */}
      <button
        type='button'
        onClick={onMenuClick}
        aria-label='打开菜单'
        className='flex items-center justify-center text-[#5b6170] hover:text-[#1f2328] lg:hidden'
      >
        <svg
          className='h-6 w-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 6h16M4 12h16M4 18h16'
          />
        </svg>
      </button>

      {/* 移动端居中标题；PC 端品牌由侧边栏承载 */}
      <span className='absolute left-1/2 -translate-x-1/2 text-[0.95rem] font-bold text-[#1f2328] lg:hidden'>
        智能工作台
      </span>

      <div className='ml-auto flex items-center gap-2 sm:gap-3'>
        <button
          type='button'
          className='hidden items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] px-3 py-1.5 text-[0.8rem] font-medium text-white sm:flex'
        >
          ✦ 问 AI
        </button>
        <button
          type='button'
          aria-label='通知'
          className='relative text-[1.05rem] text-[#9096a2] hover:text-[#1f2328]'
        >
          ◔
          <span className='absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#ef4444]' />
        </button>
        <span className='hidden h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-[0.72rem] font-bold text-white lg:flex'>
          张
        </span>
      </div>
    </header>
  )
}
