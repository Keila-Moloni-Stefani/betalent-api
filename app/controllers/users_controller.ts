import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index() {
    return User.all()
  }

  async store({ request, response }: HttpContext) {
    const fullName = request.input('fullName')
    const email = request.input('email')
    const password = request.input('password')
    const role = request.input('role', 'user')

    if (!email || !password) {
      return response.badRequest({ message: 'email and password are required' })
    }

    const user = await User.create({ fullName, email, password, role })
    return response.created(user)
  }

  async show({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    return user
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    const fullName = request.input('fullName')
    const role = request.input('role')

    if (fullName !== undefined) user.fullName = fullName
    if (role !== undefined) user.role = role

    await user.save()
    return user
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    await user.delete()
    return response.noContent()
  }
}

