export interface Product {
  id: number
  sid: number
  name: string
  brand: string
  price: number
  description: string
  image: string | null
  legacyUrl: string | null
}

export interface MenuCategory {
  title: string
  icon: string
  items: string[]
}
