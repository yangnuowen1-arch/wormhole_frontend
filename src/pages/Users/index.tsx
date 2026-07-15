import { useCallback, useEffect, useMemo, useState } from 'react'
import { message } from 'antd'
import { useRouteLoaderData } from 'react-router-dom'
import type { CurrentUser } from '../../api/types'
import {
  addCommonTool,
  createAdminCarouselSlide,
  createAdminResource,
  createAdminResourceCategory,
  createAdminRecommendation,
  createAdminAnnouncement,
  deleteAdminResource,
  deleteAdminResourceCategory,
  getAdminAnnouncements,
  getAdminCarouselSlides,
  getAnnouncements,
  getCarouselSlides,
  getCommonTools,
  getAdminRecommendations,
  getRecentSearchHistory,
  getRecommendations,
  getResourceCategories,
  getResources,
  recordSearchHistory,
  removeCommonTool,
  searchResources,
  sortAdminCarouselSlides,
  sortAdminRecommendations,
  sortCommonTools,
  updateAdminAnnouncement,
  updateAdminAnnouncementStatus,
  updateAdminCarouselSlide,
  updateAdminResource,
  updateAdminResourceCategory,
  updateAdminRecommendation,
  updateAdminRecommendationStatus,
  type AdminAnnouncementPayload
} from '../../api/workbench'
import { TopBar } from './components/TopBar'
import { Hero } from './components/Hero'
import { AssistantAndPicks } from './components/AssistantAndPicks'
import { ToolsRow } from './components/ToolsRow'
import { ResourceHub } from './components/ResourceHub'
import {
  PICKS,
  RESOURCE_CATEGORIES,
  RESOURCES,
  SLIDES,
  type Announcement,
  type Pick,
  type Resource,
  type ResourceCategory,
  type Shortcut,
  type Slide
} from './data'

const SEARCH_HISTORY_KEY = 'wormhole_recent_searches'
const QUICK_ENTRY_IDS_KEY = 'wormhole_quick_entry_resource_ids'

