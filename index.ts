import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import dotenv from 'dotenv'
import { authRoutes } from './routes/auth'
import { storeRoutes } from './routes/store'
import { productRoutes } from './routes/products'
import { orderRoutes } from './routes/orders'
import { adminRoutes } from './routes/admin'

dotenv.config()

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .use(authRoutes)
  .use(storeRoutes)
  .use(productRoutes)
  .use(orderRoutes)
  .use(adminRoutes)
  .get('/', () => '✅ API Multi-Store พร้อมระบบ Subdomain + Role + Order + CRUD + Dashboard')
  .listen(3000)

console.log('✅ API running at http://localhost:3000')



