import Gateway from '#models/gateway'
import type { HttpContext } from '@adonisjs/core/http'

export default class GatewaysController {
  async index() {
    return Gateway.all()
  }

  async toggle({ params, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) {
      return response.notFound({ message: 'Gateway not found' })
    }

    gateway.isActive = !gateway.isActive
    await gateway.save()

    return gateway
  }

  async updatePriority({ params, request, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) {
      return response.notFound({ message: 'Gateway not found' })
    }

    const priority = request.input('priority')
    if (typeof priority !== 'number') {
      return response.badRequest({ message: 'priority must be a number' })
    }

    gateway.priority = priority
    await gateway.save()

    return gateway
  }
}

