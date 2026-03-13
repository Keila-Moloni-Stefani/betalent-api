import Gateway from '#models/gateway'

type ChargePayload = {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export type ChargeResult = {
  success: boolean
  gatewayName?: string
  externalId?: string
  cardLastNumbers?: string
  rawResponse?: unknown
}

export default class PaymentGatewayService {
  private gateway1Url = process.env.GATEWAY1_URL || 'http://localhost:3001'
  private gateway2Url = process.env.GATEWAY2_URL || 'http://localhost:3002'
  private fakeSuccess = process.env.GATEWAYS_FAKE_SUCCESS === 'true'

  async charge(payload: ChargePayload): Promise<ChargeResult> {
    const gateways = await Gateway.query().where('isActive', true).orderBy('priority', 'asc')

    if (this.fakeSuccess && gateways.length > 0) {
      const first = gateways[0]
      return {
        success: true,
        gatewayName: first.name,
        externalId: 'fake-external-id',
        cardLastNumbers: payload.cardNumber.slice(-4),
        rawResponse: { fake: true },
      }
    }

    for (const gateway of gateways) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.chargeOnGateway(gateway.name, payload)
      if (result.success) {
        return {
          ...result,
          gatewayName: gateway.name,
        }
      }
    }

    return { success: false }
  }

  async refund(gatewayName: string, externalId: string): Promise<boolean> {
    try {
      if (gatewayName === 'gateway1') {
        const response = await fetch(`${this.gateway1Url}/transactions/${externalId}/charge_back`, {
          method: 'POST',
        })
        return response.ok
      }

      if (gatewayName === 'gateway2') {
        const response = await fetch(`${this.gateway2Url}/transacoes/reembolso`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: externalId }),
        })
        return response.ok
      }
    } catch {
      return false
    }

    return false
  }

  private async chargeOnGateway(
    gatewayName: string,
    { amount, name, email, cardNumber, cvv }: ChargePayload
  ): Promise<ChargeResult> {
    try {
      if (gatewayName === 'gateway1') {
        const response = await fetch(`${this.gateway1Url}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            name,
            email,
            cardNumber,
            cvv,
          }),
        })

        if (!response.ok) return { success: false }

        const data = (await response.json()) as { id: string }
        return {
          success: true,
          externalId: data.id,
          cardLastNumbers: cardNumber.slice(-4),
          rawResponse: data,
        }
      }

      if (gatewayName === 'gateway2') {
        const response = await fetch(`${this.gateway2Url}/transacoes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            valor: amount,
            nome: name,
            email,
            numeroCartao: cardNumber,
            cvv,
          }),
        })

        if (!response.ok) return { success: false }

        const data = (await response.json()) as { id: string }
        return {
          success: true,
          externalId: data.id,
          cardLastNumbers: cardNumber.slice(-4),
          rawResponse: data,
        }
      }
    } catch {
      return { success: false }
    }

    return { success: false }
  }
}

