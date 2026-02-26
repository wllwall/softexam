<script setup lang="ts">
import type { ExamQuestion } from '@/types'
import { questionsData } from '@/data/questions'
import { StorageKey } from '@/types'
import { getStorage, setStorage } from '@/utils/storage'

definePage({
  style: {
    navigationBarTitleText: '刷题',
  },
})

interface LastIndexState {
  chapter: string
  index: number
}

const loading = ref(true)

const questions = ref<ExamQuestion[]>([])
const selectedChapterIndex = ref(0)
const chapterList = computed(() => {
  const set = new Set(questions.value.map(q => q.chapter))
  return ['全部章节', ...Array.from(set)]
})

const filteredQuestions = computed(() => {
  const chapter = chapterList.value[selectedChapterIndex.value]
  if (!chapter || chapter === '全部章节')
    return questions.value
  return questions.value.filter(q => q.chapter === chapter)
})

const currentIndex = ref(0)
const currentQuestion = computed(() => filteredQuestions.value[currentIndex.value])

const selectedAnswer = ref<string>('')
const submitted = ref(false)
const isCorrect = computed(() => {
  if (!submitted.value)
    return null
  return selectedAnswer.value === currentQuestion.value?.answer
})

function syncWrongState() {
  const wrongIds = getStorage<number[]>(StorageKey.WRONG_QUESTIONS, [])
  questions.value = questionsData.map(q => ({
    ...q,
    isWrong: wrongIds.includes(q.id),
  }))
}

function persistLastIndex() {
  const chapter = chapterList.value[selectedChapterIndex.value] || '全部章节'
  const state: LastIndexState = { chapter, index: currentIndex.value }
  setStorage(StorageKey.LAST_EXAM_INDEX, state)
}

function restoreLastIndex() {
  const state = getStorage<LastIndexState | null>(StorageKey.LAST_EXAM_INDEX, null)
  if (!state)
    return
  const chapterIdx = chapterList.value.findIndex(ch => ch === state.chapter)
  if (chapterIdx >= 0) {
    selectedChapterIndex.value = chapterIdx
  }
  const max = filteredQuestions.value.length - 1
  if (max < 0) {
    currentIndex.value = 0
    return
  }
  currentIndex.value = Math.min(Math.max(state.index, 0), max)
}

function resetAnswerState() {
  selectedAnswer.value = ''
  submitted.value = false
}

function onChapterChange(e: any) {
  const idx = Number(e.detail?.value ?? 0)
  selectedChapterIndex.value = Number.isNaN(idx) ? 0 : idx
  currentIndex.value = 0
  resetAnswerState()
  persistLastIndex()
}

function onOptionChange(e: any) {
  if (submitted.value)
    return
  selectedAnswer.value = e.detail?.value ?? ''
}

function submit() {
  if (submitted.value)
    return
  if (!selectedAnswer.value) {
    uni.showToast({ title: '请选择答案', icon: 'none' })
    return
  }
  submitted.value = true
  const q = currentQuestion.value
  if (!q)
    return

  const wrongIds = getStorage<number[]>(StorageKey.WRONG_QUESTIONS, [])
  const correct = selectedAnswer.value === q.answer
  if (!correct) {
    const newIds = Array.from(new Set([...wrongIds, q.id]))
    setStorage(StorageKey.WRONG_QUESTIONS, newIds)
    q.isWrong = true
  }
  uni.showToast({ title: correct ? '回答正确' : '回答错误', icon: 'none' })
}

function goPrev() {
  if (currentIndex.value <= 0) {
    uni.showToast({ title: '已经是第一题', icon: 'none' })
    return
  }
  currentIndex.value -= 1
  resetAnswerState()
  persistLastIndex()
}

function goNext() {
  if (currentIndex.value >= filteredQuestions.value.length - 1) {
    uni.showToast({ title: '已经是最后一题', icon: 'none' })
    return
  }
  currentIndex.value += 1
  resetAnswerState()
  persistLastIndex()
}

function getOptionClass(optionLabel: string) {
  if (!submitted.value)
    return selectedAnswer.value === optionLabel ? 'bg-[#eef6ff] border-[#4096ff]' : 'bg-white border-[var(--app-border)]'

  const answer = currentQuestion.value?.answer
  if (optionLabel === answer)
    return 'bg-[#e9f8ef] border-[#35b86b]'
  if (selectedAnswer.value === optionLabel && optionLabel !== answer)
    return 'bg-[#ffecec] border-[#d82c2c]'
  return 'bg-white border-[var(--app-border)]'
}

onShow(() => {
  syncWrongState()
  if (!loading.value)
    restoreLastIndex()
})

onMounted(async () => {
  syncWrongState()
  await nextTick()
  restoreLastIndex()
  loading.value = false
})
</script>

