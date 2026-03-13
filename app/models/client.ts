import { ClientSchema } from '#database/schema'
import { compose } from '@adonisjs/core/helpers'

export default class Client extends compose(ClientSchema) {}

