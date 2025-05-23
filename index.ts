import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import dotenv from 'dotenv'
import { authRoutes } from './routes/auth'

dotenv.config()

const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true
  }))
  .use(authRoutes)
  .get('/', () => '✅ API พร้อมใช้งานแล้ว (ระบบหลังบ้านเชื่อมต่อสำเร็จ)')
  .listen(3000)

console.log('✅ API running at http://localhost:3000')
