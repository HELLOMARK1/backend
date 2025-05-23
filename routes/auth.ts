import { Elysia } from 'elysia'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signToken, verifyToken } from '../utils/auth'

const prisma = new PrismaClient()

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body }) => {
    const { email, password, storeCode, role } = body
    const store = await prisma.store.findUnique({ where: { code: storeCode } })
    if (!store) return { error: 'ร้านไม่ถูกต้อง' }
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashed, storeId: store.id, role: role || 'user' }
    })
    return { message: 'Registered', user: { id: user.id, email: user.email, storeId: store.id } }
  })
  .post('/login', async ({ body }) => {
    const { email, password } = body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { error: 'User not found' }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return { error: 'Invalid password' }
    const token = signToken({ id: user.id, email: user.email, storeId: user.storeId, role: user.role })
    return { token }
  })
  .get('/me', async ({ headers }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const payload = verifyToken(token)
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        include: { store: true }
      })
      if (!user) return { error: 'User not found' }
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        store: {
          id: user.store.id,
          name: user.store.name,
          code: user.store.code
        },
        createdAt: user.createdAt
      }
    } catch {
      return { error: 'Invalid token' }
    }
  })

  