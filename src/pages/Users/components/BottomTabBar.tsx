export interface TabItem {
  id: string
  label: string
  icon: string
}

export const TAB_ITEMS: TabItem[] = [
  { id: 'home', label: '首页', icon: '⌂' },
  { id: 'picks', label: '推荐', icon: '✦' },
  { id: 'library', label: '工具库', icon: '❖' },
  { id: 'me', label: '我的', icon: '◍' }
]

export function BottomTabBar({
  active,
  onSelect
}: {
  active: string
  onSelect: (id: string) => void
}) {
  return (
    <nav className='fixed inset-x-0 bottom-0 z-30 flex border-t border-[#ececf0] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden'>
      {TAB_ITEMS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type='button'
            onClick={() => onSelect(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.62rem] font-medium transition-colors ${
              isActive ? 'text-[#6366f1]' : 'text-[#9096a2]'
            }`}
          >
            <span className='text-[1.15rem] leading-none'>{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
