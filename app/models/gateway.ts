import { GatewaySchema } from '#database/schema'
import { compose } from '@adonisjs/core/helpers'

export default class Gateway extends compose(GatewaySchema) {}

