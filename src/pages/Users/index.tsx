import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouteLoaderData } from 'react-router-dom'
import type { CurrentUser } from '../../api/types'
import {
  addCommonTool,
  getCarouselSlides,
  getCommonTools,
  getQuickEntries,
  getRecentSearchHistory,
  getRecommendations,
  getResourceCategories,
  getResources,
  recordSearchHistory,
  removeCommonTool,
  searchResources,
  sortAdminCarouselSlides,
  sortAdminQuickEntries,
  sortAdminRecommendations,
  sortCommonTools,
} from '../../api/workbench'
import { TopBar } from './components/TopBar'
import { Hero } from './components/Hero'
import { AssistantAndPicks } from './components/AssistantAndPicks'
import { ToolsRow } from './components/ToolsRow'
import { ResourceHub } from './components/ResourceHub'
import { BottomTabBar } from './components/BottomTabBar'
import {
  DEFAULT_COMMON_TOOL_IDS,
  PICKS,
  RESOURCE_CATEGORIES,
  RESOURCES,
  SHORTCUTS,
  SLIDES,
  type Pick,
  type Resource,
  type ResourceCategory,
  type Shortcut,
  type Slide,
} from './data'

const SEARCH_HISTORY_KEY = 'wormhole_recent_searches'
const COMMON_TOOLS_KEY = 'wormhole_common_tool_ids'

