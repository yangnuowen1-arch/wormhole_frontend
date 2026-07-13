import { useState, type DragEvent } from 'react'
import type { Resource } from '../data'

interface ToolsRowProps {
  tools: Resource[]
  onMoveTool: (id: string, direction: -1 | 1) => void
  onOpenResource: (resource: Resource) => void
  onReorderTools: (sourceId: string, targetId: string) => void
  onToggleFavorite: (resource: Resource) => void
}

export function ToolsRow({
  tools,
  onMoveTool,
  onOpenResource,
  onReorderTools,
  onToggleFavorite,
}: ToolsRowProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    setDraggingId(id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain') || draggingId

    if (sourceId && sourceId !== targetId) {
      onReorderTools(sourceId, targetId)
    }

    setDraggingId(null)
  }

  return (
    <section className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between sm:mb-5'>
        <h3 className='flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base'>
          <span className='text-amber-400'>★</span>
          <span>常用工具</span>
        </h3>
        <span className='text-xs font-bold text-slate-400'>
          {tools.length} 个收藏
        </span>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {tools.map((tool, index) => (
          <div
            key={tool.id}
            draggable
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDragStart={(event) => handleDragStart(event, tool.id)}
            onDrop={(event) => handleDrop(event, tool.id)}
            className={`group flex cursor-move items-center gap-2.5 rounded-xl border bg-slate-50/50 p-3 transition-all duration-300 hover:border-sky-100 hover:bg-white hover:shadow-md hover:shadow-sky-50 ${
              draggingId === tool.id ? 'border-sky-200 opacity-60' : 'border-slate-100'
            }`}
          >
            <button
              type='button'
              onClick={() => onOpenResource(tool)}
              className='flex min-w-0 flex-1 items-center gap-2.5 text-left'
            >
              <span
                className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold'
                style={{ backgroundColor: tool.bg, color: tool.color }}
              >
                {tool.short}
              </span>
              <span className='min-w-0'>
                <span className='block truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-sky-700'>
                  {tool.name}
                </span>
                <span className='block truncate text-[11px] font-semibold text-slate-400 sm:text-xs'>
                  {tool.orgType}
                </span>
              </span>
            </button>

            <div className='flex shrink-0 items-center gap-1'>
              <button
                type='button'
                disabled={index === 0}
                onClick={() => onMoveTool(tool.id, -1)}
                className='flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30'
                aria-label='上移常用工具'
              >
                ↑
              </button>
              <button
                type='button'
                disabled={index === tools.length - 1}
                onClick={() => onMoveTool(tool.id, 1)}
                className='flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30'
                aria-label='下移常用工具'
              >
                ↓
              </button>
              <button
                type='button'
                onClick={() => onToggleFavorite(tool)}
                className='flex h-7 w-7 items-center justify-center rounded-lg text-amber-400 transition-colors hover:bg-amber-50'
                aria-label='移除常用工具'
              >
                ★
              </button>
            </div>
          </div>
        ))}

        {tools.length === 0 && (
          <div className='rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500'>
            在资源中心点击星标后会出现在这里。
          </div>
        )}
      </div>
    </section>
  )
}