function Users() {
  const user = useRouteLoaderData('protected') as CurrentUser | undefined
  const [editMode, setEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isWorkbenchLoading, setIsWorkbenchLoading] = useState(true)
  const [activeResourceSearchQuery, setActiveResourceSearchQuery] = useState('')
  const [isResourceSearchLoading, setIsResourceSearchLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [resourceSearchResults, setResourceSearchResults] = useState<
    Resource[]
  >([])
  const [quickEntryIds, setQuickEntryIds] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Pick[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [commonToolIds, setCommonToolIds] = useState<string[]>([])
  const [isCommonToolSortSaving, setIsCommonToolSortSaving] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [adminAnnouncements, setAdminAnnouncements] = useState<Announcement[]>(
    []
  )
  const [isAdminAnnouncementsLoading, setIsAdminAnnouncementsLoading] =
    useState(false)

  const roles = useMemo(() => getRoleCodes(user), [user])
  const isAdmin = roles.includes('admin')
  const userName = user?.nickname || user?.username || '用户'

  const commonTools = useMemo(
    () =>
      commonToolIds
        .map((id) => resources.find((resource) => resource.id === id))
        .filter((resource): resource is Resource => Boolean(resource)),
    [commonToolIds, resources]
  )

  const quickEntries = useMemo(
    () =>
      quickEntryIds
        .map((id, index) => {
          const resource = resources.find((item) => item.id === id)
          return resource ? shortcutFromResource(resource, index) : undefined
        })
        .filter((entry): entry is Shortcut => Boolean(entry)),
    [quickEntryIds, resources]
  )

  const hubResources = useMemo(
    () =>
      activeResourceSearchQuery.trim() ? resourceSearchResults : resources,
    [activeResourceSearchQuery, resourceSearchResults, resources]
  )

  useEffect(() => {
    let cancelled = false

    async function loadWorkbenchData() {
      const [
        categoryResult,
        resourceResult,
        recommendationResult,
        slideResult,
        commonToolResult,
        recentSearchResult,
        announcementResult
      ] = await Promise.allSettled([
        getResourceCategories(),
        getResources(),
        isAdmin ? getAdminRecommendations() : getRecommendations(),
        isAdmin ? getAdminCarouselSlides() : getCarouselSlides(),
        getCommonTools(),
        getRecentSearchHistory(4),
        getAnnouncements()
      ])

      if (cancelled) {
        return
      }

      const remoteCategories = normalizeCategories(getFulfilled(categoryResult))
      const nextCategories =
        categoryResult.status === 'fulfilled'
          ? remoteCategories
          : createInitialCategories()

      const remoteResources = normalizeResources(
        getFulfilled(resourceResult),
        nextCategories
      )
      const nextResources =
        resourceResult.status === 'fulfilled'
          ? remoteResources
          : createInitialResources()

      const nextQuickEntryIds = readStringList(QUICK_ENTRY_IDS_KEY, []).filter(
        (id) => nextResources.some((resource) => resource.id === id)
      )

      const remoteRecommendations = normalizeRecommendations(
        getFulfilled(recommendationResult)
      )
      const nextRecommendations =
        recommendationResult.status === 'fulfilled'
          ? remoteRecommendations
          : createInitialRecommendations()

      const remoteSlides = normalizeSlides(getFulfilled(slideResult))
      const nextSlides =
        remoteSlides.length > 0 ? remoteSlides : createInitialSlides()

      const remoteCommonToolIds = normalizeCommonToolIds(
        getFulfilled(commonToolResult),
        nextResources
      )
      const nextCommonToolIds =
        remoteCommonToolIds.length > 0 ? remoteCommonToolIds : []

      const remoteRecentSearches = normalizeSearchHistory(
        getFulfilled(recentSearchResult)
      )
      const nextRecentSearches =
        remoteRecentSearches.length > 0
          ? remoteRecentSearches
          : readStringList(SEARCH_HISTORY_KEY, [])
      if (remoteRecentSearches.length > 0) {
        writeStringList(SEARCH_HISTORY_KEY, remoteRecentSearches)
      }

      const nextAnnouncements = normalizeAnnouncements(
        getFulfilled(announcementResult)
      )

      setCategories(nextCategories)
      setResources(nextResources)
      setQuickEntryIds(nextQuickEntryIds)
      setRecommendations(nextRecommendations)
      setSlides(nextSlides)
      setCommonToolIds(nextCommonToolIds)
      setRecentSearches(nextRecentSearches)
      setAnnouncements(nextAnnouncements)
      setIsWorkbenchLoading(false)
    }

    void loadWorkbenchData()

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const loadPublishedAnnouncements = useCallback(async () => {
    const payload = await getAnnouncements()
    setAnnouncements(normalizeAnnouncements(payload))
  }, [])

  const loadAdminAnnouncements = useCallback(async () => {
    if (!isAdmin) {
      return
    }

    setIsAdminAnnouncementsLoading(true)
    try {
      const payload = await getAdminAnnouncements()
      setAdminAnnouncements(normalizeAnnouncements(payload))
    } catch (error) {
      message.error(error instanceof Error ? error.message : '公告列表加载失败')
      throw error
    } finally {
      setIsAdminAnnouncementsLoading(false)
    }
  }, [isAdmin])

  const refreshAnnouncements = useCallback(async () => {
    await Promise.allSettled([
      loadPublishedAnnouncements(),
      isAdmin ? loadAdminAnnouncements() : Promise.resolve()
    ])
  }, [isAdmin, loadAdminAnnouncements, loadPublishedAnnouncements])

  const persistCommonToolSort = useCallback(
    async (ids: string[]) => {
      const items = commonToolSortItems(ids, resources)

      if (items.length > 0) {
        await sortCommonTools(items)
      }
    },
    [resources]
  )

  const clearResourceSearch = useCallback(() => {
    setActiveResourceSearchQuery('')
    setResourceSearchResults([])
  }, [])

  const handleSearchQueryChange = useCallback(
    (value: string) => {
      setSearchQuery(value)

      if (!value.trim() || value.trim() !== activeResourceSearchQuery.trim()) {
        clearResourceSearch()
      }
    },
    [activeResourceSearchQuery, clearResourceSearch]
  )

  const handleSearchSubmit = useCallback(
    async (query: string) => {
      const trimmed = query.trim()

      if (!trimmed) {
        clearResourceSearch()
        return
      }

      setIsResourceSearchLoading(true)
      try {
        const payload = await searchResources(trimmed, {
          page: 1,
          pageSize: 100
        })
        const next = normalizeResources(payload, categories)

        setActiveResourceSearchQuery(trimmed)
        setResourceSearchResults(next)
        if (next.length > 0) {
          setResources((current) => mergeResources(current, next))
        }

        setRecentSearches((current) => {
          const recent = [
            trimmed,
            ...current.filter((item) => item !== trimmed)
          ].slice(0, 4)
          writeStringList(SEARCH_HISTORY_KEY, recent)
          return recent
        })
        void recordSearchHistory(trimmed, next.length).catch(() => undefined)
      } catch (error) {
        const fallback = filterResourcesByQuery(resources, trimmed)
        setActiveResourceSearchQuery(trimmed)
        setResourceSearchResults(fallback)
        message.error(error instanceof Error ? error.message : '搜索资源失败')
      } finally {
        setIsResourceSearchLoading(false)
      }
    },
    [categories, clearResourceSearch, resources]
  )

  const handleOpenUrl = useCallback((url: string) => {
    if (!url || url === '#') {
      return
    }

    if (isExternalUrl(url)) {
      window.open(url, '_blank', 'noreferrer')
      return
    }

    window.location.href = url
  }, [])

  const rememberQuickEntry = useCallback((resource: Resource) => {
    setQuickEntryIds((current) => {
      const next = [
        resource.id,
        ...current.filter((id) => id !== resource.id)
      ].slice(0, 5)
      writeStringList(QUICK_ENTRY_IDS_KEY, next)
      return next
    })
  }, [])

  const handleOpenResource = useCallback(
    (resource: Resource) => {
      rememberQuickEntry(resource)
      handleOpenUrl(resource.targetUrl ?? defaultResourceUrl(resource))
    },
    [handleOpenUrl, rememberQuickEntry]
  )

  const handleOpenQuickEntry = useCallback(
    (entry: Shortcut) => {
      const resource = resources.find((item) => item.id === entry.key)
      if (resource) {
        rememberQuickEntry(resource)
      }
      handleOpenUrl(entry.targetUrl ?? '#')
    },
    [handleOpenUrl, rememberQuickEntry, resources]
  )

  const handleSearchResourceSelect = useCallback(
    (resource: Resource) => {
      setSearchQuery(resource.name)
      handleSearchSubmit(resource.name)
      handleOpenResource(resource)
    },
    [handleOpenResource, handleSearchSubmit]
  )

  const handleToggleFavorite = useCallback(
    async (resource: Resource) => {
      const isFavorite = commonToolIds.includes(resource.id)
      const next = isFavorite
        ? commonToolIds.filter((id) => id !== resource.id)
        : [...commonToolIds, resource.id]

      try {
        const resourceId = requireNumericId(
          resource.numericId,
          `${resource.name} 缺少后端资源 ID，无法保存常用工具`
        )
        if (isFavorite) {
          await removeCommonTool(resourceId)
        } else {
          await addCommonTool(resourceId, next.length * 10)
        }
        await persistCommonToolSort(next)
        setCommonToolIds(next)
      } catch (error) {
        message.error(
          error instanceof Error ? error.message : '常用工具保存失败'
        )
      }
    },
    [commonToolIds, persistCommonToolSort]
  )

  const handleReorderCommonTools = useCallback(
    async (sourceId: string, targetId: string) => {
      const sourceIndex = commonToolIds.indexOf(sourceId)
      const targetIndex = commonToolIds.indexOf(targetId)

      if (
        sourceIndex < 0 ||
        targetIndex < 0 ||
        sourceIndex === targetIndex ||
        isCommonToolSortSaving
      ) {
        return
      }

      const previous = commonToolIds
      const next = reorderStringItems(previous, sourceId, targetId)

      setCommonToolIds(next)
      setIsCommonToolSortSaving(true)

      try {
        await persistCommonToolSort(next)
        message.success('常用工具排序已保存')
      } catch (error) {
        setCommonToolIds((current) =>
          sameStringList(current, next) ? previous : current
        )
        message.error(
          error instanceof Error ? error.message : '常用工具排序保存失败'
        )
      } finally {
        setIsCommonToolSortSaving(false)
      }
    },
    [commonToolIds, isCommonToolSortSaving, persistCommonToolSort]
  )

  const handleSaveAnnouncement = useCallback(
    async (
      announcement: Announcement | undefined,
      payload: AdminAnnouncementPayload
    ) => {
      if (announcement) {
        await updateAdminAnnouncement(
          requireNumericId(
            announcement.numericId,
            `${announcement.title} 缺少后端公告 ID，无法保存`
          ),
          payload
        )
      } else {
        await createAdminAnnouncement(payload)
      }

      await refreshAnnouncements()
    },
    [refreshAnnouncements]
  )

  const handleUpdateAnnouncementStatus = useCallback(
    async (announcement: Announcement, status: number) => {
      await updateAdminAnnouncementStatus(
        requireNumericId(
          announcement.numericId,
          `${announcement.title} 缺少后端公告 ID，无法更新状态`
        ),
        status
      )
      await refreshAnnouncements()
    },
    [refreshAnnouncements]
  )

  const handleSaveResourceHub = useCallback(
    async ({
      categories: nextCategories,
      removedCategories,
      resources: nextResources,
      removedResources
    }: {
      categories: ResourceCategory[]
      removedCategories: ResourceCategory[]
      resources: Resource[]
      removedResources: Resource[]
    }) => {
      if (!isAdmin) {
        throw new Error('仅管理员可以保存资源中心内容')
      }

      await Promise.all(
        removedResources.map((resource) =>
          deleteAdminResource(
            requireNumericId(
              resource.numericId,
              `${resource.name} 缺少后端资源 ID，无法删除`
            )
          )
        )
      )
      await Promise.all(
        removedCategories.map((category) =>
          deleteAdminResourceCategory(
            requireNumericId(
              category.numericId,
              `${category.label} 缺少后端分类 ID，无法删除`
            )
          )
        )
      )

      const categoryChanges = nextCategories.filter((category) => {
        const previous = categories.find((item) => item.id === category.id)

        return !previous || hasPersistedCategoryChange(previous, category)
      })
      const savedCategoryChanges = await Promise.all(
        categoryChanges.map(async (category) => {
          const payload = resourceCategoryPayload(category)
          const response =
            typeof category.numericId === 'number'
              ? await updateAdminResourceCategory(category.numericId, payload)
              : await createAdminResourceCategory(payload)

          return [category.id, mergeSavedCategory(category, response)] as const
        })
      )
      const savedCategoryById = new Map(
        categories.map((category) => [category.id, category])
      )
      savedCategoryChanges.forEach(([previousId, category]) => {
        savedCategoryById.set(previousId, category)
      })
      const savedCategories = nextCategories.map(
        (category) => savedCategoryById.get(category.id) ?? category
      )
      const categoryIds = new Map(
        savedCategories.map((category) => [category.id, category.numericId])
      )
      const resourceChanges = nextResources.filter((resource) => {
        const previous = resources.find((item) => item.id === resource.id)

        return !previous || hasPersistedResourceChange(previous, resource)
      })
      const savedResourceChanges = await Promise.all(
        resourceChanges.map(async (resource) => {
          const categoryId = requireNumericId(
            categoryIds.get(resource.category),
            `${resource.category} 分类缺少后端 ID，无法保存资源`
          )
          const payload = resourcePayload(resource, categoryId)
          const response =
            typeof resource.numericId === 'number'
              ? await updateAdminResource(resource.numericId, payload)
              : await createAdminResource(payload)

          return [resource.id, mergeSavedResource(resource, response)] as const
        })
      )
      const savedResourceById = new Map(
        resources.map((resource) => [resource.id, resource])
      )
      savedResourceChanges.forEach(([previousId, resource]) => {
        savedResourceById.set(previousId, resource)
      })
      const savedResources = nextResources.map(
        (resource) => savedResourceById.get(resource.id) ?? resource
      )

      const resourceIds = new Set(savedResources.map((resource) => resource.id))

      setCategories(savedCategories)
      setResources(savedResources)
      setQuickEntryIds((current) =>
        current.filter((id) => resourceIds.has(id))
      )
      setCommonToolIds((current) =>
        current.filter((id) => resourceIds.has(id))
      )
      setResourceSearchResults(
        activeResourceSearchQuery.trim()
          ? filterResourcesByQuery(savedResources, activeResourceSearchQuery)
          : []
      )
      return { categories: savedCategories, resources: savedResources }
    },
    [activeResourceSearchQuery, categories, isAdmin, resources]
  )

  const handleSaveRecommendations = useCallback(
    async (next: Pick[]) => {
      const currentById = new Map(
        recommendations.map((recommendation) => [recommendation.id, recommendation])
      )
      const submittedIds = new Set(
        next.map((recommendation) => recommendation.id)
      )
      const removed = recommendations.filter(
        (recommendation) => !submittedIds.has(recommendation.id)
      )
      const existing = next.filter(
        (recommendation): recommendation is Pick & { numericId: number } =>
          typeof recommendation.numericId === 'number'
      )
      const created = next.filter(
        (recommendation) => typeof recommendation.numericId !== 'number'
      )

      await Promise.all(
        existing.map((recommendation) =>
          updateAdminRecommendation(recommendation.numericId, {
            iconText: recommendation.icon,
            iconUrl: recommendation.iconUrl,
            publishedAt: recommendation.publishedAt,
            resourceId: recommendation.resourceId,
            sortOrder: recommendation.sortOrder,
            sourceName: recommendation.source,
            sourceUrl: recommendation.sourceUrl,
            subtitle: recommendation.subtitle,
            targetUrl: recommendation.targetUrl,
            title: recommendation.title,
            visibleRoleCodes: recommendation.visibleRoleCodes
          })
        )
      )
      const createdResults = await Promise.all(
        created.map((recommendation) =>
          createAdminRecommendation({
            iconText: recommendation.icon,
            iconUrl: recommendation.iconUrl,
            publishedAt: recommendation.publishedAt,
            resourceId: recommendation.resourceId,
            sortOrder: recommendation.sortOrder,
            sourceName: recommendation.source,
            sourceUrl: recommendation.sourceUrl,
            status: recommendation.status ?? 1,
            subtitle: recommendation.subtitle,
            targetUrl: recommendation.targetUrl,
            title: recommendation.title,
            visibleRoleCodes: recommendation.visibleRoleCodes
          })
        )
      )
      const savedCreated = created.map((recommendation, index) => {
        const saved = normalizeRecommendations([createdResults[index]])[0]

        return saved
          ? {
              ...recommendation,
              ...saved,
              status: saved.status ?? recommendation.status ?? 1
            }
          : recommendation
      })
      await Promise.all(
        removed
          .filter(
            (recommendation): recommendation is Pick & { numericId: number } =>
              typeof recommendation.numericId === 'number'
          )
          .map((recommendation) =>
            updateAdminRecommendationStatus(recommendation.numericId, 0)
          )
      )

      await Promise.all(
        existing
          .filter(
            (recommendation) =>
              (currentById.get(recommendation.id)?.status ?? 1) !==
              (recommendation.status ?? 1)
          )
          .map((recommendation) =>
            updateAdminRecommendationStatus(
              recommendation.numericId,
              recommendation.status ?? 1
            )
          )
      )

      const savedCreatedById = new Map(
        savedCreated.map((recommendation) => [recommendation.id, recommendation])
      )
      const savedNext = next.map(
        (recommendation) =>
          savedCreatedById.get(recommendation.id) ?? recommendation
      )
      const items = numericSortItems(savedNext)
      if (items.length > 0) {
        await sortAdminRecommendations(items)
      }

      try {
        const payload = await getAdminRecommendations()
        setRecommendations(normalizeRecommendations(payload))
      } catch {
        setRecommendations(savedNext)
        message.warning('今日推荐已保存，但列表刷新失败；请刷新页面确认最新内容')
      }
    },
    [recommendations]
  )

  const handleSaveSlides = useCallback(
    async (next: Slide[]) => {
      const submittedIds = new Set(next.map((slide) => slide.id))
      const removed = slides.filter(
        (slide) =>
          (slide.status ?? 1) !== 0 && !submittedIds.has(slide.id)
      )
      const hiddenSlides = slides.filter((slide) => (slide.status ?? 1) === 0)
      const existing = next.filter(
        (slide): slide is Slide & { numericId: number } =>
          typeof slide.numericId === 'number'
      )
      const created = next.filter(
        (slide) => typeof slide.numericId !== 'number'
      )

      await Promise.all(
        existing.map((slide) =>
          updateAdminCarouselSlide(slide.numericId, carouselSlidePayload(slide))
        )
      )
      const createdResults = await Promise.all(
        created.map((slide) =>
          createAdminCarouselSlide({
            ...carouselSlidePayload(slide),
            code: slide.code?.trim() || slide.id,
            title: slide.title.trim()
          })
        )
      )
      await Promise.all(
        removed
          .filter(
            (slide): slide is Slide & { numericId: number } =>
              typeof slide.numericId === 'number'
          )
          .map((slide) =>
            updateAdminCarouselSlide(slide.numericId, { status: 0 })
          )
      )

      const savedCreated = created.map((slide, index) => {
        const saved = normalizeSlides([createdResults[index]])[0]

        return saved ? { ...slide, ...saved } : slide
      })
      const savedCreatedById = new Map(
        created.map((slide, index) => [slide.id, savedCreated[index]])
      )
      const savedNext = [
        ...next.map((slide) => savedCreatedById.get(slide.id) ?? slide),
        ...hiddenSlides
      ]
      const items = numericSortItems(savedNext)
      if (items.length > 0) {
        await sortAdminCarouselSlides(items)
      }

      try {
        const payload = await getAdminCarouselSlides()
        setSlides(normalizeSlides(payload))
      } catch {
        setSlides(savedNext)
        message.warning('轮播内容已保存，但列表刷新失败；请刷新页面确认最新内容')
      }
    },
    [slides]
  )

  if (isWorkbenchLoading) {
    return <WorkbenchLoading />
  }

  return (
    <div className='flex h-screen overflow-hidden bg-slate-50/50 text-slate-800 font-semibold'>
      <div className='flex h-full min-w-0 flex-1 flex-col overflow-hidden'>
        <TopBar
          adminAnnouncements={adminAnnouncements}
          announcements={announcements}
          editMode={editMode}
          isAdmin={isAdmin}
          isAdminAnnouncementsLoading={isAdminAnnouncementsLoading}
          userName={userName}
          onLoadAdminAnnouncements={loadAdminAnnouncements}
          onSaveAnnouncement={handleSaveAnnouncement}
          onToggleEditMode={() => {
            if (isAdmin) {
              setEditMode((current) => !current)
            }
          }}
          onUpdateAnnouncementStatus={handleUpdateAnnouncementStatus}
        />

        <main className='flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8'>
          <div
            id='admin-edit'
            className='mx-auto max-w-[1440px] space-y-5 sm:space-y-6'
          >
            <Hero
              quickEntries={quickEntries}
              recommendedCount={
                recommendations.filter((recommendation) => recommendation.status !== 0)
                  .length
              }
              userName={userName}
              onOpenQuickEntry={handleOpenQuickEntry}
            />

            <div className='grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3'>
              <div className='space-y-5 sm:space-y-6 lg:col-span-2'>
                <ToolsRow
                  tools={commonTools}
                  onOpenResource={handleOpenResource}
                  onReorderTools={handleReorderCommonTools}
                  isReordering={isCommonToolSortSaving}
                />
                <ResourceHub
                  activeSearchQuery={activeResourceSearchQuery}
                  allResources={resources}
                  categories={categories}
                  editMode={editMode}
                  favoriteIds={commonToolIds}
                  isSearchLoading={isResourceSearchLoading}
                  recentSearches={recentSearches}
                  resources={hubResources}
                  searchQuery={searchQuery}
                  onOpenResource={handleOpenResource}
                  onSaveResourceHub={handleSaveResourceHub}
                  onSearchQueryChange={handleSearchQueryChange}
                  onSearchResourceSelect={handleSearchResourceSelect}
                  onSearchSubmit={handleSearchSubmit}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>

              <AssistantAndPicks
                editMode={editMode}
                recommendations={recommendations}
                slides={slides}
                onOpenUrl={handleOpenUrl}
                onSaveRecommendations={handleSaveRecommendations}
                onSaveSlides={handleSaveSlides}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function WorkbenchLoading() {
  return (
    <div
      className='flex h-screen items-center justify-center bg-slate-50 text-slate-600'
      role='status'
      aria-live='polite'
    >
      <div className='flex flex-col items-center gap-3'>
        <span
          className='h-8 w-8 animate-spin rounded-full border-[3px] border-sky-100 border-t-sky-600'
          aria-hidden='true'
        />
        <span className='text-sm font-semibold'>正在加载工作台…</span>
      </div>
    </div>
  )
}

function createInitialCategories() {
  return RESOURCE_CATEGORIES.map((category, index) => ({
    ...category,
    numericId: undefined,
    sortOrder: category.sortOrder ?? (index + 1) * 10
  }))
}

function createInitialRecommendations() {
  return PICKS.map((pick, index) => ({
    ...pick,
    numericId: undefined,
    sortOrder: pick.sortOrder ?? (index + 1) * 10
  }))
}

function createInitialSlides() {
  return SLIDES.map((slide, index) => ({
    ...slide,
    numericId: undefined,
    sortOrder: slide.sortOrder ?? (index + 1) * 10
  }))
}

function createInitialResources() {
  return RESOURCES.map((resource, index) =>
    enhanceResource(resource, index, false)
  )
}

function enhanceResource(
  resource: Resource,
  index: number,
  withFallbackNumericId = true
): Resource {
  return {
    ...resource,
    description: resource.description ?? '企业资源与模型生态入口。',
    followerCount: resource.followerCount ?? countFromText(resource.followers),
    modelCount: resource.modelCount ?? countFromText(resource.models),
    numericId:
      resource.numericId ?? (withFallbackNumericId ? index + 1 : undefined),
    sortOrder: resource.sortOrder ?? (index + 1) * 10,
    targetUrl: resource.targetUrl ?? defaultResourceUrl(resource)
  }
}

function shortcutFromResource(resource: Resource, index: number): Shortcut {
  return {
    key: resource.id,
    label: resource.name,
    icon: resource.short,
    color: resource.color,
    description: resource.orgType,
    sortOrder: (index + 1) * 10,
    targetUrl: resource.targetUrl ?? defaultResourceUrl(resource)
  }
}

function getRoleCodes(user: CurrentUser | undefined) {
  return (user?.roles ?? []).map((role) => role.code).filter(Boolean)
}

function filterResourcesByQuery(resources: Resource[], query: string) {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return []
  }

  return resources.filter((resource) =>
    [
      resource.name,
      resource.orgType,
      resource.category,
      resource.description,
      resource.models,
      resource.followers
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalized)
  )
}

function normalizeCategories(payload: unknown): ResourceCategory[] {
  const list = listFromUnknown(payload)

  return list.map((item, index) => {
    const record = asRecord(item)
    const id =
      readString(record, ['code', 'id', 'slug']) ?? `category-${index + 1}`
    const label = readString(record, ['label', 'name', 'title']) ?? id

    return {
      id,
      label,
      numericId: readNumber(record, ['id']),
      sortOrder:
        readNumber(record, ['sortOrder', 'sort_order']) ?? (index + 1) * 10
    }
  })
}

function normalizeResources(
  payload: unknown,
  categories: ResourceCategory[]
): Resource[] {
  const list = listFromUnknown(payload)

  return list.map((item, index) => {
    const record = asRecord(item)
    const numericId = readNumber(record, ['id', 'resourceId', 'resource_id'])
    const id =
      readString(record, ['slug', 'code', 'id']) ?? `resource-${index + 1}`
    const name = readString(record, ['name', 'title']) ?? id
    const modelCount = readNumber(record, [
      'modelCount',
      'model_count',
      'modelsCount'
    ])
    const followerCount = readNumber(record, [
      'followerCount',
      'follower_count',
      'followersCount'
    ])
    const category = readCategoryCode(record, categories)

    return enhanceResource(
      {
        id,
        name,
        short:
          readString(record, ['short', 'iconText', 'icon_text']) ??
          initials(name),
        orgType:
          readString(record, [
            'summary',
            'provider',
            'resourceType',
            'orgType',
            'org_type',
            'subtitle',
            'description'
          ]) ?? '资源',
        models:
          readString(record, ['models', 'modelText']) ??
          `${modelCount ?? 0} 个模型`,
        followers:
          readString(record, ['followers', 'followerText']) ??
          `${followerCount ?? 0} 关注者`,
        tier: readTier(record),
        category,
        color:
          readString(record, ['color', 'iconColor', 'icon_color']) ?? '#0f172a',
        bg:
          readString(record, ['bg', 'background', 'iconBg', 'icon_bg']) ??
          '#f1f5f9',
        description: readString(record, ['description', 'summary']),
        featured: readBoolean(record, [
          'featured',
          'isFeatured',
          'is_featured'
        ]),
        followerCount,
        modelCount,
        numericId,
        sortOrder:
          readNumber(record, ['sortOrder', 'sort_order']) ?? (index + 1) * 10,
        targetUrl: readString(record, [
          'websiteUrl',
          'website_url',
          'targetUrl',
          'target_url',
          'url',
          'website'
        ])
      },
      index
    )
  })
}

function normalizeRecommendations(payload: unknown): Pick[] {
  return listFromUnknown(payload).map((item, index) => {
    const record = asRecord(item)
    const title = readString(record, ['title', 'name']) ?? `推荐 ${index + 1}`

    return {
      id: readString(record, ['code', 'id']) ?? `recommendation-${index + 1}`,
      numericId: readNumber(record, ['id']),
      title,
      source:
        readString(record, [
          'sourceName',
          'source_name',
          'source',
          'subtitle'
        ]) ?? '资源中心',
      time: relativeTimeLabel(
        readString(record, [
          'publishedAt',
          'published_at',
          'updatedAt',
          'updated_at'
        ])
      ),
      icon:
        readString(record, ['iconText', 'icon_text', 'icon']) ??
        initials(title),
      iconBg:
        readString(record, ['iconBg', 'icon_bg', 'background']) ?? '#eef2ff',
      iconColor:
        readString(record, ['iconColor', 'icon_color', 'color']) ?? '#2563eb',
      publishedAt: readString(record, [
        'publishedAt',
        'published_at',
        'updatedAt',
        'updated_at'
      ]),
      resourceId: readNumber(record, ['resourceId', 'resource_id']),
      sortOrder:
        readNumber(record, ['sortOrder', 'sort_order']) ?? (index + 1) * 10,
      sourceUrl: readString(record, ['sourceUrl', 'source_url']),
      status: readNumber(record, ['status']) ?? 1,
      subtitle: readString(record, ['subtitle']),
      targetUrl:
        readString(record, [
          'targetUrl',
          'target_url',
          'sourceUrl',
          'source_url',
          'url'
        ]) ?? '#',
      iconUrl: readString(record, ['iconUrl', 'icon_url']),
      visibleRoleCodes: readStringArray(record, [
        'visibleRoleCodes',
        'visible_role_codes'
      ])
    }
  })
}

function normalizeSlides(payload: unknown): Slide[] {
  return listFromUnknown(payload).map((item, index) => {
    const record = asRecord(item)
    const title = readString(record, ['title', 'name']) ?? `幻灯片 ${index + 1}`

    return {
      id: readString(record, ['code', 'id']) ?? `slide-${index + 1}`,
      numericId: readNumber(record, ['id']),
      code: readString(record, ['code']),
      title,
      subtitle: readString(record, ['subtitle', 'label']) ?? '资源专栏',
      description: readString(record, ['description', 'summary']) ?? '',
      buttonText:
        readString(record, ['buttonText', 'button_text']) ?? '查看详情',
      sortOrder:
        readNumber(record, ['sortOrder', 'sort_order']) ?? (index + 1) * 10,
      status: readNumber(record, ['status']) ?? 1,
      targetUrl: readString(record, ['targetUrl', 'target_url', 'url']) ?? '#'
    }
  })
}

function carouselSlidePayload(slide: Slide) {
  return {
    buttonText: slide.buttonText,
    code: slide.code?.trim() || slide.id,
    description: slide.description,
    sortOrder: slide.sortOrder,
    status: slide.status ?? 1,
    subtitle: slide.subtitle,
    targetUrl: slide.targetUrl.trim(),
    title: slide.title.trim()
  }
}

function normalizeCommonToolIds(payload: unknown, resources: Resource[]) {
  return listFromUnknown(payload)
    .map((item) => {
      const record = asRecord(item)
      const directId = readString(record, [
        'resourceCode',
        'resource_code',
        'slug',
        'code'
      ])
      if (directId && resources.some((resource) => resource.id === directId)) {
        return directId
      }

      const resourceId = readNumber(record, ['resourceId', 'resource_id', 'id'])
      const matchedResource = resources.find(
        (resource) => resource.numericId === resourceId
      )
      if (matchedResource) {
        return matchedResource.id
      }

      const nestedResource = asRecord(record.resource)
      const nestedId = readString(nestedResource, ['slug', 'code', 'id'])
      if (nestedId && resources.some((resource) => resource.id === nestedId)) {
        return nestedId
      }

      return undefined
    })
    .filter((id): id is string => Boolean(id))
}

function normalizeSearchHistory(payload: unknown) {
  return listFromUnknown(payload)
    .map((item) => {
      if (typeof item === 'string') {
        return item
      }

      return readString(asRecord(item), ['query', 'keyword', 'term'])
    })
    .filter((item): item is string => Boolean(item))
    .slice(0, 4)
}

function normalizeAnnouncements(payload: unknown): Announcement[] {
  return listFromUnknown(payload)
    .map((item, index) => {
      const record = asRecord(item)
      const numericId = readNumber(record, [
        'id',
        'announcementId',
        'announcement_id'
      ])
      const title =
        readString(record, ['title', 'name', 'subject']) ?? `公告 ${index + 1}`

      return {
        id:
          readString(record, ['code', 'id', 'announcementId']) ??
          `announcement-${index + 1}`,
        numericId,
        title,
        content:
          readString(record, ['content', 'body', 'description', 'summary']) ??
          '',
        createdAt: readString(record, ['createdAt', 'created_at']),
        expiresAt: readString(record, ['expiresAt', 'expires_at']),
        isPinned:
          readBoolean(record, ['isPinned', 'is_pinned', 'pinned']) ?? false,
        publishedAt: readString(record, [
          'publishedAt',
          'published_at',
          'publishTime',
          'publish_time'
        ]),
        status: readNumber(record, ['status']) ?? 1,
        updatedAt: readString(record, ['updatedAt', 'updated_at'])
      }
    })
    .sort(compareAnnouncementOrder)
}

function compareAnnouncementOrder(a: Announcement, b: Announcement) {
  if (a.isPinned !== b.isPinned) {
    return a.isPinned ? -1 : 1
  }

  return announcementTime(b) - announcementTime(a)
}

function announcementTime(announcement: Announcement) {
  const timestamp = Date.parse(
    announcement.publishedAt ??
      announcement.updatedAt ??
      announcement.createdAt ??
      ''
  )

  return Number.isNaN(timestamp) ? 0 : timestamp
}

function mergeResources(current: Resource[], incoming: Resource[]) {
  const byId = new Map(current.map((resource) => [resource.id, resource]))

  incoming.forEach((resource) => {
    byId.set(resource.id, {
      ...byId.get(resource.id),
      ...resource
    })
  })

  return [...byId.values()].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  )
}

function readStringList(key: string, fallback: string[]) {
  try {
    const raw = window.localStorage.getItem(key)
    const value = raw ? JSON.parse(raw) : fallback
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : fallback
  } catch {
    return fallback
  }
}

function writeStringList(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

function getFulfilled<T>(result: PromiseSettledResult<T>) {
  return result.status === 'fulfilled' ? result.value : undefined
}

function listFromUnknown(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }

  const record = asRecord(payload)
  const keys = ['items', 'list', 'records', 'rows', 'data']

  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) {
      return value
    }

    if (isRecord(value)) {
      const nested = listFromUnknown(value)
      if (nested.length > 0) {
        return nested
      }
    }
  }

  return []
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {}
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'string' && value.trim()) {
      return value
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
  }

  return undefined
}

function readStringArray(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]

    if (Array.isArray(value)) {
      const items = value.filter(
        (item): item is string =>
          typeof item === 'string' && Boolean(item.trim())
      )
      return items.length > 0 ? items : undefined
    }
  }

  return undefined
}

function readNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }

  return undefined
}

function readBoolean(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'boolean') {
      return value
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value === 1
    }

    if (typeof value === 'string' && value.trim()) {
      const normalized = value.trim().toLowerCase()
      if (['true', '1', 'yes'].includes(normalized)) {
        return true
      }
      if (['false', '0', 'no'].includes(normalized)) {
        return false
      }
    }
  }

  return undefined
}

function readTier(record: Record<string, unknown>) {
  const tier = readString(record, ['tier', 'badge', 'plan'])
  return tier === '技术' || tier === '公共' ? tier : undefined
}

function readCategoryCode(
  record: Record<string, unknown>,
  categories: ResourceCategory[]
) {
  const direct = readString(record, [
    'categoryCode',
    'category_code',
    'category'
  ])
  if (direct) {
    return direct
  }

  const categoryRecord = asRecord(record.category)
  const nested = readString(categoryRecord, ['code', 'id', 'name'])
  if (nested) {
    return nested
  }

  return (
    categories.find((category) => category.id !== 'all')?.id ?? 'development'
  )
}

function defaultResourceUrl(resource: Resource) {
  const urls: Record<string, string> = {
    adobe: 'https://www.adobe.com',
    anthropic: 'https://www.anthropic.com',
    aws: 'https://aws.amazon.com',
    amazon: 'https://aws.amazon.com',
    canva: 'https://www.canva.com',
    cloudflare: 'https://www.cloudflare.com',
    cohere: 'https://cohere.com',
    databricks: 'https://www.databricks.com',
    github: 'https://github.com',
    google: 'https://ai.google',
    huggingface: 'https://huggingface.co',
    ibm: 'https://www.ibm.com',
    intel: 'https://www.intel.com',
    meta: 'https://ai.meta.com',
    microsoft: 'https://www.microsoft.com/ai',
    mistral: 'https://mistral.ai',
    notion: 'https://www.notion.so',
    nvidia: 'https://www.nvidia.com',
    openai: 'https://openai.com',
    salesforce: 'https://www.salesforce.com'
  }

  return (
    urls[resource.id] ??
    `https://huggingface.co/${encodeURIComponent(resource.name)}`
  )
}