function Users() {
  const user = useRouteLoaderData('protected') as CurrentUser | undefined
  const [activeTab, setActiveTab] = useState('home')
  const [editMode, setEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    readStringList(SEARCH_HISTORY_KEY, []),
  )
  const [categories, setCategories] = useState<ResourceCategory[]>(createInitialCategories)
  const [resources, setResources] = useState<Resource[]>(createInitialResources)
  const [quickEntries, setQuickEntries] = useState<Shortcut[]>(createInitialQuickEntries)
  const [recommendations, setRecommendations] = useState<Pick[]>(createInitialRecommendations)
  const [slides, setSlides] = useState<Slide[]>(createInitialSlides)
  const [commonToolIds, setCommonToolIds] = useState<string[]>(() =>
    readStringList(COMMON_TOOLS_KEY, DEFAULT_COMMON_TOOL_IDS),
  )

  const roles = useMemo(() => getRoleCodes(user), [user])
  const isAdmin = roles.includes('admin')
  const userName = user?.nickname || user?.username || '用户'
  const roleEntryLabel = isAdmin ? '管理专栏' : '个人专栏'
  const roleEntryText = isAdmin ? '配置入口' : '精选入口'

  const commonTools = useMemo(
    () =>
      commonToolIds
        .map((id) => resources.find((resource) => resource.id === id))
        .filter((resource): resource is Resource => Boolean(resource)),
    [commonToolIds, resources],
  )

  useEffect(() => {
    let cancelled = false

    async function loadWorkbenchData() {
      const [
        categoryResult,
        resourceResult,
        quickEntryResult,
        recommendationResult,
        slideResult,
        commonToolResult,
        recentSearchResult,
      ] = await Promise.allSettled([
        getResourceCategories(),
        getResources(),
        getQuickEntries(),
        getRecommendations(),
        getCarouselSlides(),
        getCommonTools(),
        getRecentSearchHistory(4),
      ])

      if (cancelled) {
        return
      }

      let nextCategories: ResourceCategory[] = createInitialCategories()
      const remoteCategories = normalizeCategories(getFulfilled(categoryResult))
      if (remoteCategories.length > 0) {
        nextCategories = remoteCategories
        setCategories(remoteCategories)
      }

      let nextResources: Resource[] = createInitialResources()
      const remoteResources = normalizeResources(getFulfilled(resourceResult), nextCategories)
      if (remoteResources.length > 0) {
        nextResources = remoteResources
        setResources(remoteResources)
      }

      const remoteQuickEntries = normalizeQuickEntries(getFulfilled(quickEntryResult))
      if (remoteQuickEntries.length > 0) {
        setQuickEntries(remoteQuickEntries)
      }

      const remoteRecommendations = normalizeRecommendations(getFulfilled(recommendationResult))
      if (remoteRecommendations.length > 0) {
        setRecommendations(remoteRecommendations)
      }

      const remoteSlides = normalizeSlides(getFulfilled(slideResult))
      if (remoteSlides.length > 0) {
        setSlides(remoteSlides)
      }

      const remoteCommonToolIds = normalizeCommonToolIds(
        getFulfilled(commonToolResult),
        nextResources,
      )
      if (remoteCommonToolIds.length > 0) {
        setCommonToolIds(remoteCommonToolIds)
        writeStringList(COMMON_TOOLS_KEY, remoteCommonToolIds)
      }

      const remoteRecentSearches = normalizeSearchHistory(getFulfilled(recentSearchResult))
      if (remoteRecentSearches.length > 0) {
        setRecentSearches(remoteRecentSearches)
        writeStringList(SEARCH_HISTORY_KEY, remoteRecentSearches)
      }
    }

    void loadWorkbenchData()

    return () => {
      cancelled = true
    }
  }, [])

  const persistCommonToolSort = useCallback((ids: string[]) => {
    const items = ids
      .map((id, index) => {
        const resource = resources.find((item) => item.id === id)
        return resource?.numericId
          ? { resourceId: resource.numericId, sortOrder: (index + 1) * 10 }
          : undefined
      })
      .filter((item): item is { resourceId: number; sortOrder: number } => Boolean(item))

    if (items.length > 0) {
      void sortCommonTools(items).catch(() => undefined)
    }
  }, [resources])

  const handleSearchSubmit = useCallback((query: string) => {
    const trimmed = query.trim()

    if (!trimmed) {
      return
    }

    const resultCount = filterResourcesByQuery(resources, trimmed).length
    setRecentSearches((current) => {
      const next = [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 4)
      writeStringList(SEARCH_HISTORY_KEY, next)
      return next
    })

    void recordSearchHistory(trimmed, resultCount).catch(() => undefined)
    void searchResources(trimmed, 20)
      .then((payload) => {
        const next = normalizeResources(payload, categories)
        if (next.length > 0) {
          setResources((current) => mergeResources(current, next))
        }
      })
      .catch(() => undefined)
  }, [categories, resources])

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

  const handleOpenResource = useCallback((resource: Resource) => {
    handleOpenUrl(resource.targetUrl ?? defaultResourceUrl(resource))
  }, [handleOpenUrl])

  const handleSearchResourceSelect = useCallback((resource: Resource) => {
    setSearchQuery(resource.name)
    handleSearchSubmit(resource.name)
    handleOpenResource(resource)
  }, [handleOpenResource, handleSearchSubmit])

  const handleToggleFavorite = useCallback((resource: Resource) => {
    const isFavorite = commonToolIds.includes(resource.id)
    const next = isFavorite
      ? commonToolIds.filter((id) => id !== resource.id)
      : [...commonToolIds, resource.id]

    setCommonToolIds(next)
    writeStringList(COMMON_TOOLS_KEY, next)

    if (resource.numericId) {
      if (isFavorite) {
        void removeCommonTool(resource.numericId).catch(() => undefined)
      } else {
        void addCommonTool(resource.numericId, next.length * 10).catch(() => undefined)
      }
    }
  }, [commonToolIds])

  const handleMoveCommonTool = useCallback((id: string, direction: -1 | 1) => {
    const next = moveStringItem(commonToolIds, id, direction)
    setCommonToolIds(next)
    writeStringList(COMMON_TOOLS_KEY, next)
    persistCommonToolSort(next)
  }, [commonToolIds, persistCommonToolSort])

  const handleReorderCommonTools = useCallback((sourceId: string, targetId: string) => {
    const next = reorderStringItems(commonToolIds, sourceId, targetId)
    setCommonToolIds(next)
    writeStringList(COMMON_TOOLS_KEY, next)
    persistCommonToolSort(next)
  }, [commonToolIds, persistCommonToolSort])

  const handleQuickEntryChange = useCallback((id: string, patch: Partial<Shortcut>) => {
    setQuickEntries((current) =>
      current.map((entry) => (entry.key === id ? { ...entry, ...patch } : entry)),
    )
  }, [])

  const handleMoveQuickEntry = useCallback((id: string, direction: -1 | 1) => {
    setQuickEntries((current) => withSortOrder(moveItem(current, id, direction, (entry) => entry.key)))
  }, [])

  const handlePersistQuickEntrySort = useCallback(() => {
    const items = numericSortItems(quickEntries)
    if (items.length > 0) {
      void sortAdminQuickEntries(items).catch(() => undefined)
    }
  }, [quickEntries])

  const handleCategoryChange = useCallback((id: string, patch: Partial<ResourceCategory>) => {
    setCategories((current) =>
      current.map((category) => (category.id === id ? { ...category, ...patch } : category)),
    )
  }, [])

  const handleMoveCategory = useCallback((id: string, direction: -1 | 1) => {
    setCategories((current) => withSortOrder(moveItem(current, id, direction, (category) => category.id)))
  }, [])

  const handleResourceChange = useCallback((id: string, patch: Partial<Resource>) => {
    setResources((current) =>
      current.map((resource) => (resource.id === id ? { ...resource, ...patch } : resource)),
    )
  }, [])

  const handleMoveResource = useCallback((id: string, direction: -1 | 1) => {
    setResources((current) => withSortOrder(moveItem(current, id, direction, (resource) => resource.id)))
  }, [])

  const handleRecommendationChange = useCallback((id: string, patch: Partial<Pick>) => {
    setRecommendations((current) =>
      current.map((pick) => (pick.id === id ? { ...pick, ...patch } : pick)),
    )
  }, [])

  const handleMoveRecommendation = useCallback((id: string, direction: -1 | 1) => {
    setRecommendations((current) => withSortOrder(moveItem(current, id, direction, (pick) => pick.id)))
  }, [])

  const handlePersistRecommendationSort = useCallback(() => {
    const items = numericSortItems(recommendations)
    if (items.length > 0) {
      void sortAdminRecommendations(items).catch(() => undefined)
    }
  }, [recommendations])

  const handleSlideChange = useCallback((id: string, patch: Partial<Slide>) => {
    setSlides((current) =>
      current.map((slide) => (slide.id === id ? { ...slide, ...patch } : slide)),
    )
  }, [])

  const handleMoveSlide = useCallback((id: string, direction: -1 | 1) => {
    setSlides((current) => withSortOrder(moveItem(current, id, direction, (slide) => slide.id)))
  }, [])

  const handlePersistSlideSort = useCallback(() => {
    const items = numericSortItems(slides)
    if (items.length > 0) {
      void sortAdminCarouselSlides(items).catch(() => undefined)
    }
  }, [slides])

  return (
    <div className='flex h-screen overflow-hidden bg-slate-50/50 text-slate-800 font-semibold'>
      <div className='flex h-full min-w-0 flex-1 flex-col overflow-hidden'>
        <TopBar
          editMode={editMode}
          isAdmin={isAdmin}
          recentSearches={recentSearches}
          resources={resources}
          roleEntryLabel={roleEntryLabel}
          roleEntryText={roleEntryText}
          searchQuery={searchQuery}
          userName={userName}
          onResourceSelect={handleSearchResourceSelect}
          onSearchQueryChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onToggleEditMode={() => {
            if (isAdmin) {
              setEditMode((current) => !current)
            }
          }}
        />

        <main className='flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8'>
          <div
            id='admin-edit'
            className='mx-auto max-w-[1440px] space-y-5 sm:space-y-6'
          >
            <Hero
              editMode={editMode}
              quickEntries={quickEntries}
              recommendedCount={recommendations.length}
              userName={userName}
              onMoveQuickEntry={handleMoveQuickEntry}
              onPersistQuickEntrySort={handlePersistQuickEntrySort}
              onQuickEntryChange={handleQuickEntryChange}
            />

            <div className='grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3'>
              <div className='space-y-5 sm:space-y-6 lg:col-span-2'>
                <ToolsRow
                  tools={commonTools}
                  onMoveTool={handleMoveCommonTool}
                  onOpenResource={handleOpenResource}
                  onReorderTools={handleReorderCommonTools}
                  onToggleFavorite={handleToggleFavorite}
                />
                <ResourceHub
                  categories={categories}
                  editMode={editMode}
                  favoriteIds={commonToolIds}
                  resources={resources}
                  onCategoryChange={handleCategoryChange}
                  onMoveCategory={handleMoveCategory}
                  onMoveResource={handleMoveResource}
                  onOpenResource={handleOpenResource}
                  onResourceChange={handleResourceChange}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>

              <AssistantAndPicks
                editMode={editMode}
                recommendations={recommendations}
                slides={slides}
                onMoveRecommendation={handleMoveRecommendation}
                onMoveSlide={handleMoveSlide}
                onOpenUrl={handleOpenUrl}
                onPersistRecommendationSort={handlePersistRecommendationSort}
                onPersistSlideSort={handlePersistSlideSort}
                onRecommendationChange={handleRecommendationChange}
                onSlideChange={handleSlideChange}
              />
            </div>
          </div>
        </main>
      </div>

      <BottomTabBar
        active={activeTab}
        onSelect={setActiveTab}
      />
    </div>
  )
}

