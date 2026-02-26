<script lang="ts" setup>
import type { Card, ExamQuestion } from '@/types'
import { cardsData } from '@/data/cards'
import { questionsData } from '@/data/questions'
import { StorageKey } from '@/types'
import { getStorage, removeStorage, setStorage } from '@/utils/storage'

definePage({
  style: {
    navigationBarTitleText: '我的',
  },
})

type MeTab = 'collect' | 'wrong' | 'manage'
const activeTab = ref<MeTab>(
  getStorage(StorageKey.ME_ACTIVE_TAB, 'collect' as MeTab),
)

const collectedCards = ref<Card[]>([])
const wrongQuestions = ref<ExamQuestion[]>([])

const selectedCollectedIndex = ref<number | null>(null)
const collectedIsFlipped = ref(false)

const selectedWrongId = ref<number | null>(null)
const wrongSelectedAnswer = ref<string>('')
const wrongSubmitted = ref(false)

const selectedCollectedCard = computed(() => {
  if (selectedCollectedIndex.value === null)
    return null
  return collectedCards.value[selectedCollectedIndex.value] || null
})

const selectedWrongQuestion = computed(() => {
  if (selectedWrongId.value === null)
    return null
  return (
    wrongQuestions.value.find(q => q.id === selectedWrongId.value) || null
  )
})

function setTab(tab: MeTab) {
  activeTab.value = tab
  setStorage(StorageKey.ME_ACTIVE_TAB, tab)
  selectedCollectedIndex.value = null
  selectedWrongId.value = null
  wrongSelectedAnswer.value = ''
  wrongSubmitted.value = false
}

function refreshCollected() {
  const ids = getStorage<number[]>(StorageKey.COLLECTED_CARDS, [])
  collectedCards.value = cardsData
    .filter(c => ids.includes(c.id))
    .map(c => ({ ...c, isCollected: true }))
}

function refreshWrong() {
  const ids = getStorage<number[]>(StorageKey.WRONG_QUESTIONS, [])
  wrongQuestions.value = questionsData
    .filter(q => ids.includes(q.id))
    .map(q => ({ ...q, isWrong: true }))
}

function uncollectCard(id: number) {
  const ids = getStorage<number[]>(StorageKey.COLLECTED_CARDS, [])
  setStorage(
    StorageKey.COLLECTED_CARDS,
    ids.filter(x => x !== id),
  )
  if (selectedCollectedCard.value?.id === id) {
    selectedCollectedIndex.value = null
  }
  refreshCollected()
  uni.showToast({ title: '已取消', icon: 'none' })
}

function openCollectedDetail(index: number) {
  selectedCollectedIndex.value = index
  collectedIsFlipped.value = false
}

function toggleCollectedFlip() {
  if (!selectedCollectedCard.value)
    return
  collectedIsFlipped.value = !collectedIsFlipped.value
}

function collectedPrev() {
  if (selectedCollectedIndex.value === null)
    return
  if (selectedCollectedIndex.value <= 0) {
    uni.showToast({ title: '已经是第一张', icon: 'none' })
    return
  }
  selectedCollectedIndex.value -= 1
  collectedIsFlipped.value = false
}

function collectedNext() {
  if (selectedCollectedIndex.value === null)
    return
  if (selectedCollectedIndex.value >= collectedCards.value.length - 1) {
    uni.showToast({ title: '已经是最后一张', icon: 'none' })
    return
  }
  selectedCollectedIndex.value += 1
  collectedIsFlipped.value = false
}

function openWrongDetail(id: number) {
  selectedWrongId.value = id
  wrongSelectedAnswer.value = ''
  wrongSubmitted.value = false
}

function wrongOptionChange(e: any) {
  if (wrongSubmitted.value)
    return
  wrongSelectedAnswer.value = e.detail?.value ?? ''
}

function submitWrong() {
  if (wrongSubmitted.value)
    return
  if (!wrongSelectedAnswer.value) {
    uni.showToast({ title: '请选择答案', icon: 'none' })
    return
  }
  wrongSubmitted.value = true
  const q = selectedWrongQuestion.value
  if (!q)
    return
  const correct = wrongSelectedAnswer.value === q.answer
  uni.showToast({ title: correct ? '回答正确' : '回答错误', icon: 'none' })
}

