import { test } from '@japa/runner'
import User from '#models/user'

async function createAdmin() {
  return User.create({
    fullName: 'Admin',
    email: 'admin+protected@example.com',
    password: 'password123',
    role: 'admin',
  })
}

test.group('Protected routes', () => {
  test('requires auth to list products', async ({ client }) => {
    const response = await client.get('/api/v1/products')
    response.assertStatus(401)
  })

  test('admin can create product', async ({ client }) => {
    const admin = await createAdmin()

    const login = await client.post('/api/v1/auth/login').json({
      email: admin.email,
      password: 'password123',
    })

    login.assertStatus(200)
    const token = login.body().token

    const response = await client
      .post('/api/v1/products')
      .bearerToken(token)
      .json({ name: 'Produto Teste', amount: 500 })

    response.assertStatus(201)
  })
})