function createInitialCategories() {
  return RESOURCE_CATEGORIES.map((category, index) => ({
    ...category,
    numericId: category.numericId ?? index + 1,
    sortOrder: category.sortOrder ?? (index + 1) * 10,
  }))
}

function createInitialQuickEntries() {
  return SHORTCUTS.map((entry, index) => ({
    ...entry,
    numericId: entry.numericId ?? index + 1,
    sortOrder: entry.sortOrder ?? (index + 1) * 10,
  }))
}

function createInitialRecommendations() {
  return PICKS.map((pick, index) => ({
    ...pick,
    numericId: pick.numericId ?? index + 1,
    sortOrder: pick.sortOrder ?? (index + 1) * 10,
  }))
}

function createInitialSlides() {
  return SLIDES.map((slide, index) => ({
    ...slide,
    numericId: slide.numericId ?? index + 1,
    sortOrder: slide.sortOrder ?? (index + 1) * 10,
  }))
}

function createInitialResources() {
  return RESOURCES.map((resource, index) => enhanceResource(resource, index))
}

function enhanceResource(resource: Resource, index: number): Resource {
  return {
    ...resource,
    description: resource.description ?? '企业资源与模型生态入口。',
    followerCount: resource.followerCount ?? countFromText(resource.followers),
    modelCount: resource.modelCount ?? countFromText(resource.models),
    numericId: resource.numericId ?? index + 1,
    sortOrder: resource.sortOrder ?? (index + 1) * 10,
    targetUrl: resource.targetUrl ?? defaultResourceUrl(resource),
  }
}

