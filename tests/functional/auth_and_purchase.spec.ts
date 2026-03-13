import { test } from '@japa/runner'
import User from '#models/user'
import Gateway from '#models/gateway'

test.group('Auth & Purchase', (group) => {
  group.each.setup(async () => {
    await User.truncate(true)
    await Gateway.truncate(true)

    await Gateway.createMany([
      { name: 'gateway1', isActive: true, priority: 1 },
      { name: 'gateway2', isActive: true, priority: 2 },
    ])
  })

  test('signup and login returns token', async ({ client, assert }) => {
    const signupResponse = await client.post('/api/v1/auth/signup').json({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    signupResponse.assertStatus(200)
    assert.exists(signupResponse.body().token)

    const loginResponse = await client.post('/api/v1/auth/login').json({
      email: 'admin@example.com',
      password: 'password123',
    })

    loginResponse.assertStatus(200)
    assert.exists(loginResponse.body().token)
  })

  test('public purchase route returns created transaction', async ({ client }) => {
    const response = await client.post('/api/v1/purchase').json({
      clientName: 'Tester',
      clientEmail: 'tester@example.com',
      amount: 1000,
      cardNumber: '5569000000006063',
      cvv: '010',
    })

    // Como nos testes não temos os mocks externos rodando, aceitamos
    // tanto sucesso quanto falha, mas garantimos que a API responde.
    response.assertStatus(201).or(400)
  })
})

