import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductsController {
  async index() {
    return Product.all()
  }

  async store({ request, response }: HttpContext) {
    const name = request.input('name')
    const amount = request.input('amount')

    if (!name || typeof amount !== 'number') {
      return response.badRequest({ message: 'name and amount are required' })
    }

    const product = await Product.create({ name, amount })
    return response.created(product)
  }

  async show({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.notFound({ message: 'Product not found' })
    }
    return product
  }

  async update({ params, request, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.notFound({ message: 'Product not found' })
    }

    const name = request.input('name')
    const amount = request.input('amount')

    if (name !== undefined) product.name = name
    if (amount !== undefined) product.amount = amount

    await product.save()
    return product
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.notFound({ message: 'Product not found' })
    }

    await product.delete()
    return response.noContent()
  }
}

