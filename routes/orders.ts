import { Elysia } from 'elysia'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '../utils/auth'

const prisma = new PrismaClient()

export const orderRoutes = new Elysia({ prefix: '/orders' })
  .post('/', async ({ headers, body }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const user = verifyToken(token)
      const { productId } = body
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) return { error: 'Product not found' }

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          productId,
          storeId: product.storeId
        }
      })

      return { order }
    } catch {
      return { error: 'Invalid token' }
    }
  })
  .get('/', async ({ headers }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const user = verifyToken(token)
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: { product: true }
      })
      return { orders }
    } catch {
      return { error: 'Invalid token' }
    }
  })