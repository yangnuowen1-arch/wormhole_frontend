import { useState, type DragEvent } from 'react'
import type { Resource } from '../data'

interface ToolsRowProps {
  tools: Resource[]
  onOpenResource: (resource: Resource) => void
  onReorderTools: (sourceId: string, targetId: string) => void
  isReordering?: boolean
}

export function ToolsRow({
  tools,
  onOpenResource,
  onReorderTools,
  isReordering = false
}: ToolsRowProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

  const resetDragState = () => {
    setDraggingId(null)
    setDropTargetId(null)
  }

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, id: string) => {
    if (isReordering) {
      event.preventDefault()
      return
    }

    setDraggingId(id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>, id: string) => {
    if (!draggingId || id === draggingId || isReordering) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTargetId(id)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault()

    const sourceId = event.dataTransfer.getData('text/plain') || draggingId
    if (sourceId && sourceId !== targetId && !isReordering) {
      onReorderTools(sourceId, targetId)
    }

    resetDragState()
  }

  return (
    <section className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between sm:mb-5'>
        <h3 className='flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base'>
          <span className='text-amber-400'>★</span>
          <span>常用工具</span>
        </h3>
        <div className='flex items-center gap-2 text-xs font-bold text-slate-400'>
          <span className='hidden sm:inline'>拖拽手柄调整顺序</span>
          <span>{tools.length} 个收藏</span>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {tools.map((tool) => (
          <div
            key={tool.id}
            data-tool-id={tool.id}
            onDragEnd={resetDragState}
            onDragOver={(event) => handleDragOver(event, tool.id)}
            onDrop={(event) => handleDrop(event, tool.id)}
            className={`group relative flex items-center gap-2.5 rounded-xl border bg-slate-50/50 p-3 pr-10 transition-all duration-200 hover:border-sky-100 hover:bg-white hover:shadow-md hover:shadow-sky-50 ${
              draggingId === tool.id
                ? 'scale-[0.98] border-sky-200 opacity-50'
                : dropTargetId === tool.id
                  ? 'border-sky-400 bg-sky-50 shadow-md shadow-sky-100'
                  : 'border-slate-100'
            }`}
          >
            <button
              type='button'
              onClick={() => onOpenResource(tool)}
              className='flex min-w-0 cursor-pointer flex-1 items-center gap-2.5 text-left'
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

            <button
              type='button'
              draggable={!isReordering}
              disabled={isReordering}
              onDragStart={(event) => handleDragStart(event, tool.id)}
              className='absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-sky-50 hover:text-sky-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40'
              aria-label={`拖拽调整 ${tool.name} 的顺序`}
              title='拖拽调整顺序'
            >
              <DragHandleIcon />
            </button>
          </div>
        ))}

        {tools.length === 0 && (
          <div className='rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500'>
            暂无常用工具。
          </div>
        )}
      </div>
    </section>
  )
}

function DragHandleIcon() {
  return (
    <svg
      aria-hidden='true'
      className='h-4 w-4'
      fill='currentColor'
      viewBox='0 0 16 16'
    >
      <circle cx='5' cy='3.5' r='1.25' />
      <circle cx='11' cy='3.5' r='1.25' />
      <circle cx='5' cy='8' r='1.25' />
      <circle cx='11' cy='8' r='1.25' />
      <circle cx='5' cy='12.5' r='1.25' />
      <circle cx='11' cy='12.5' r='1.25' />
    </svg>
  )
}
