import { Elysia } from 'elysia'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signToken, verifyToken } from '../utils/auth'

const prisma = new PrismaClient()

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body }) => {
    const { email, password } = body
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashed }
    })
    return { message: 'Registered', user: { id: user.id, email: user.email } }
  })
  .post('/login', async ({ body }) => {
    const { email, password } = body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { error: 'User not found' }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return { error: 'Invalid password' }
    const token = signToken({ id: user.id, email: user.email })
    return { token }
  })
  .get('/me', async ({ headers }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) return { error: 'No token' }
    try {
      const payload = verifyToken(token)
      return { user: payload }
    } catch {
      return { error: 'Invalid token' }
    }
  })
