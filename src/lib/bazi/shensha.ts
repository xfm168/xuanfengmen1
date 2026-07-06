import type { SixLines, HeavenlyStem } from './types'
import type { ShenShaInfo } from './shensha/types'
import { checkTianyi } from './shensha/tianyi'
import { checkTaohua } from './shensha/taohua'
import { checkHongluan } from './shensha/hongluan'
import { checkWenchang } from './shensha/wenchang'
import { checkKongwang } from './shensha/kongwang'
import { checkHuagai } from './shensha/huagai'
import { checkYangren } from './shensha/yangren'
import { checkJiesha } from './shensha/jiesha'
import { checkYima } from './shensha/yima'

export type { ShenShaInfo }

export interface ShenShaCategory {
  name: string
  items: ShenShaInfo[]
}

/**
 * 神煞聚合入口
 * 调用已有 9 个神煞子模块，按四大分类输出
 */
export function calculateShenSha(
  sixLines: SixLines,
  dayGan: HeavenlyStem,
  gender: string,
): ShenShaCategory[] {
  return [
    {
      name: '吉神贵神',
      items: [
        ...checkTianyi(sixLines, dayGan, gender),
        ...checkWenchang(sixLines, dayGan, gender),
        ...checkHongluan(sixLines, dayGan, gender),
      ],
    },
    {
      name: '桃花人缘',
      items: [
        ...checkTaohua(sixLines, dayGan, gender),
      ],
    },
    {
      name: '凶煞',
      items: [
        ...checkYangren(sixLines, dayGan, gender),
        ...checkJiesha(sixLines, dayGan, gender),
        ...checkKongwang(sixLines, dayGan, gender),
      ],
    },
    {
      name: '特殊神煞',
      items: [
        ...checkHuagai(sixLines, dayGan, gender),
        ...checkYima(sixLines, dayGan, gender),
      ],
    },
  ]
}
