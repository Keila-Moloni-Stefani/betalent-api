import PaymentGatewayService from '#services/payment_gateway_service'
import Transaction from '#models/transaction'
import type { HttpContext } from '@adonisjs/core/http'

export default class TransactionsController {
  async index() {
    return Transaction.all()
  }

  async show({ params, response }: HttpContext) {
    const transaction = await Transaction.find(params.id)
    if (!transaction) {
      return response.notFound({ message: 'Transaction not found' })
    }
    return transaction
  }

  async refund({ params, response }: HttpContext) {
    const transaction = await Transaction.find(params.id)
    if (!transaction || !transaction.externalId) {
      return response.notFound({ message: 'Transaction not found' })
    }

    const gatewayRow = await Transaction.knexQuery()
      .from('gateways')
      .where('id', transaction.gatewayId)
      .first()

    if (!gatewayRow) {
      return response.badRequest({ message: 'Gateway not found for transaction' })
    }

    const service = new PaymentGatewayService()
    const ok = await service.refund(gatewayRow.name, transaction.externalId)

    if (!ok) {
      return response.badRequest({ message: 'Refund failed on gateway' })
    }

    transaction.status = 'refunded'
    await transaction.save()

    return {
      id: transaction.id,
      status: transaction.status,
    }
  }
}

