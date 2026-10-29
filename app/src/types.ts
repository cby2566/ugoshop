export interface Product {
  id: number
  sid: number
  name: string
  brand: string
  price: number
  description: string
  image: string | null
  legacyUrl: string | null
  /** D1：列表页分类（null=未分类） */
  category: string | null
  /** D2：销量与上架时间戳（ms） */
  sales: number
  createdAt: number
}

/** 分页响应（GET /api/products），page 从 1 起，默认每页 6 条（原版行为） */
export interface ProductPage {
  items: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface MenuCategory {
  title: string
  icon: string
  items: string[]
}
