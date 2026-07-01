/**
 * 八字知识库 - 类型定义
 * 
 * 与风水知识库保持一致的架构
 */

export type KnowledgeCategory =
  | 'classic'      // 经典古籍
  | 'tenGod'        // 十神详解
  | 'pattern'       // 格局详解
  | 'luck'           // 运势
  | 'element'       // 五行
  | 'star'         // 神煞
  | 'case'          // 案例

export interface BaZiKnowledgeEntry {
  id: string
  category: KnowledgeCategory
  title: string
  content: string
  source?: string
  tags: string[]
}

export interface KnowledgeStats {
  total: number
  byCategory: Record<KnowledgeCategory, number>
}