function countFromText(value: string) {
  const normalized = value.replace(/,/g, '').toLowerCase()
  const match = normalized.match(/([\d.]+)/)

  if (!match) {
    return 0
  }

  const base = Number(match[1])
  if (Number.isNaN(base)) {
    return 0
  }

  if (normalized.includes('k')) {
    return Math.round(base * 1000)
  }

  return Math.round(base)
}

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? 'R'
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? ''
  return `${first}${second}`.toUpperCase()
}

function relativeTimeLabel(value?: string) {
  if (!value) {
    return '刚刚'
  }

  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) {
    return '刚刚'
  }

  const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000))
  if (minutes < 60) {
    return `${minutes} 分钟前`
  }

  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return `${hours} 小时前`
  }

  return `${Math.round(hours / 24)} 天前`
}

function requireNumericId(value: number | undefined, message: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(message)
  }

  return value
}

function resourceCategoryPayload(category: ResourceCategory) {
  return {
    code: category.id,
    name: category.label,
    sortOrder: category.sortOrder
  }
}

function hasPersistedCategoryChange(
  previous: ResourceCategory,
  next: ResourceCategory
) {
  return (
    previous.id !== next.id ||
    previous.label !== next.label ||
    previous.sortOrder !== next.sortOrder
  )
}

function hasPersistedResourceChange(previous: Resource, next: Resource) {
  return (
    previous.category !== next.category ||
    previous.description !== next.description ||
    previous.followers !== next.followers ||
    previous.id !== next.id ||
    previous.models !== next.models ||
    previous.name !== next.name ||
    previous.orgType !== next.orgType ||
    previous.sortOrder !== next.sortOrder ||
    previous.targetUrl !== next.targetUrl ||
    previous.tier !== next.tier
  )
}

