/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessToken, 'store'])
        router.post('logout', [controllers.AccessToken, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('/profile', [controllers.Profile, 'show'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    /**
     * Public purchase route (Nível 1)
     */
    router.post('/purchase', [controllers.Purchase, 'store'])

    /**
     * Private routes (require auth)
     */
    router
      .group(() => {
        /**
         * Gateways management
         */
        router.get('/gateways', [controllers.Gateways, 'index'])
        router.post('/gateways/:id/toggle', [controllers.Gateways, 'toggle'])
        router.post('/gateways/:id/priority', [controllers.Gateways, 'updatePriority'])

        /**
         * Users CRUD (admin only)
         */
        router
          .group(() => {
            router.get('/users', [controllers.Users, 'index'])
            router.post('/users', [controllers.Users, 'store'])
            router.get('/users/:id', [controllers.Users, 'show'])
            router.put('/users/:id', [controllers.Users, 'update'])
            router.delete('/users/:id', [controllers.Users, 'destroy'])
          })
          .use(middleware.role(['admin']))

        /**
         * Products CRUD (admin only)
         */
        router
          .group(() => {
            router.get('/products', [controllers.Products, 'index'])
            router.post('/products', [controllers.Products, 'store'])
            router.get('/products/:id', [controllers.Products, 'show'])
            router.put('/products/:id', [controllers.Products, 'update'])
            router.delete('/products/:id', [controllers.Products, 'destroy'])
          })
          .use(middleware.role(['admin']))

        /**
         * Clients & transactions
         */
        router.get('/clients', [controllers.Clients, 'index'])
        router.get('/clients/:id', [controllers.Clients, 'show'])

        router.get('/transactions', [controllers.Transactions, 'index'])
        router.get('/transactions/:id', [controllers.Transactions, 'show'])
        router.post('/transactions/:id/refund', [controllers.Transactions, 'refund']).use(
          middleware.role(['admin'])
        )
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1')
