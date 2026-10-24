<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap gap-3 items-center justify-between">
      <div class="flex gap-3 flex-wrap">
        <input v-model="search" class="input w-60" placeholder="Search videos…" />
        <select v-model="categoryFilter" class="input w-44">
          <option value="">All categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <button class="btn-primary" @click="openModal()">+ Add Video</button>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div v-for="i in 8" :key="i" class="card !p-0 overflow-hidden animate-pulse">
        <div class="bg-gray-200 aspect-video" />
        <div class="p-4 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4" />
          <div class="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>

    <div v-else-if="filtered.length === 0" class="text-center py-20 text-gray-400">No videos found.</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="video in filtered"
        :key="video.id"
        class="card !p-0 overflow-hidden flex flex-col group"
      >
        <div class="relative bg-gray-900 aspect-video flex items-center justify-center overflow-hidden">
          <img v-if="video.thumbnail_url" :src="video.thumbnail_url" :alt="video.title" class="w-full h-full object-cover" />
          <span v-else class="text-4xl">🎬</span>
          <span v-if="video.is_premium" class="absolute top-2 right-2 badge bg-yellow-400 text-yellow-900 text-xs font-bold">PRO</span>
          <!-- Hover actions -->
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button class="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-md" @click="openModal(video)">Edit</button>
            <button class="bg-nhs-red text-white text-xs font-semibold px-3 py-1.5 rounded-md" @click="confirmDelete(video)">Delete</button>
          </div>
        </div>
        <div class="p-4 flex-1 flex flex-col gap-2">
          <p class="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{{ video.title }}</p>
          <div class="flex items-center gap-2 flex-wrap mt-auto">
            <span v-if="video.category" class="badge-blue text-xs">{{ video.category.name }}</span>
            <button
              class="ml-auto text-xs font-medium px-2 py-1 rounded-md transition-colors"
              :class="video.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
              @click="togglePublish(video)"
            >{{ video.published ? '✓ Published' : 'Draft' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40" @click.self="showModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-6 space-y-4">
            <h3 class="text-lg font-semibold">{{ editTarget ? 'Edit Video' : 'Add Video' }}</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input v-model="form.title" class="input" required placeholder="e.g. How to Write an NHS Personal Statement" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
              <input v-model="form.url" type="url" class="input" placeholder="https://youtube.com/… or direct mp4 link" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (optional)</label>
              <input v-model="form.thumbnail_url" type="url" class="input" placeholder="https://…/thumbnail.jpg" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select v-model="form.category_id" class="input">
                  <option value="">No category</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                <input v-model.number="form.duration_seconds" type="number" class="input" placeholder="360" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea v-model="form.description" class="input h-24 resize-none" placeholder="Short description of the video…" />
            </div>

            <div class="flex gap-4">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input v-model="form.is_premium" type="checkbox" class="rounded" />
                <span>Pro / Premium only</span>
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input v-model="form.published" type="checkbox" class="rounded" />
                <span>Published</span>
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button class="btn-secondary" @click="showModal = false">Cancel</button>
              <button class="btn-primary !w-auto px-6" :disabled="saving || !form.title" @click="saveVideo">
                {{ saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Video' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <ConfirmModal
      v-if="deleteTarget"
      title="Delete Video"
      :message="`Delete &quot;${deleteTarget.title}&quot;? This cannot be undone.`"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast'
import ConfirmModal from '@/components/ConfirmModal.vue'
import api from '@/api/client'
import type { Video, VideoCategory } from '@/types'

const toast          = useToastStore()
const videos         = ref<Video[]>([])
const categories     = ref<VideoCategory[]>([])
const loading        = ref(true)
const saving         = ref(false)
const showModal      = ref(false)
const editTarget     = ref<Video | null>(null)
const deleteTarget   = ref<Video | null>(null)
const search         = ref('')
const categoryFilter = ref<number | ''>('')

const defaultForm = () => ({
  title:            '',
  url:              '',
  thumbnail_url:    '',
  description:      '',
  category_id:      '' as number | '',
  duration_seconds: undefined as number | undefined,
  is_premium:       false,
  published:        false,
})

const form = ref(defaultForm())

const filtered = computed(() =>
  videos.value.filter(v => {
    const matchSearch   = !search.value || v.title.toLowerCase().includes(search.value.toLowerCase())
    const matchCategory = !categoryFilter.value || v.category?.id === categoryFilter.value
    return matchSearch && matchCategory
  }),
)

function openModal(video?: Video) {
  editTarget.value = video ?? null
  form.value = video ? {
    title:            video.title,
    url:              video.url,
    thumbnail_url:    video.thumbnail_url ?? '',
    description:      video.description ?? '',
    category_id:      video.category?.id ?? '',
    duration_seconds: video.duration_seconds,
    is_premium:       video.is_premium,
    published:        video.published,
  } : defaultForm()
  showModal.value = true
}

async function saveVideo() {
  saving.value = true
  try {
    const payload = {
      title:            form.value.title,
      url:              form.value.url,
      thumbnail_url:    form.value.thumbnail_url || undefined,
      description:      form.value.description || undefined,
      category_id:      form.value.category_id || undefined,
      duration_seconds: form.value.duration_seconds || undefined,
      is_premium:       form.value.is_premium,
      published:        form.value.published,
    }
    if (editTarget.value) {
      await api.patch(`/videos/${editTarget.value.id}`, payload)
      toast.success('Video updated')
    } else {
      await api.post('/videos', payload)
      toast.success('Video added')
    }
    showModal.value = false
    await loadVideos()
  } catch { toast.error('Failed to save video') }
  finally { saving.value = false }
}

async function togglePublish(video: Video) {
  try {
    await api.patch(`/videos/${video.id}`, { published: !video.published })
    video.published = !video.published
    toast.success(video.published ? 'Video published' : 'Video set to draft')
  } catch { toast.error('Failed to update video') }
}

function confirmDelete(video: Video) { deleteTarget.value = video }

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await api.delete(`/videos/${deleteTarget.value.id}`)
    videos.value   = videos.value.filter(v => v.id !== deleteTarget.value!.id)
    toast.success('Video deleted')
  } catch { toast.error('Failed to delete video') }
  finally { deleteTarget.value = null }
}

async function loadVideos() {
  loading.value = true
  try {
    const [vRes, cRes] = await Promise.all([
      api.get('/videos'),
      api.get('/videos/categories'),
    ])
    videos.value     = vRes.data.data
    categories.value = cRes.data.data
  } finally { loading.value = false }
}

onMounted(() => loadVideos())
</script>
