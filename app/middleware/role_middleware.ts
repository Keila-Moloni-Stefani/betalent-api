import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, roles: string[] = []) {
    const user = ctx.auth.getUserOrFail()

    if (roles.length > 0 && !roles.includes(user.role)) {
      return ctx.response.forbidden({
        message: 'You are not allowed to perform this action',
      })
    }

    return next()
  }
}

