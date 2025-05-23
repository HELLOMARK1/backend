import { Elysia } from 'elysia'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '../utils/auth'
import { getStoreFromHost } from '../utils/tenant'

const prisma = new PrismaClient()

export const productRoutes = new Elysia({ prefix: '/products' })
  .get('/', async ({ headers }) => {
    const storeCode = getStoreFromHost(headers.host || '')
    const store = await prisma.store.findUnique({ where: { code: storeCode } })
    if (!store) return { error: 'ร้านไม่พบ' }
    const products = await prisma.product.findMany({ where: { storeId: store.id } })
    return { products }
  })
  .post('/', async ({ headers, body }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const user = verifyToken(token)
      if (user.role !== 'admin') return { error: 'Unauthorized' }

      const storeCode = getStoreFromHost(headers.host || '')
      const store = await prisma.store.findUnique({ where: { code: storeCode } })
      if (!store) return { error: 'ร้านไม่พบ' }

      const { name, price } = body
      const product = await prisma.product.create({
        data: { name, price: parseFloat(price), storeId: store.id }
      })
      return { product }
    } catch {
      return { error: 'Invalid token' }
    }
  })
  .put('/:id', async ({ headers, body, params }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const user = verifyToken(token)
      if (user.role !== 'admin') return { error: 'Unauthorized' }

      const product = await prisma.product.update({
        where: { id: params.id },
        data: body
      })
      return { product }
    } catch {
      return { error: 'Invalid token or update failed' }
    }
  })
  .delete('/:id', async ({ headers, params }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const user = verifyToken(token)
      if (user.role !== 'admin') return { error: 'Unauthorized' }

      await prisma.product.delete({ where: { id: params.id } })
      return { message: 'Product deleted' }
    } catch {
      return { error: 'Invalid token or delete failed' }
    }
  })