function getRoleCodes(user: CurrentUser | undefined) {
  return (user?.roles ?? [])
    .map((role) => role.code)
    .filter(Boolean)
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
      resource.followers,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalized),
  )
}

function normalizeCategories(payload: unknown): ResourceCategory[] {
  const list = listFromUnknown(payload)

  return list.map((item, index) => {
    const record = asRecord(item)
    const id = readString(record, ['code', 'id', 'slug']) ?? `category-${index + 1}`
    const label = readString(record, ['label', 'name', 'title']) ?? id

    return {
      id,
      label,
      icon: readString(record, ['iconText', 'icon_text', 'icon']) ?? '❖',
      numericId: readNumber(record, ['id']),
      sortOrder: readNumber(record, ['sortOrder', 'sort_order']) ?? (index + 1) * 10,
    }
  })
}

function normalizeResources(payload: unknown, categories: ResourceCategory[]): Resource[] {
  const list = listFromUnknown(payload)

  return list.map((item, index) => {
    const record = asRecord(item)
    const numericId = readNumber(record, ['id', 'resourceId', 'resource_id']) ?? index + 1
    const id = readString(record, ['slug', 'code', 'id']) ?? `resource-${numericId}`
    const name = readString(record, ['name', 'title']) ?? id
    const modelCount = readNumber(record, ['modelCount', 'model_count', 'modelsCount'])
    const followerCount = readNumber(record, ['followerCount', 'follower_count', 'followersCount'])
    const category = readCategoryCode(record, categories)

    return enhanceResource({
      id,
      name,
      short: readString(record, ['short', 'iconText', 'icon_text']) ?? initials(name),
      orgType: readString(record, ['orgType', 'org_type', 'subtitle', 'description']) ?? '资源',
      models: readString(record, ['models', 'modelText']) ?? `${modelCount ?? 0} 个模型`,
      followers: readString(record, ['followers', 'followerText']) ?? `${followerCount ?? 0} 关注者`,
      tier: readTier(record),
      category,
      color: readString(record, ['color', 'iconColor', 'icon_color']) ?? '#0f172a',
      bg: readString(record, ['bg', 'background', 'iconBg', 'icon_bg']) ?? '#f1f5f9',
      description: readString(record, ['description', 'summary']),
      featured: readBoolean(record, ['featured', 'isFeatured', 'is_featured']),
      followerCount,
      modelCount,
      numericId,
      sortOrder: readNumber(record, ['sortOrder', 'sort_order']) ?? (index + 1) * 10,
      targetUrl: readString(record, ['targetUrl', 'target_url', 'url', 'website']),
    }, index)
  })
}

