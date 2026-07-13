import { useEffect, useMemo, useState } from 'react'
import type { Pick, Slide } from '../data'

type RecommendationSortKey = 'sortOrder' | 'publishedAt' | 'title'

interface AssistantAndPicksProps {
  editMode: boolean
  recommendations: Pick[]
  slides: Slide[]
  onMoveRecommendation: (id: string, direction: -1 | 1) => void
  onMoveSlide: (id: string, direction: -1 | 1) => void
  onOpenUrl: (url: string) => void
  onPersistRecommendationSort: () => void
  onPersistSlideSort: () => void
  onRecommendationChange: (id: string, patch: Partial<Pick>) => void
  onSlideChange: (id: string, patch: Partial<Slide>) => void
}

export function AssistantAndPicks({
  editMode,
  recommendations,
  slides,
  onMoveRecommendation,
  onMoveSlide,
  onOpenUrl,
  onPersistRecommendationSort,
  onPersistSlideSort,
  onRecommendationChange,
  onSlideChange,
}: AssistantAndPicksProps) {
  return (
    <div className='space-y-5 sm:space-y-6'>
      <SlidesPanel
        editMode={editMode}
        slides={slides}
        onMoveSlide={onMoveSlide}
        onOpenUrl={onOpenUrl}
        onPersistSlideSort={onPersistSlideSort}
        onSlideChange={onSlideChange}
      />
      <TodayRecommend
        editMode={editMode}
        recommendations={recommendations}
        onMoveRecommendation={onMoveRecommendation}
        onOpenUrl={onOpenUrl}
        onPersistRecommendationSort={onPersistRecommendationSort}
        onRecommendationChange={onRecommendationChange}
      />
    </div>
  )
}