function removeWrong(id: number) {
  const ids = getStorage<number[]>(StorageKey.WRONG_QUESTIONS, [])
  setStorage(
    StorageKey.WRONG_QUESTIONS,
    ids.filter(x => x !== id),
  )
  if (selectedWrongId.value === id) {
    selectedWrongId.value = null
  }
  refreshWrong()
  uni.showToast({ title: '已移除', icon: 'none' })
}

function resetAll() {
  uni.showModal({
    title: '确认重置',
    content: '将清空收藏、错题本与进度记录，是否继续？',
    confirmText: '清空',
    cancelText: '取消',
    success(res) {
      if (!res.confirm)
        return
      removeStorage(StorageKey.COLLECTED_CARDS)
      removeStorage(StorageKey.WRONG_QUESTIONS)
      removeStorage(StorageKey.LAST_CARD_INDEX)
      removeStorage(StorageKey.LAST_EXAM_INDEX)
      removeStorage(StorageKey.ME_ACTIVE_TAB)
      refreshCollected()
      refreshWrong()
      setTab('collect')
      uni.showToast({ title: '数据已清空', icon: 'none' })
    },
  })
}

onShow(() => {
  refreshCollected()
  refreshWrong()
  activeTab.value = getStorage(StorageKey.ME_ACTIVE_TAB, activeTab.value)
})
</script>

