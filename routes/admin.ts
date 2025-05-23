import { Elysia } from 'elysia'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '../utils/auth'

const prisma = new PrismaClient()

export const adminRoutes = new Elysia({ prefix: '/admin' })
  .get('/orders', async ({ headers }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const user = verifyToken(token)
      if (user.role !== 'admin') return { error: 'Unauthorized' }

      const orders = await prisma.order.findMany({
        where: { storeId: user.storeId },
        include: { user: true, product: true }
      })
      return { orders }
    } catch {
      return { error: 'Invalid token' }
    }
  })
  .get('/summary', async ({ headers }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const user = verifyToken(token)
      if (user.role !== 'admin') return { error: 'Unauthorized' }

      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      const [daily, monthly] = await Promise.all([
        prisma.order.count({
          where: {
            storeId: user.storeId,
            createdAt: { gte: startOfDay }
          }
        }),
        prisma.order.count({
          where: {
            storeId: user.storeId,
            createdAt: { gte: startOfMonth }
          }
        })
      ])

      return { today: daily, thisMonth: monthly }
    } catch {
      return { error: 'Invalid token' }
    }
  })
  .get('/users', async ({ headers, query }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const user = verifyToken(token)
      if (user.role !== 'admin') return { error: 'Unauthorized' }

      const keyword = query?.search || ''
      const role = query?.role

      const users = await prisma.user.findMany({
        where: {
          storeId: user.storeId,
          email: { contains: keyword, mode: 'insensitive' },
          ...(role ? { role } : {})
        },
        select: { id: true, email: true, role: true, createdAt: true }
      })
      return { users }
    } catch {
      return { error: 'Invalid token' }
    }
  })
  .put('/users/:id', async ({ headers, body, params }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const admin = verifyToken(token)
      if (admin.role !== 'admin') return { error: 'Unauthorized' }

      const user = await prisma.user.update({
        where: { id: params.id },
        data: body
      })
      return { user }
    } catch {
      return { error: 'Invalid token or update failed' }
    }
  })
  .delete('/users/:id', async ({ headers, params }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const admin = verifyToken(token)
      if (admin.role !== 'admin') return { error: 'Unauthorized' }

      await prisma.user.delete({ where: { id: params.id } })
      return { message: 'User deleted' }
    } catch {
      return { error: 'Invalid token or delete failed' }
    }
  })