<template>
  <view class="min-h-screen bg-[var(--app-bg)] p-safe">
    <view class="px-[24rpx] pb-[32rpx] pt-[24rpx]">
      <view class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)]">
        <view class="flex items-center justify-between gap-3">
          <view class="flex-1">
            <view class="text-[36rpx] text-[var(--app-text)] font-700 leading-[44rpx]">
              刷题
            </view>
            <view class="mt-1 text-[24rpx] text-[var(--app-muted)] leading-[34rpx]">
              选择答案后提交，查看解析
            </view>
          </view>
          <picker :range="chapterList" :value="selectedChapterIndex" @change="onChapterChange">
            <view class="border-1 border-[var(--app-border)] rounded-[10rpx] bg-[#f7f8fa] px-[18rpx] py-[12rpx] text-[26rpx] text-[var(--app-text)] transition-all duration-300 active:scale-[0.98] active:brightness-95">
              {{ chapterList[selectedChapterIndex] }}
            </view>
          </picker>
        </view>
      </view>

      <view v-if="loading" class="mt-4 rounded-4 bg-white p-4">
        <view class="h-5 w-80 rounded-2 bg-[#eee]" />
        <view class="mt-3 h-20 rounded-2 bg-[#eee]" />
        <view class="mt-3 h-20 rounded-2 bg-[#eee]" />
      </view>

      <view v-else-if="filteredQuestions.length === 0" class="mt-10 text-center text-3.5 text-[var(--app-muted)]">
        该章节暂无题目
      </view>

      <view v-else class="mt-4">
        <view class="flex items-center justify-between">
          <view class="text-[24rpx] text-[var(--app-muted)] leading-[34rpx]">
            {{ currentIndex + 1 }} / {{ filteredQuestions.length }}
          </view>
          <view
            v-if="currentQuestion?.isWrong"
            class="rounded-full bg-[#fff3e6] px-[16rpx] py-[10rpx] text-[24rpx] text-[var(--app-accent)]"
          >
            错题
          </view>
        </view>

        <view class="mt-3 border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)]">
          <view class="text-[30rpx] text-[var(--app-text)] font-700 leading-[46rpx]">
            {{ currentQuestion?.title }}
          </view>
        </view>

        <radio-group class="mt-3" @change="onOptionChange">
          <view
            v-for="opt in currentQuestion?.options"
            :key="opt.label"
            class="mb-3 border-1 rounded-[20rpx] bg-white p-[22rpx] transition-all duration-300 active:scale-[0.98] active:brightness-95"
            :class="getOptionClass(opt.label)"
          >
            <view class="flex items-start justify-between gap-3">
              <view class="flex flex-1 items-start gap-3">
                <view
                  class="mt-0.2 h-[34rpx] w-[34rpx] center rounded-full text-[22rpx] font-700"
                  :class="selectedAnswer === opt.label ? 'bg-[#eef6ff] text-primary' : 'bg-[#f5f7fa] text-[var(--app-text)]'"
                >
                  {{ opt.label }}
                </view>
                <view class="flex-1 text-[28rpx] text-[var(--app-text)] leading-[44rpx]">
                  {{ opt.value }}
                </view>
              </view>
              <radio :value="opt.label" :checked="selectedAnswer === opt.label" :disabled="submitted" />
            </view>
          </view>
        </radio-group>

        <view v-if="submitted" class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)]">
          <view class="text-[26rpx] text-[var(--app-text)] leading-[42rpx]">
            <text class="text-[var(--app-muted)]">正确答案：</text>
            <text class="font-700">{{ currentQuestion?.answer }}</text>
            <text v-if="isCorrect === true" class="ml-2 text-[#35b86b]">正确</text>
            <text v-else class="ml-2 text-[#d82c2c]">错误</text>
          </view>
          <view class="mt-2 whitespace-pre-wrap text-[26rpx] text-[var(--app-text)] leading-[42rpx]">
            {{ currentQuestion?.analysis }}
          </view>
        </view>

        <view class="mt-4 flex items-center gap-2">
          <view class="flex-1 border-1 border-[var(--app-border)] rounded-[10rpx] bg-white py-[22rpx] text-center text-[28rpx] text-[var(--app-text)] transition-all duration-300 active:scale-[0.98] active:brightness-95" @click="goPrev">
            上一题
          </view>
          <view
            class="flex-1 rounded-[10rpx] py-[22rpx] text-center text-[28rpx] text-white transition-all duration-300 active:scale-[0.98] active:brightness-95"
            :class="!selectedAnswer || submitted ? 'bg-[#cfd6df]' : 'bg-[#4096ff]'"
            @click="submit"
          >
            提交
          </view>
          <view class="flex-1 border-1 border-[var(--app-border)] rounded-[10rpx] bg-white py-[22rpx] text-center text-[28rpx] text-[var(--app-text)] transition-all duration-300 active:scale-[0.98] active:brightness-95" @click="goNext">
            下一题
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