function normalizeQuickEntries(payload: unknown): Shortcut[] {
  return listFromUnknown(payload).map((item, index) => {
    const record = asRecord(item)
    const key = readString(record, ['code', 'key', 'id']) ?? `quick-${index + 1}`

    return {
      key,
      label: readString(record, ['title', 'label', 'name']) ?? key,
      icon: readString(record, ['iconText', 'icon_text', 'icon']) ?? '↗',
      color: readString(record, ['color', 'iconColor', 'icon_color']) ?? '#0f172a',
      description: readString(record, ['description', 'subtitle']),
      numericId: readNumber(record, ['id']),
      sortOrder: readNumber(record, ['sortOrder', 'sort_order']) ?? (index + 1) * 10,
      targetUrl: readString(record, ['targetUrl', 'target_url', 'url']) ?? '#',
    }
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
      source: readString(record, ['sourceName', 'source_name', 'source', 'subtitle']) ?? '资源中心',
      time: relativeTimeLabel(readString(record, ['publishedAt', 'published_at', 'updatedAt', 'updated_at'])),
      icon: readString(record, ['iconText', 'icon_text', 'icon']) ?? initials(title),
      iconBg: readString(record, ['iconBg', 'icon_bg', 'background']) ?? '#eef2ff',
      iconColor: readString(record, ['iconColor', 'icon_color', 'color']) ?? '#2563eb',
      publishedAt: readString(record, ['publishedAt', 'published_at', 'updatedAt', 'updated_at']),
      sortOrder: readNumber(record, ['sortOrder', 'sort_order']) ?? (index + 1) * 10,
      targetUrl: readString(record, ['targetUrl', 'target_url', 'sourceUrl', 'source_url', 'url']) ?? '#',
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
      buttonText: readString(record, ['buttonText', 'button_text']) ?? '查看详情',
      background: readString(record, ['background', 'bg']) ?? '#0f172a',
      accent: readString(record, ['accent', 'accentColor', 'accent_color']) ?? '#38bdf8',
      imageUrl: readString(record, ['imageUrl', 'image_url']),
      sortOrder: readNumber(record, ['sortOrder', 'sort_order']) ?? (index + 1) * 10,
      targetUrl: readString(record, ['targetUrl', 'target_url', 'url']) ?? '#',
      autoplaySeconds: readNumber(record, ['autoplaySeconds', 'autoplay_seconds']) ?? 5,
    }
  })
}