function resourcePayload(resource: Resource, categoryId: number) {
  return {
    badge: resource.tier,
    categoryId,
    description: resource.description ?? '',
    followerCount: countFromText(resource.followers),
    modelCount: countFromText(resource.models),
    name: resource.name,
    sortOrder: resource.sortOrder,
    slug: resource.id,
    summary: resource.orgType,
    websiteUrl: resource.targetUrl ?? ''
  }
}

function mergeSavedCategory(
  category: ResourceCategory,
  response: unknown
): ResourceCategory {
  const record = adminResponseRecord(response, ['resourceCategory', 'category'])

  return {
    ...category,
    id: readString(record, ['code', 'slug']) ?? category.id,
    label: readString(record, ['name', 'label', 'title']) ?? category.label,
    numericId:
      readNumber(record, ['id', 'categoryId', 'category_id']) ??
      category.numericId,
    sortOrder:
      readNumber(record, ['sortOrder', 'sort_order']) ?? category.sortOrder
  }
}

function mergeSavedResource(resource: Resource, response: unknown): Resource {
  const record = adminResponseRecord(response, ['resource'])
  const category = asRecord(record.category)
  const name = readString(record, ['name', 'title']) ?? resource.name
  const modelCount = readNumber(record, [
    'modelCount',
    'model_count',
    'modelsCount'
  ])
  const followerCount = readNumber(record, [
    'followerCount',
    'follower_count',
    'followersCount'
  ])

  return {
    ...resource,
    category:
      readString(category, ['code']) ??
      readString(record, ['categoryCode', 'category_code']) ??
      resource.category,
    description:
      readString(record, ['description', 'summary']) ?? resource.description,
    followerCount: followerCount ?? resource.followerCount,
    followers:
      readString(record, ['followers', 'followerText']) ??
      (followerCount === undefined ? resource.followers : `${followerCount} 关注者`),
    id: readString(record, ['code', 'slug']) ?? resource.id,
    modelCount: modelCount ?? resource.modelCount,
    models:
      readString(record, ['models', 'modelText']) ??
      (modelCount === undefined ? resource.models : `${modelCount} 个模型`),
    name,
    numericId:
      readNumber(record, ['id', 'resourceId', 'resource_id']) ??
      resource.numericId,
    orgType:
      readString(record, [
        'summary',
        'provider',
        'resourceType',
        'orgType',
        'org_type',
        'subtitle'
      ]) ?? resource.orgType,
    short:
      readString(record, ['short', 'iconText', 'icon_text']) ??
      resource.short ??
      initials(name),
    sortOrder:
      readNumber(record, ['sortOrder', 'sort_order']) ?? resource.sortOrder,
    targetUrl:
      readString(record, [
        'websiteUrl',
        'website_url',
        'targetUrl',
        'target_url',
        'url',
        'website'
      ]) ??
      resource.targetUrl,
    tier: readTier(record) ?? resource.tier
  }
}

