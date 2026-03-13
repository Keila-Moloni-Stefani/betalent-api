import Client from '#models/client'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientsController {
  async index() {
    return Client.all()
  }

  async show({ params, response }: HttpContext) {
    const client = await Client.find(params.id)
    if (!client) {
      return response.notFound({ message: 'Client not found' })
    }

    const transactions = await Client.knexQuery()
      .from('transactions')
      .where('client_id', client.id)

    return {
      client,
      transactions,
    }
  }
}

