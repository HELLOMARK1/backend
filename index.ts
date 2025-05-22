import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import dotenv from 'dotenv'
import { authRoutes } from './routes/auth'

dotenv.config()

const app = new Elysia()
  .use(cors({
    origin: true, // หรือใส่ origin เฉพาะเช่น: 'http://localhost:4321'
    credentials: true
  }))
  .use(authRoutes)
  .get('/', () => 'API is live!')
  .listen(3000)

console.log('✅ API running at http://localhost:3000')
