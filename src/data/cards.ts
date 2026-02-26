import type { Card } from '@/types'

export const cardsData: Card[] = [
  {
    id: 1,
    title: '项目立项的核心产出',
    content: '项目章程是项目立项的核心产出，用于正式授权项目或阶段，并为项目经理提供使用组织资源的权限。',
    chapter: '项目立项',
    isCollected: false,
  },
  {
    id: 2,
    title: '项目管理计划的作用',
    content: '项目管理计划描述项目如何执行、监控和收尾，是各子计划与基准的集成，作为项目管理工作的主要依据。',
    chapter: '整体管理',
    isCollected: false,
  },
  {
    id: 3,
    title: '关键路径法（CPM）要点',
    content: '关键路径决定项目最短工期，关键路径上活动的总时差为0，关键路径变化会影响完工日期。',
    chapter: '进度管理',
    isCollected: false,
  },
  {
    id: 4,
    title: '挣值管理三指标',
    content: 'PV计划价值、EV挣值、AC实际成本。SPI=EV/PV，CPI=EV/AC，用于衡量进度与成本绩效。',
    chapter: '成本管理',
    isCollected: false,
  },
  {
    id: 5,
    title: '质量成本分类',
    content: '一致性成本（预防、评估）与不一致性成本（内部失败、外部失败），应优先投入预防以降低总成本。',
    chapter: '质量管理',
    isCollected: false,
  },
  {
    id: 6,
    title: '风险应对策略（威胁）',
    content: '常见威胁应对：规避、转移、减轻、接受；应对措施应与风险优先级匹配并纳入风险登记册。',
    chapter: '风险管理',
    isCollected: false,
  },
  {
    id: 7,
    title: '变更控制基本原则',
    content: '所有变更必须通过整体变更控制流程，评估影响（范围、进度、成本、质量、风险）并更新相关基准与计划。',
    chapter: '整体管理',
    isCollected: false,
  },
  {
    id: 8,
    title: '沟通管理的关键',
    content: '沟通管理计划明确沟通对象、内容、频率、渠道与责任人，确保信息及时、准确、可追溯。',
    chapter: '沟通管理',
    isCollected: false,
  },
]
