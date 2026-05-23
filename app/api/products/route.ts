import { NextResponse } from 'next/server'
import { categories } from '@/lib/products'
import { getProducts } from '@/lib/product-store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sort = searchParams.get('sort')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')

  const products = getProducts()
  let filteredProducts = [...products]

  // Filter by category
  if (category && category !== 'all') {
    const categoryName =
      categories.find((item) => item.slug === category)?.name ?? category

    filteredProducts = filteredProducts.filter(
      (product) => product.category.toLowerCase() === categoryName.toLowerCase()
    )
  }

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase()
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower) ||
      p.supplier.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    )
  }

  // Filter by price range
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseInt(minPrice))
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseInt(maxPrice))
  }

  // Sort
  switch (sort) {
    case 'price-asc':
      filteredProducts.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      filteredProducts.sort((a, b) => b.price - a.price)
      break
    case 'name-asc':
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'rating':
      filteredProducts.sort((a, b) => b.rating - a.rating)
      break
    case 'newest':
      filteredProducts.sort((a, b) => (b.badge === 'Nouveau' ? 1 : 0) - (a.badge === 'Nouveau' ? 1 : 0))
      break
    default:
      filteredProducts.sort((a, b) => b.rating - a.rating)
  }

  const total = filteredProducts.length

  // Pagination
  if (offset) {
    filteredProducts = filteredProducts.slice(parseInt(offset))
  }
  if (limit) {
    filteredProducts = filteredProducts.slice(0, parseInt(limit))
  }

  return NextResponse.json({
    products: filteredProducts,
    total,
    categories: [...new Set(products.map(p => p.category))],
  })
}