<template>
  <view class="min-h-screen bg-[var(--app-bg)] p-safe">
    <view class="px-[24rpx] pb-[32rpx] pt-[24rpx]">
      <view
        class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)]"
      >
        <view class="flex items-center justify-between">
          <view>
            <view
              class="text-[36rpx] text-[var(--app-text)] font-700 leading-[44rpx]"
            >
              我的
            </view>
            <view
              class="mt-1 text-[24rpx] text-[var(--app-muted)] leading-[34rpx]"
            >
              收藏与错题数据都保存在本地
            </view>
          </view>
          <view class="flex items-center gap-2">
            <view
              class="rounded-[14rpx] bg-[#eef6ff] px-[14rpx] py-[10rpx] text-[22rpx] text-primary"
            >
              收藏 {{ collectedCards.length }}
            </view>
            <view
              class="rounded-[14rpx] bg-[#fff3e6] px-[14rpx] py-[10rpx] text-[22rpx] text-[var(--app-accent)]"
            >
              错题 {{ wrongQuestions.length }}
            </view>
          </view>
        </view>
      </view>

      <view
        class="mt-4 border-1 border-[var(--app-border)] rounded-full bg-white p-[6rpx] shadow-[var(--app-shadow-sm)]"
      >
        <view class="flex items-center gap-1">
          <view
            class="flex-1 rounded-full py-[18rpx] text-center text-[26rpx] transition-all duration-300 active:scale-[0.98] active:brightness-95"
            :class="
              activeTab === 'collect'
                ? 'bg-[#4096ff] text-white'
                : 'bg-white text-[var(--app-text)]'
            "
            @click="setTab('collect')"
          >
            收藏
          </view>
          <view
            class="flex-1 rounded-full py-[18rpx] text-center text-[26rpx] transition-all duration-300 active:scale-[0.98] active:brightness-95"
            :class="
              activeTab === 'wrong'
                ? 'bg-[#4096ff] text-white'
                : 'bg-white text-[var(--app-text)]'
            "
            @click="setTab('wrong')"
          >
            错题本
          </view>
          <view
            class="flex-1 rounded-full py-[18rpx] text-center text-[26rpx] transition-all duration-300 active:scale-[0.98] active:brightness-95"
            :class="
              activeTab === 'manage'
                ? 'bg-[#4096ff] text-white'
                : 'bg-white text-[var(--app-text)]'
            "
            @click="setTab('manage')"
          >
            管理
          </view>
        </view>
      </view>

      <view v-if="activeTab === 'collect'" class="mt-4">
        <view
          v-if="collectedCards.length === 0"
          class="mt-10 text-center text-3.5 text-[var(--app-muted)]"
        >
          暂无数据
        </view>

        <view v-else>
          <view
            v-for="(c, idx) in collectedCards"
            :key="c.id"
            class="mb-3 border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[22rpx] shadow-[var(--app-shadow-sm)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
            @click="openCollectedDetail(idx)"
          >
            <view class="flex items-center justify-between">
              <view
                class="mr-3 flex-1 text-[28rpx] text-[var(--app-text)] font-700 leading-[44rpx]"
              >
                {{ c.title }}
              </view>
              <view
                class="border-1 border-[var(--app-border)] rounded-[10rpx] bg-[#fff3e6] px-[16rpx] py-[10rpx] text-[24rpx] text-[var(--app-accent)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
                @click.stop="uncollectCard(c.id)"
              >
                取消
              </view>
            </view>
            <view
              class="mt-2 text-[24rpx] text-[var(--app-muted)] leading-[34rpx]"
            >
              {{ c.chapter }}
            </view>
          </view>

          <view
            v-if="selectedCollectedCard"
            class="mt-4 border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)]"
          >
            <view class="flex items-center justify-between">
              <view
                class="text-[24rpx] text-[var(--app-muted)] leading-[34rpx]"
              >
                {{ (selectedCollectedIndex ?? 0) + 1 }} /
                {{ collectedCards.length }}
              </view>
              <view
                class="border-1 border-[var(--app-border)] rounded-[10rpx] bg-[#fff3e6] px-[16rpx] py-[10rpx] text-[24rpx] text-[var(--app-accent)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
                @click="uncollectCard(selectedCollectedCard.id)"
              >
                取消收藏
              </view>
            </view>

            <view class="me-card-scene mt-3" @click="toggleCollectedFlip">
              <view class="me-card" :class="{ flipped: collectedIsFlipped }">
                <view class="me-card-face me-card-front">
                  <view class="text-4.5 font-semibold leading-7">
                    {{ selectedCollectedCard.title }}
                  </view>
                  <view class="mt-2 text-3 text-[#666]">
                    点击翻转查看解析
                  </view>
                </view>
                <view class="me-card-face me-card-back">
                  <view class="text-4.5 font-semibold leading-7">
                    解析
                  </view>
                  <view
                    class="mt-2 whitespace-pre-wrap text-3.5 text-[#333] leading-6"
                  >
                    {{ selectedCollectedCard.content }}
                  </view>
                </view>
              </view>
            </view>

            <view class="mt-4 flex gap-3">
              <view
                class="flex-1 border-1 border-[var(--app-border)] rounded-[10rpx] bg-white py-[22rpx] text-center text-[28rpx] text-[var(--app-text)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
                @click="collectedPrev"
              >
                上一张
              </view>
              <view
                class="flex-1 border-1 border-[var(--app-border)] rounded-[10rpx] bg-white py-[22rpx] text-center text-[28rpx] text-[var(--app-text)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
                @click="collectedNext"
              >
                下一张
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="activeTab === 'wrong'" class="mt-4">
        <view
          v-if="wrongQuestions.length === 0"
          class="mt-10 text-center text-3.5 text-[var(--app-muted)]"
        >
          暂无数据
        </view>

        <view v-else>
          <view
            v-for="q in wrongQuestions"
            :key="q.id"
            class="mb-3 border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[22rpx] shadow-[var(--app-shadow-sm)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
            @click="openWrongDetail(q.id)"
          >
            <view
              class="text-[28rpx] text-[var(--app-text)] font-700 leading-[44rpx]"
            >
              {{ q.title }}
            </view>
            <view
              class="mt-2 text-[24rpx] text-[var(--app-muted)] leading-[34rpx]"
            >
              {{ q.chapter }}
            </view>
          </view>

          <view v-if="selectedWrongQuestion" class="mt-4">
            <view
              class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)]"
            >
              <view class="flex items-center justify-between gap-3">
                <view
                  class="text-[30rpx] text-[var(--app-text)] font-700 leading-[46rpx]"
                >
                  重新答题
                </view>
                <view
                  class="border-1 border-[var(--app-border)] rounded-[10rpx] bg-[#fff3e6] px-[16rpx] py-[10rpx] text-[24rpx] text-[var(--app-accent)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
                  @click="removeWrong(selectedWrongQuestion.id)"
                >
                  移除错题
                </view>
              </view>
              <view
                class="mt-3 text-[28rpx] text-[var(--app-text)] leading-[44rpx]"
              >
                {{ selectedWrongQuestion.title }}
              </view>
            </view>

            <radio-group class="mt-3" @change="wrongOptionChange">
              <view
                v-for="opt in selectedWrongQuestion.options"
                :key="opt.label"
                class="mb-3 border-1 rounded-[20rpx] bg-white p-[22rpx] transition-all duration-300 active:scale-[0.98] active:brightness-95"
                :class="
                  wrongSubmitted && opt.label === selectedWrongQuestion.answer
                    ? 'bg-[#e9f8ef] border-[#35b86b]'
                    : 'border-[var(--app-border)]'
                "
              >
                <view class="flex items-start justify-between gap-3">
                  <view class="flex flex-1 items-start gap-3">
                    <view
                      class="mt-0.2 h-[34rpx] w-[34rpx] center rounded-full text-[22rpx] font-700"
                      :class="
                        wrongSelectedAnswer === opt.label
                          ? 'bg-[#eef6ff] text-primary'
                          : 'bg-[#f5f7fa] text-[var(--app-text)]'
                      "
                    >
                      {{ opt.label }}
                    </view>
                    <view
                      class="flex-1 text-[28rpx] text-[var(--app-text)] leading-[44rpx]"
                    >
                      {{ opt.value }}
                    </view>
                  </view>
                  <radio
                    :value="opt.label"
                    :checked="wrongSelectedAnswer === opt.label"
                    :disabled="wrongSubmitted"
                  />
                </view>
              </view>
            </radio-group>

            <view
              v-if="wrongSubmitted"
              class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)]"
            >
              <view class="text-[26rpx] text-[var(--app-text)] leading-[42rpx]">
                <text class="text-[var(--app-muted)]">正确答案：</text>
                <text class="font-700">{{ selectedWrongQuestion.answer }}</text>
              </view>
              <view
                class="mt-2 whitespace-pre-wrap text-[26rpx] text-[var(--app-text)] leading-[42rpx]"
              >
                {{ selectedWrongQuestion.analysis }}
              </view>
            </view>

            <view class="mt-4 flex gap-3">
              <view
                class="flex-1 rounded-[10rpx] py-[22rpx] text-center text-[28rpx] text-white transition-all duration-300 active:scale-[0.98] active:brightness-95"
                :class="
                  !wrongSelectedAnswer || wrongSubmitted
                    ? 'bg-[#cfd6df]'
                    : 'bg-[#4096ff]'
                "
                @click="submitWrong"
              >
                提交
              </view>
              <view
                class="flex-1 border-1 border-[var(--app-border)] rounded-[10rpx] bg-white py-[22rpx] text-center text-[28rpx] text-[var(--app-text)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
                @click="openWrongDetail(selectedWrongQuestion.id)"
              >
                重做
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="mt-4">
        <view
          class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)]"
        >
          <view
            class="text-[30rpx] text-[var(--app-text)] font-700 leading-[46rpx]"
          >
            数据管理
          </view>
          <view
            class="mt-2 text-[24rpx] text-[var(--app-muted)] leading-[36rpx]"
          >
            清空收藏、错题本与进度记录，无法恢复
          </view>
          <view
            class="mt-4 border-1 border-[var(--app-border)] rounded-[10rpx] bg-[#fff3e6] py-[22rpx] text-center text-[28rpx] text-[var(--app-accent)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
            @click="resetAll"
          >
            重置所有数据
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.me-card-scene {
  perspective: 900px;
}
.me-card {
  position: relative;
  width: 100%;
  height: 420rpx;
  transform-style: preserve-3d;
  transition: transform 0.5s;
}
.me-card.flipped {
  transform: rotateY(180deg);
}
.me-card-face {
  position: absolute;
  inset: 0;
  border-radius: 20rpx;
  background: var(--app-card-grad);
  padding: 28rpx;
  backface-visibility: hidden;
  border: 1px solid var(--app-border);
  box-shadow: var(--app-shadow-sm);
}
.me-card-back {
  transform: rotateY(180deg);
}
</style>
