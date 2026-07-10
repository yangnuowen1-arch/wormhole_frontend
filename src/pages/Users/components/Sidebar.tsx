import { NAV_ITEMS } from '../data'

export function Sidebar({
  active,
  onSelect,
}: {
  active: string
  onSelect: (id: string) => void
}) {
  return (
    <div className='flex h-full flex-col justify-between'>
      <div className='flex-1'>
        <div className='flex items-center gap-3 px-5 py-4'>
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-lg text-white'>
            ◈
          </span>
          <div className='leading-tight'>
            <div className='text-[0.95rem] font-bold text-[#1f2328]'>
              智能工作台
            </div>
            <div className='text-[0.72rem] text-[#9096a2]'>企业资源中心</div>
          </div>
        </div>

        <nav className='mt-3 px-3'>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type='button'
              onClick={() => onSelect(item.id)}
              aria-current={item.id === active ? 'page' : undefined}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[0.9rem] transition-colors ${
                item.id === active
                  ? 'bg-[#f0efff] font-semibold text-[#6366f1]'
                  : 'text-[#5b6170] hover:bg-[#f6f7f9]'
              }`}
            >
              <span className='w-4 text-center text-[0.95rem]'>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className='border-t border-[#ececf0] p-4'>
        <div className='flex items-center gap-3'>
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-[0.75rem] font-bold text-white'>
            张
          </span>
          <div className='min-w-0 leading-tight'>
            <div className='truncate text-[0.85rem] font-semibold text-[#1f2328]'>
              testUser
            </div>
            <div className='truncate text-[0.72rem] text-[#9096a2]'>
              zhang@company.io
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
