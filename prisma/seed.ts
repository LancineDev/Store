import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()

  // Seed products
  const products = [
    {
      id: 'cm1abc123def456',
      name: 'Ballon de Basketball Pro',
      description: 'Ballon de basketball professionnel avec grip supérieur et durabilité exceptionnelle.',
      price: 8500,
      imageUrl: '/category-basketball.jpg',
    },
    {
      id: 'cm2def456ghi789',
      name: 'Chaussures Running Elite',
      description: 'Chaussures de running haute performance avec amorti révolutionnaire et légèreté optimale.',
      price: 22000,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    },
    // Add more products as needed
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })