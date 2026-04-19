import {ApiError } from '../utils/erros.js'

export function rateLimitMiddleware(bindingName) {
    return async (c, next) => {
        const limiter = c.env[bindingName]

        if (!limiter) {
            await next()
            return
        }

        let key
        try {
            const body = await c.req.json()
            key = body?.email ?? c.req.header('cf-connecting-ip') ?? 'anonymous'
            c.req.bodyCache = body
        } catch {
            key = c.req.header('cf-connecting-ip') ?? 'anonymous'
        }

        const { success } = await limiter.limit({key})

        if (!success) {
            throw new ApiError(
                429,
                'TOO_MANY_REQUESTS',
                'Too many requests, please try again later.',
            )
        }

        await next()

    }
}