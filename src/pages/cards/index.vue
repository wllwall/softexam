<script setup lang="ts">
import type { Card } from '@/types'
import { cardsData } from '@/data/cards'
import { StorageKey } from '@/types'
import { getStorage, setStorage } from '@/utils/storage'

definePage({
  style: {
    navigationBarTitleText: '速记卡',
  },
})

interface LastIndexState {
  chapter: string
  index: number
}

const loading = ref(true)
const isFlipped = ref(false)
const slideDir = ref<'next' | 'prev' | null>(null)
const collectPulse = ref(false)

const cards = ref<Card[]>([])

const selectedChapterIndex = ref(0)
const chapterList = computed(() => {
  const set = new Set(cards.value.map(c => c.chapter))
  return ['全部章节', ...Array.from(set)]
})

const filteredCards = computed(() => {
  const chapter = chapterList.value[selectedChapterIndex.value]
  if (!chapter || chapter === '全部章节')
    return cards.value
  return cards.value.filter(c => c.chapter === chapter)
})

const currentIndex = ref(0)
const currentCard = computed(() => filteredCards.value[currentIndex.value])

function syncCollectedState() {
  const collectedIds = getStorage<number[]>(StorageKey.COLLECTED_CARDS, [])
  cards.value = cardsData.map((c) => {
    return {
      ...c,
      isCollected: collectedIds.includes(c.id),
    }
  })
}

function persistLastIndex() {
  const chapter = chapterList.value[selectedChapterIndex.value] || '全部章节'
  const state: LastIndexState = { chapter, index: currentIndex.value }
  setStorage(StorageKey.LAST_CARD_INDEX, state)
}

function restoreLastIndex() {
  const state = getStorage<LastIndexState | null>(
    StorageKey.LAST_CARD_INDEX,
    null,
  )
  if (!state)
    return
  const chapterIdx = chapterList.value.findIndex(ch => ch === state.chapter)
  if (chapterIdx >= 0) {
    selectedChapterIndex.value = chapterIdx
  }
  const max = filteredCards.value.length - 1
  if (max < 0) {
    currentIndex.value = 0
    return
  }
  currentIndex.value = Math.min(Math.max(state.index, 0), max)
}

function toggleFlip() {
  if (!currentCard.value)
    return
  isFlipped.value = !isFlipped.value
}

function goPrev() {
  if (currentIndex.value <= 0) {
    uni.showToast({ title: '已经是第一张', icon: 'none' })
    return
  }
  slideDir.value = 'prev'
  currentIndex.value -= 1
  isFlipped.value = false
  persistLastIndex()
  setTimeout(() => {
    if (slideDir.value === 'prev')
      slideDir.value = null
  }, 320)
}

function goNext() {
  if (currentIndex.value >= filteredCards.value.length - 1) {
    uni.showToast({ title: '已经是最后一张', icon: 'none' })
    return
  }
  slideDir.value = 'next'
  currentIndex.value += 1
  isFlipped.value = false
  persistLastIndex()
  setTimeout(() => {
    if (slideDir.value === 'next')
      slideDir.value = null
  }, 320)
}

function toggleCollect() {
  const card = currentCard.value
  if (!card)
    return

  const collectedIds = getStorage<number[]>(StorageKey.COLLECTED_CARDS, [])

  const next = !card.isCollected
  card.isCollected = next

  const newIds = next
    ? Array.from(new Set([...collectedIds, card.id]))
    : collectedIds.filter(id => id !== card.id)

  setStorage(StorageKey.COLLECTED_CARDS, newIds)
  uni.showToast({ title: next ? '已收藏' : '已取消', icon: 'none' })
  collectPulse.value = false
  void nextTick(() => {
    collectPulse.value = true
    setTimeout(() => {
      collectPulse.value = false
    }, 320)
  })
}

function onChapterChange(e: any) {
  const idx = Number(e.detail?.value ?? 0)
  selectedChapterIndex.value = Number.isNaN(idx) ? 0 : idx
  currentIndex.value = 0
  isFlipped.value = false
  persistLastIndex()
}

const touchStartX = ref<number | null>(null)
function onTouchStart(e: any) {
  touchStartX.value = e.changedTouches?.[0]?.clientX ?? null
}
function onTouchEnd(e: any) {
  const endX = e.changedTouches?.[0]?.clientX ?? null
  if (touchStartX.value === null || endX === null)
    return
  const dx = endX - touchStartX.value
  touchStartX.value = null
  if (Math.abs(dx) < 40)
    return
  if (dx < 0)
    goNext()
  else goPrev()
}

onShow(() => {
  syncCollectedState()
  if (!loading.value)
    restoreLastIndex()
})

onMounted(async () => {
  syncCollectedState()
  await nextTick()
  restoreLastIndex()
  loading.value = false
})
</script>