function SlidesPanel({
  editMode,
  slides,
  onMoveSlide,
  onOpenUrl,
  onPersistSlideSort,
  onSlideChange,
}: {
  editMode: boolean
  slides: Slide[]
  onMoveSlide: (id: string, direction: -1 | 1) => void
  onOpenUrl: (url: string) => void
  onPersistSlideSort: () => void
  onSlideChange: (id: string, patch: Partial<Slide>) => void
}) {
  const orderedSlides = useMemo(
    () => [...slides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [slides],
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const safeActiveIndex = orderedSlides.length > 0
    ? Math.min(activeIndex, orderedSlides.length - 1)
    : 0
  const activeSlide = orderedSlides[safeActiveIndex] ?? orderedSlides[0]

  useEffect(() => {
    if (editMode || orderedSlides.length <= 1) {
      return undefined
    }

    const seconds = Math.max(activeSlide?.autoplaySeconds ?? 5, 2)
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % orderedSlides.length)
    }, seconds * 1000)

    return () => window.clearTimeout(timer)
  }, [activeSlide?.autoplaySeconds, activeSlide?.id, editMode, orderedSlides.length])

  if (!activeSlide) {
    return null
  }

  return (
    <section
      className='relative overflow-hidden rounded-2xl p-5 text-white shadow-xl shadow-slate-950/10 sm:p-6'
      style={{ background: activeSlide.background }}
    >
      <div
        className='absolute right-5 top-5 h-24 w-24 rounded-full opacity-20 blur-2xl'
        style={{ backgroundColor: activeSlide.accent }}
        aria-hidden='true'
      />

      <div className='relative z-10 flex min-h-[260px] flex-col justify-between gap-5'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex min-w-0 items-center gap-2.5'>
              <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md'>
                <SparklesIcon className='h-4 w-4' />
              </span>
              {editMode ? (
                <input
                  value={activeSlide.subtitle}
                  onChange={(event) => onSlideChange(activeSlide.id, { subtitle: event.target.value })}
                  className='min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm font-bold text-white outline-none placeholder:text-white/50 focus:border-white'
                  aria-label='幻灯片副标题'
                />
              ) : (
                <span className='truncate text-sm font-bold tracking-wide'>
                  {activeSlide.subtitle}
                </span>
              )}
            </div>

            {editMode && (
              <button
                type='button'
                onClick={onPersistSlideSort}
                className='rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-bold text-white transition-colors hover:bg-white/20'
              >
                保存排序
              </button>
            )}
          </div>

          <div className='space-y-2'>
            {editMode ? (
              <>
                <input
                  value={activeSlide.title}
                  onChange={(event) => onSlideChange(activeSlide.id, { title: event.target.value })}
                  className='w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xl font-extrabold text-white outline-none placeholder:text-white/50 focus:border-white'
                  aria-label='幻灯片标题'
                />
                <textarea
                  value={activeSlide.description}
                  onChange={(event) => onSlideChange(activeSlide.id, { description: event.target.value })}
                  className='min-h-20 w-full resize-none rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm font-semibold leading-relaxed text-white outline-none placeholder:text-white/50 focus:border-white'
                  aria-label='幻灯片描述'
                />
              </>
            ) : (
              <>
                <h3 className='text-xl font-extrabold leading-tight sm:text-2xl'>
                  {activeSlide.title}
                </h3>
                <p className='text-sm font-semibold leading-relaxed text-white/80'>
                  {activeSlide.description}
                </p>
              </>
            )}
          </div>
        </div>

        <div className='flex items-center justify-between gap-3'>
          <button
            type='button'
            onClick={() => onOpenUrl(activeSlide.targetUrl)}
            className='rounded-xl bg-white px-3.5 py-2 text-sm font-extrabold text-slate-900 shadow-md transition-colors hover:bg-slate-100'
          >
            {activeSlide.buttonText}
          </button>

          <div className='flex items-center gap-1.5'>
            {editMode && (
              <>
                <button
                  type='button'
                  disabled={safeActiveIndex === 0}
                  onClick={() => onMoveSlide(activeSlide.id, -1)}
                  className='rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-bold text-white hover:bg-white/20 disabled:opacity-30'
                >
                  上移
                </button>
                <button
                  type='button'
                  disabled={safeActiveIndex === orderedSlides.length - 1}
                  onClick={() => onMoveSlide(activeSlide.id, 1)}
                  className='rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-bold text-white hover:bg-white/20 disabled:opacity-30'
                >
                  下移
                </button>
              </>
            )}
            {orderedSlides.map((slide, index) => (
              <button
                key={slide.id}
                type='button'
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === safeActiveIndex ? 'w-6 bg-white' : 'w-2 bg-white/35 hover:bg-white/60'
                }`}
                aria-label={`切换到第 ${index + 1} 张幻灯片`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TodayRecommend({
  editMode,
  recommendations,
  onMoveRecommendation,
  onOpenUrl,
  onPersistRecommendationSort,
  onRecommendationChange,
}: {
  editMode: boolean
  recommendations: Pick[]
  onMoveRecommendation: (id: string, direction: -1 | 1) => void
  onOpenUrl: (url: string) => void
  onPersistRecommendationSort: () => void
  onRecommendationChange: (id: string, patch: Partial<Pick>) => void
}) {
  const [sortKey, setSortKey] = useState<RecommendationSortKey>('sortOrder')
  const orderedRecommendations = useMemo(
    () => [...recommendations].sort((a, b) => compareRecommendations(a, b, sortKey)),
    [recommendations, sortKey],
  )

  return (
    <section
      id='recommendations'
      className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6'
    >
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <h3 className='flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base'>
            <span className='text-emerald-600'>▧</span>
            今日推荐
          </h3>
          <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600'>
            {recommendations.length} 条
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as RecommendationSortKey)}
            className='rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-300'
          >
            <option value='sortOrder'>默认排序</option>
            <option value='publishedAt'>发布时间</option>
            <option value='title'>标题</option>
          </select>
          {editMode && (
            <button
              type='button'
              onClick={onPersistRecommendationSort}
              className='rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-500 hover:border-sky-200 hover:text-sky-700'
            >
              保存排序
            </button>
          )}
        </div>
      </div>

      <div className='space-y-3'>
        {orderedRecommendations.map((pick, index) => (
          <div
            key={pick.id}
            className='group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50'
          >
            <div className='flex min-w-0 flex-1 items-center gap-3'>
              <button
                type='button'
                onClick={() => onOpenUrl(pick.targetUrl ?? '#')}
                className='shrink-0 text-left'
                aria-label={`打开 ${pick.title}`}
              >
                <span
                  className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold'
                  style={{ backgroundColor: pick.iconBg, color: pick.iconColor }}
                >
                  {pick.icon}
                </span>
              </button>
              <div className='min-w-0 flex-1'>
                {editMode ? (
                  <input
                    value={pick.title}
                    onChange={(event) => onRecommendationChange(pick.id, { title: event.target.value })}
                    className='w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-bold text-slate-800 outline-none focus:border-sky-300'
                    aria-label={`${pick.title} 标题`}
                  />
                ) : (
                  <button
                    type='button'
                    onClick={() => onOpenUrl(pick.targetUrl ?? '#')}
                    className='block w-full truncate text-left text-sm font-bold text-slate-800 transition-colors group-hover:text-sky-700'
                  >
                    {pick.title}
                  </button>
                )}
                {editMode ? (
                  <input
                    value={pick.source}
                    onChange={(event) => onRecommendationChange(pick.id, { source: event.target.value })}
                    className='mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 outline-none focus:border-sky-300'
                    aria-label={`${pick.title} 来源`}
                  />
                ) : (
                  <span className='mt-0.5 block truncate text-[11px] font-semibold text-slate-400'>
                    {pick.source}
                  </span>
                )}
              </div>
            </div>

            {editMode ? (
              <div className='flex shrink-0 items-center gap-1'>
                <button
                  type='button'
                  disabled={index === 0}
                  onClick={() => onMoveRecommendation(pick.id, -1)}
                  className='rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 hover:border-sky-200 hover:text-sky-700 disabled:opacity-30'
                >
                  上移
                </button>
                <button
                  type='button'
                  disabled={index === orderedRecommendations.length - 1}
                  onClick={() => onMoveRecommendation(pick.id, 1)}
                  className='rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 hover:border-sky-200 hover:text-sky-700 disabled:opacity-30'
                >
                  下移
                </button>
              </div>
            ) : (
              <span className='shrink-0 text-[11px] font-semibold text-slate-400'>{pick.time}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function compareRecommendations(a: Pick, b: Pick, sortKey: RecommendationSortKey) {
  if (sortKey === 'title') {
    return a.title.localeCompare(b.title, 'zh-Hans-CN')
  }

  if (sortKey === 'publishedAt') {
    return Date.parse(b.publishedAt ?? '') - Date.parse(a.publishedAt ?? '')
  }

  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M12 3.5 13.7 8l4.8 1.7-4.8 1.8L12 16l-1.7-4.5-4.8-1.8L10.3 8 12 3.5Z' stroke='currentColor' strokeWidth='1.8' strokeLinejoin='round' />
    </svg>
  )
}