function adminResponseRecord(value: unknown, nestedKeys: string[]) {
  const record = asRecord(value)

  for (const key of nestedKeys) {
    const nested = record[key]
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return asRecord(nested)
    }
  }

  return record
}

function commonToolSortItems(ids: string[], resources: Resource[]) {
  return ids
    .map((id, index) => {
      const resource = resources.find((item) => item.id === id)
      if (!resource) {
        return undefined
      }

      return {
        resourceId: requireNumericId(
          resource.numericId,
          `${resource.name} 缺少后端资源 ID，无法保存常用工具`
        ),
        sortOrder: (index + 1) * 10
      }
    })
    .filter((item): item is { resourceId: number; sortOrder: number } =>
      Boolean(item)
    )
}

function reorderStringItems(
  items: string[],
  sourceId: string,
  targetId: string
) {
  const sourceIndex = items.indexOf(sourceId)
  const targetIndex = items.indexOf(targetId)

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return items
  }

  const next = [...items]
  const [source] = next.splice(sourceIndex, 1)
  next.splice(targetIndex, 0, source)
  return next
}

function sameStringList(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

function numericSortItems(
  items: Array<{ numericId?: number; sortOrder?: number }>
) {
  return items
    .map((item, index) =>
      item.numericId
        ? { id: item.numericId, sortOrder: item.sortOrder ?? (index + 1) * 10 }
        : undefined
    )
    .filter((item): item is { id: number; sortOrder: number } => Boolean(item))
}

function isExternalUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://')
}

export default Users