<template>
  <view class="min-h-screen bg-[var(--app-bg)] p-safe">
    <view class="px-[24rpx] pb-[32rpx] pt-[24rpx]">
      <view
        class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)]"
      >
        <view class="flex items-center justify-between gap-3">
          <view class="flex-1">
            <view class="text-[36rpx] text-[var(--app-text)] font-700 leading-[44rpx]">
              速记卡
            </view>
            <view class="mt-1 text-[24rpx] text-[var(--app-muted)] leading-[34rpx]">
              点击翻转 · 左右滑动切换
            </view>
          </view>
          <picker
            :range="chapterList"
            :value="selectedChapterIndex"
            @change="onChapterChange"
          >
            <view
              class="border-1 border-[var(--app-border)] rounded-[10rpx] bg-[#f7f8fa] px-[18rpx] py-[12rpx] text-[26rpx] text-[var(--app-text)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
            >
              {{ chapterList[selectedChapterIndex] }}
            </view>
          </picker>
        </view>
      </view>

      <view v-if="loading" class="mt-4 rounded-4 bg-white p-4">
        <view class="h-5 w-50 rounded-2 bg-[#eee]" />
        <view class="mt-3 h-30 rounded-2 bg-[#eee]" />
        <view class="mt-3 h-30 rounded-2 bg-[#eee]" />
      </view>

      <view
        v-else-if="filteredCards.length === 0"
        class="mt-10 text-center text-3.5 text-[var(--app-muted)]"
      >
        该章节暂无卡片
      </view>

      <view v-else class="mt-4">
        <view class="flex items-center justify-between">
          <view class="text-[24rpx] text-[var(--app-muted)] leading-[34rpx]">
            {{ currentIndex + 1 }} / {{ filteredCards.length }}
          </view>
          <view class="flex items-center gap-[12rpx]">
            <view class="rounded-full bg-[#fff7ee] px-[16rpx] py-[10rpx] text-[24rpx] text-[var(--app-accent)]">
              收藏
            </view>
            <view
              class="border-1 border-[var(--app-border)] rounded-[9999px] bg-white p-[10rpx] transition-all duration-300 active:scale-[0.98] active:brightness-95"
              @click="toggleCollect"
            >
              <view v-if="currentCard?.isCollected" class="i-carbon-favorite-filled h-[36rpx] w-[36rpx] text-[var(--app-accent)]" :class="collectPulse ? 'collect-pulse' : ''" />
              <view v-else class="i-carbon-favorite h-[36rpx] w-[36rpx] text-[#c0c4cc]" :class="collectPulse ? 'collect-pulse' : ''" />
            </view>
          </view>
        </view>

        <view
          class="card-scene mt-3"
          @click="toggleFlip"
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
        >
          <view class="card-motion" :class="slideDir ? `slide-${slideDir}` : ''">
            <view class="card" :class="{ flipped: isFlipped }">
              <view class="card-face card-front">
                <view class="flex items-start justify-between gap-3">
                  <view
                    class="text-[32rpx] text-[var(--app-text)] font-700 leading-[48rpx]"
                  >
                    {{ currentCard?.title }}
                  </view>
                  <view
                    class="rounded-full bg-[#eef6ff] px-[14rpx] py-[6rpx] text-[22rpx] text-primary"
                  >
                    题面
                  </view>
                </view>
                <view class="mt-2 text-[24rpx] text-[var(--app-muted)] leading-[36rpx]">
                  点击翻转查看解析
                </view>
              </view>
              <view class="card-face card-back">
                <view class="flex items-start justify-between gap-3">
                  <view
                    class="text-[32rpx] text-[var(--app-text)] font-700 leading-[48rpx]"
                  >
                    解析
                  </view>
                  <view
                    class="rounded-full bg-[#fff3e6] px-[14rpx] py-[6rpx] text-[22rpx] text-[var(--app-accent)]"
                  >
                    答案
                  </view>
                </view>
                <view
                  class="mt-2 whitespace-pre-wrap text-[26rpx] text-[var(--app-text)] leading-[42rpx]"
                >
                  {{ currentCard?.content }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="mt-4 flex gap-3">
          <view
            class="flex-1 border-1 border-[var(--app-border)] rounded-[10rpx] bg-white py-[22rpx] text-center text-[28rpx] text-[var(--app-text)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
            @click="goPrev"
          >
            上一张
          </view>
          <view
            class="flex-1 border-1 border-[var(--app-border)] rounded-[10rpx] bg-white py-[22rpx] text-center text-[28rpx] text-[var(--app-text)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
            @click="goNext"
          >
            下一张
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.card-motion.slide-next {
  animation: slide-next 320ms ease-out both;
}
.card-motion.slide-prev {
  animation: slide-prev 320ms ease-out both;
}
.card-scene {
  perspective: 900px;
}
.card {
  position: relative;
  width: 100%;
  height: 420rpx;
  transform-style: preserve-3d;
  transition: transform 0.5s;
}
.card.flipped {
  transform: rotateY(180deg);
}
.card-face {
  position: absolute;
  inset: 0;
  border-radius: 20rpx;
  background: var(--app-card-grad);
  padding: 28rpx;
  backface-visibility: hidden;
  border: 1px solid var(--app-border);
  box-shadow: var(--app-shadow-sm);
}
.card-back {
  transform: rotateY(180deg);
}
.collect-pulse {
  animation: collect-pulse 320ms ease-out both;
}
@keyframes collect-pulse {
  0% {
    transform: scale(1);
  }
  60% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes slide-next {
  0% {
    transform: translateX(24rpx);
    opacity: 0.88;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes slide-prev {
  0% {
    transform: translateX(-24rpx);
    opacity: 0.88;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