function normalizeCommonToolIds(payload: unknown, resources: Resource[]) {
  return listFromUnknown(payload)
    .map((item) => {
      const record = asRecord(item)
      const directId = readString(record, ['resourceCode', 'resource_code', 'slug', 'code'])
      if (directId && resources.some((resource) => resource.id === directId)) {
        return directId
      }

      const resourceId = readNumber(record, ['resourceId', 'resource_id', 'id'])
      const matchedResource = resources.find((resource) => resource.numericId === resourceId)
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

function mergeResources(current: Resource[], incoming: Resource[]) {
  const byId = new Map(current.map((resource) => [resource.id, resource]))

  incoming.forEach((resource) => {
    byId.set(resource.id, {
      ...byId.get(resource.id),
      ...resource,
    })
  })

  return [...byId.values()].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

function readStringList(key: string, fallback: string[]) {
  try {
    const raw = window.localStorage.getItem(key)
    const value = raw ? JSON.parse(raw) : fallback
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : fallback
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
  }

  return undefined
}

function readTier(record: Record<string, unknown>) {
  const tier = readString(record, ['tier', 'badge', 'plan'])
  return tier === 'Enterprise' || tier === 'Team' ? tier : undefined
}

function readCategoryCode(record: Record<string, unknown>, categories: ResourceCategory[]) {
  const direct = readString(record, ['categoryCode', 'category_code', 'category'])
  if (direct) {
    return direct
  }

  const categoryRecord = asRecord(record.category)
  const nested = readString(categoryRecord, ['code', 'id', 'name'])
  if (nested) {
    return nested
  }

  return categories.find((category) => category.id !== 'all')?.id ?? 'development'
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
    salesforce: 'https://www.salesforce.com',
  }

  return urls[resource.id] ?? `https://huggingface.co/${encodeURIComponent(resource.name)}`
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

function moveStringItem(items: string[], id: string, direction: -1 | 1) {
  const index = items.indexOf(id)
  const targetIndex = index + direction

  if (index < 0 || targetIndex < 0 || targetIndex >= items.length) {
    return items
  }

  const next = [...items]
  const [item] = next.splice(index, 1)
  next.splice(targetIndex, 0, item)
  return next
}

function reorderStringItems(items: string[], sourceId: string, targetId: string) {
  const sourceIndex = items.indexOf(sourceId)
  const targetIndex = items.indexOf(targetId)

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return items
  }

  const next = [...items]
  const [item] = next.splice(sourceIndex, 1)
  next.splice(targetIndex, 0, item)
  return next
}

function moveItem<T>(
  items: T[],
  id: string,
  direction: -1 | 1,
  getId: (item: T) => string,
) {
  const index = items.findIndex((item) => getId(item) === id)
  const targetIndex = index + direction

  if (index < 0 || targetIndex < 0 || targetIndex >= items.length) {
    return items
  }

  const next = [...items]
  const [item] = next.splice(index, 1)
  next.splice(targetIndex, 0, item)
  return next
}

function withSortOrder<T extends { sortOrder?: number }>(items: T[]) {
  return items.map((item, index) => ({
    ...item,
    sortOrder: (index + 1) * 10,
  }))
}

function numericSortItems(items: Array<{ numericId?: number; sortOrder?: number }>) {
  return items
    .map((item, index) =>
      item.numericId
        ? { id: item.numericId, sortOrder: item.sortOrder ?? (index + 1) * 10 }
        : undefined,
    )
    .filter((item): item is { id: number; sortOrder: number } => Boolean(item))
}

function isExternalUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://')
}

export default Users
