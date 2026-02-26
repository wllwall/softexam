<script lang="ts" setup>
defineOptions({
  name: 'Home',
})
definePage({
  // 使用 type: "home" 属性设置首页，其他页面不需要设置，默认为page
  type: 'home',
  style: {
    navigationBarTitleText: '首页',
  },
})

function toCards() {
  uni.switchTab({ url: '/pages/cards/index' })
}

function toExam() {
  uni.switchTab({ url: '/pages/exam/index' })
}

function toMe() {
  uni.switchTab({ url: '/pages/me/me' })
}
</script>

<template>
  <view class="min-h-screen bg-[var(--app-bg)] p-safe">
    <view class="px-[24rpx] pb-[32rpx] pt-[24rpx]">
      <view
        class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)]"
      >
        <view class="flex items-start justify-between gap-3">
          <view class="flex-1">
            <view
              class="text-[38rpx] text-[var(--app-text)] font-700 leading-[48rpx]"
            >
              高项速记卡
            </view>
            <view
              class="mt-2 text-[26rpx] text-[var(--app-muted)] leading-[42rpx]"
            >
              轻量化、本地存储的考点记忆 + 单选题刷题工具
            </view>
            <view
              class="mt-3 inline-flex items-center rounded-full bg-[#eef6ff] px-[14rpx] py-[6rpx] text-[22rpx] text-primary"
            >
              纯离线 · 免登录 · 秒开
            </view>
          </view>
          <view
            class="i-carbon-book h-[44rpx] w-[44rpx] center shrink-0 rounded-[14rpx] bg-[#eef6ff] text-[32rpx] text-primary"
          />
        </view>
      </view>

      <view class="grid grid-cols-2 mt-4 gap-3">
        <view
          class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
          @click="toCards"
        >
          <view
            class="i-carbon-book h-[40rpx] w-[40rpx] center rounded-[14rpx] bg-[#eef6ff] text-[28rpx] text-primary"
          />
          <view
            class="mt-3 text-[32rpx] text-[var(--app-text)] font-700 leading-[42rpx]"
          >
            速记卡
          </view>
          <view
            class="mt-1 text-[24rpx] text-[var(--app-muted)] leading-[36rpx]"
          >
            翻牌记忆 · 章节筛选 · 收藏
          </view>
        </view>

        <view
          class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
          @click="toExam"
        >
          <view
            class="i-carbon-task h-[40rpx] w-[40rpx] center rounded-[14rpx] bg-[#eef6ff] text-[28rpx] text-primary"
          />
          <view
            class="mt-3 text-[32rpx] text-[var(--app-text)] font-700 leading-[42rpx]"
          >
            刷题
          </view>
          <view
            class="mt-1 text-[24rpx] text-[var(--app-muted)] leading-[36rpx]"
          >
            单选题 · 即时反馈 · 解析
          </view>
        </view>

        <view
          class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)] transition-all duration-300 active:scale-[0.98] active:brightness-95"
          @click="toMe"
        >
          <view
            class="i-carbon-user h-[40rpx] w-[40rpx] center rounded-[14rpx] bg-[#f5f7fa] text-[28rpx] text-[var(--app-text)]"
          />
          <view
            class="mt-3 text-[32rpx] text-[var(--app-text)] font-700 leading-[42rpx]"
          >
            我的
          </view>
          <view
            class="mt-1 text-[24rpx] text-[var(--app-muted)] leading-[36rpx]"
          >
            收藏 · 错题本 · 数据管理
          </view>
        </view>

        <view
          class="border-1 border-[var(--app-border)] rounded-[20rpx] bg-white p-[24rpx] shadow-[var(--app-shadow-sm)]"
        >
          <view
            class="i-carbon-offline h-[40rpx] w-[40rpx] center rounded-[14rpx] bg-[#fff3e6] text-[28rpx] text-[var(--app-accent)]"
          />
          <view
            class="mt-3 text-[32rpx] text-[var(--app-text)] font-700 leading-[42rpx]"
          >
            离线模式
          </view>
          <view
            class="mt-1 text-[24rpx] text-[var(--app-muted)] leading-[36rpx]"
          >
            无后端 · 零服务器成本 · 本地存储
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
