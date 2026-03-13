import { ProductSchema } from '#database/schema'
import { compose } from '@adonisjs/core/helpers'

export default class Product extends compose(ProductSchema) {}

