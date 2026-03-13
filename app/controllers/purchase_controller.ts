import Client from '#models/client'
import Product from '#models/product'
import Transaction from '#models/transaction'
import TransactionProduct from '#models/transaction_product'
import Gateway from '#models/gateway'
import PaymentGatewayService from '#services/payment_gateway_service'
import { purchaseValidator } from '#validators/purchase'
import type { HttpContext } from '@adonisjs/core/http'

export default class PurchaseController {
  async store({ request, response }: HttpContext) {
    const {
      clientName,
      clientEmail,
      productId,
      quantity = 1,
      amount,
      cardNumber,
      cvv,
    } = await request.validateUsing(purchaseValidator)

    const client = await Client.firstOrCreate(
      { email: clientEmail },
      { name: clientName, email: clientEmail }
    )

    if (productId) {
      const product = await Product.find(productId)
      if (!product) {
        return response.notFound({ message: 'Product not found' })
      }
      // No nível 1 usamos o amount vindo da API, mas
      // mantemos o relacionamento produto/quantidade.
      await product.refresh()
    }

    const paymentService = new PaymentGatewayService()
    const result = await paymentService.charge({
      amount,
      name: clientName,
      email: clientEmail,
      cardNumber,
      cvv,
    })

    if (!result.success) {
      return response.badRequest({
        message: 'Payment failed on all gateways',
      })
    }

    // Busca o gateway usado pelo nome salvo no serviço
    if (result.gatewayName) {
      const gateway = await Gateway.query().where('name', result.gatewayName).first()

      if (gateway) {
        const transaction = await Transaction.create({
          clientId: client.id,
          gatewayId: gateway.id,
          externalId: result.externalId || null,
          status: 'paid',
          amount,
          cardLastNumbers: result.cardLastNumbers || null,
        })

        if (productId) {
          await TransactionProduct.create({
            transactionId: transaction.id,
            productId,
            quantity,
          })
        }

        return response.created({
          id: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          client: {
            id: client.id,
            name: client.name,
            email: client.email,
          },
          gateway: result.gatewayName,
          externalId: transaction.externalId,
          cardLastNumbers: transaction.cardLastNumbers,
        })
      }
    }

    return response.internalServerError({
      message: 'Payment succeeded on gateway but gateway record was not found',
    })
  }
}

