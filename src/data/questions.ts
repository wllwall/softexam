import type { ExamQuestion, ExamQuestionPack } from '@/types'
import { StorageKey } from '@/types'
import { getStorage, setStorage } from '@/utils/storage'

function normalizeId(packId: string, id: unknown) {
  const raw = typeof id === 'string' ? id : String(id ?? '')
  if (!raw)
    return ''
  if (raw.includes(':'))
    return raw
  return `${packId}:${raw}`
}

function normalizeOptions(options: unknown) {
  if (!Array.isArray(options))
    return []
  return options
    .map((opt) => {
      const label = (opt as any)?.label
      const value = (opt as any)?.value
      if (typeof label !== 'string' || typeof value !== 'string')
        return null
      return { label, value }
    })
    .filter(Boolean) as { label: string, value: string }[]
}

export function normalizeQuestionPackData(data: unknown): ExamQuestionPack | null {
  if (!data || typeof data !== 'object')
    return null

  const packId = (data as any).packId
  const title = (data as any).title
  const version = (data as any).version
  const questions = (data as any).questions

  if (typeof packId !== 'string' || !packId.trim())
    return null
  if (typeof title !== 'string' || !title.trim())
    return null
  if (typeof version !== 'string' || !version.trim())
    return null
  if (!Array.isArray(questions))
    return null

  const normalizedQuestions = questions
    .map((q) => {
      const id = normalizeId(packId, (q as any)?.id)
      const chapter = (q as any)?.chapter
      const qTitle = (q as any)?.title
      const answer = (q as any)?.answer
      const analysis = (q as any)?.analysis
      const options = normalizeOptions((q as any)?.options)
      const tags = (q as any)?.tags
      const difficulty = (q as any)?.difficulty
      const source = (q as any)?.source
      const attachments = (q as any)?.attachments

      if (!id || typeof chapter !== 'string' || typeof qTitle !== 'string' || typeof answer !== 'string' || typeof analysis !== 'string')
        return null

      const normalized: Omit<ExamQuestion, 'isWrong'> = {
        id,
        title: qTitle,
        options,
        answer,
        analysis,
        chapter,
      }

      if (Array.isArray(tags) && tags.every(t => typeof t === 'string'))
        normalized.tags = tags
      if ([1, 2, 3, 4, 5].includes(difficulty))
        normalized.difficulty = difficulty
      if (typeof source === 'string' && source.trim())
        normalized.source = source
      if (
        Array.isArray(attachments)
        && attachments.every(a => (a as any)?.type === 'image' && typeof (a as any)?.url === 'string' && (a as any)?.url.trim())
      ) {
        normalized.attachments = attachments.map(a => ({ type: 'image', url: (a as any).url }))
      }

      return normalized
    })
    .filter(Boolean) as Omit<ExamQuestion, 'isWrong'>[]

  return {
    packId: packId.trim(),
    title: title.trim(),
    version: version.trim(),
    questions: normalizedQuestions,
  }
}

export function getCustomQuestionPacks(): ExamQuestionPack[] {
  const packs = getStorage<unknown>(StorageKey.CUSTOM_QUESTION_PACKS, [])
  if (!Array.isArray(packs))
    return []
  return packs
    .map(p => normalizeQuestionPackData(p))
    .filter(Boolean) as ExamQuestionPack[]
}

export function setCustomQuestionPacks(packs: ExamQuestionPack[]) {
  setStorage(StorageKey.CUSTOM_QUESTION_PACKS, packs)
}

export function addOrReplaceCustomQuestionPack(pack: ExamQuestionPack) {
  const existing = getCustomQuestionPacks()
  const idx = existing.findIndex(p => p.packId === pack.packId)
  if (idx >= 0)
    existing[idx] = pack
  else
    existing.push(pack)
  setCustomQuestionPacks(existing)
}

export function getWrongQuestionIds(): string[] {
  const raw = getStorage<any>(StorageKey.WRONG_QUESTIONS, [])
  if (!Array.isArray(raw))
    return []
  const normalized = raw
    .map((x) => {
      if (typeof x === 'string')
        return x
      if (typeof x === 'number')
        return `builtin:${x}`
      return String(x ?? '')
    })
    .filter(x => typeof x === 'string' && x.trim())
  const uniq = Array.from(new Set(normalized))
  const isSame = raw.length === uniq.length && raw.every((v, i) => v === uniq[i])
  if (!isSame)
    setStorage(StorageKey.WRONG_QUESTIONS, uniq)
  return uniq
}

export const builtInQuestionPack: ExamQuestionPack = {
  packId: 'builtin',
  title: '内置题库',
  version: '1.0.0',
  questions: [
    {
      id: 'builtin:1',
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
      tags: ['整体管理', '立项'],
      difficulty: 2,
      source: '自编',
    },
    {
      id: 'builtin:2',
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
      tags: ['进度', '网络图'],
      difficulty: 2,
      source: '自编',
    },
    {
      id: 'builtin:3',
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
      tags: ['EVM'],
      difficulty: 3,
      source: '自编',
    },
    {
      id: 'builtin:4',
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
      tags: ['质量', '成本'],
      difficulty: 2,
      source: '自编',
    },
    {
      id: 'builtin:5',
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
      tags: ['风险应对'],
      difficulty: 2,
      source: '自编',
    },
  ],
}

export function getAllQuestionPacks(): ExamQuestionPack[] {
  return [builtInQuestionPack, ...getCustomQuestionPacks()]
}

export function getAllQuestions(): ExamQuestion[] {
  const wrongIds = new Set(getWrongQuestionIds())
  return getAllQuestionPacks()
    .flatMap(pack => pack.questions)
    .map(q => ({ ...q, isWrong: wrongIds.has(q.id) }))
}

export const questionsData: ExamQuestion[] = builtInQuestionPack.questions.map(q => ({ ...q, isWrong: false }))
