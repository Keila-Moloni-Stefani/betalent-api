import { TransactionProductSchema } from '#database/schema'
import { compose } from '@adonisjs/core/helpers'

export default class TransactionProduct extends compose(TransactionProductSchema) {}

