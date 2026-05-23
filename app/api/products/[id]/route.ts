import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/product-store'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const products = getProducts()
  const product = products.find(p => p.id === Number(id))

  if (!product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    )
  }

  // Get related products from the same category
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return NextResponse.json({
    product,
    relatedProducts,
  })
}
