import { TransactionSchema } from '#database/schema'
import { compose } from '@adonisjs/core/helpers'

export default class Transaction extends compose(TransactionSchema) {}

