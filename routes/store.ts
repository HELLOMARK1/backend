import { Elysia } from 'elysia'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const storeRoutes = new Elysia({ prefix: '/stores' })
  .post('/', async ({ body }) => {
    const { code, name } = body
    const exists = await prisma.store.findUnique({ where: { code } })
    if (exists) return { error: 'ร้านนี้มีอยู่แล้ว' }
    const store = await prisma.store.create({ data: { code, name } })
    return { store }
  })
  .get('/:code', async ({ params }) => {
    const store = await prisma.store.findUnique({ where: { code: params.code } })
    return store || { error: 'ไม่พบร้านนี้' }
  })
