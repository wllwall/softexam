import type { ExamQuestion } from '@/types'

export const questionsData: ExamQuestion[] = [
  {
    id: 1,
    title: '以下哪项是项目立项的核心输出？',
    options: [
      { label: 'A', value: '项目管理计划' },
      { label: 'B', value: '项目章程' },
      { label: 'C', value: '范围说明书' },
      { label: 'D', value: '风险登记册' },
    ],
    answer: 'B',
    analysis: '项目章程用于正式授权项目或阶段，是立项的核心产出。',
    chapter: '项目立项',
    isWrong: false,
  },
  {
    id: 2,
    title: '关键路径法（CPM）中，关键路径上的活动通常具有以下特点：',
    options: [
      { label: 'A', value: '总时差最大' },
      { label: 'B', value: '自由时差最大' },
      { label: 'C', value: '总时差为0' },
      { label: 'D', value: '工期可随意压缩' },
    ],
    answer: 'C',
    analysis: '关键路径上的活动总时差为0，延误会直接影响项目完工日期。',
    chapter: '进度管理',
    isWrong: false,
  },
  {
    id: 3,
    title: '挣值管理中，成本绩效指数 CPI 的计算公式是：',
    options: [
      { label: 'A', value: 'CPI = EV / AC' },
      { label: 'B', value: 'CPI = PV / EV' },
      { label: 'C', value: 'CPI = AC / EV' },
      { label: 'D', value: 'CPI = EV / PV' },
    ],
    answer: 'A',
    analysis: 'CPI=EV/AC，用于衡量成本效率，CPI<1 表示超支。',
    chapter: '成本管理',
    isWrong: false,
  },
  {
    id: 4,
    title: '以下哪项属于质量成本中的一致性成本？',
    options: [
      { label: 'A', value: '外部失败成本' },
      { label: 'B', value: '内部失败成本' },
      { label: 'C', value: '预防成本' },
      { label: 'D', value: '返工成本' },
    ],
    answer: 'C',
    analysis: '一致性成本包括预防成本和评估成本；失败成本包括内部失败与外部失败。',
    chapter: '质量管理',
    isWrong: false,
  },
  {
    id: 5,
    title: '对威胁型风险的常见应对策略不包括：',
    options: [
      { label: 'A', value: '规避' },
      { label: 'B', value: '转移' },
      { label: 'C', value: '利用' },
      { label: 'D', value: '减轻' },
    ],
    answer: 'C',
    analysis: '“利用”是对机会型风险的策略；威胁型风险常见策略为规避、转移、减轻、接受。',
    chapter: '风险管理',
    isWrong: false,
  },
]
