import { Hono } from 'hono'
import { describeRoute, resolver, validator as zValidator } from 'hono-openapi'
import { z } from 'zod'

type Post = { id: number; title: string; body: string }

const posts: Post[] = [
  { id: 1, title: 'Hello, Hono', body: 'Hono is a small, fast web framework.' },
  { id: 2, title: 'Inertia on the Edge', body: 'SPA feel without the API boilerplate.' }
]
let nextId = 3

function required(message: string) {
  return z.preprocess((v) => (typeof v === 'string' ? v : ''), z.string().trim().min(1, message))
}

const postSchema = z.object({
  title: required('Title is required'),
  body: required('Body is required')
})

const postResponseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  body: z.string()
})

const postsResponseSchema = z.object({
  posts: z.array(postResponseSchema)
})

const postDetailResponseSchema = z.object({
  post: postResponseSchema
})

const validationErrorResponseSchema = z.object({
  errors: z.record(z.string(), z.string())
})

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string()
  })
})

const jsonApiHeader = {
  name: 'Accept',
  in: 'header',
  required: true,
  description: 'Set to application/json to receive JSON API responses.',
  schema: {
    type: 'string',
    example: 'application/json'
  }
} as const

const postIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Post ID.',
  schema: {
    type: 'integer',
    minimum: 1
  }
} as const

function acceptsJson(accept?: string) {
  return accept?.includes('application/json') ?? false
}

function validationErrors(issues: readonly { message: string; path?: readonly unknown[] }[]) {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const segment = issue.path?.[0]
    const key =
      segment && typeof segment === 'object' && 'key' in segment
        ? (segment.key as unknown)
        : segment
    if (typeof key === 'string' && !errors[key]) errors[key] = issue.message
  }
  return errors
}

export const postsApp = new Hono()

postsApp.get(
  '/',
  describeRoute({
    tags: ['Posts'],
    operationId: 'listPosts',
    summary: 'List posts',
    description: 'Returns the posts collection as JSON when requested as an API.',
    parameters: [jsonApiHeader],
    responses: {
      200: {
        description: 'Posts collection.',
        content: {
          'application/json': {
            schema: resolver(postsResponseSchema)
          }
        }
      }
    }
  }),
  (c) => c.render('posts/index', { posts })
)
postsApp.get('/new', (c) => c.render('posts/new'))

postsApp.post(
  '/',
  describeRoute({
    tags: ['Posts'],
    operationId: 'createPost',
    summary: 'Create a post',
    description:
      'Creates a post from a JSON request body. JSON API clients receive the created post.',
    parameters: [jsonApiHeader],
    responses: {
      201: {
        description: 'Post created.',
        headers: {
          Location: {
            description: 'URL of the created post.',
            schema: {
              type: 'string'
            }
          }
        },
        content: {
          'application/json': {
            schema: resolver(postDetailResponseSchema)
          }
        }
      },
      422: {
        description: 'Validation failed.',
        content: {
          'application/json': {
            schema: resolver(validationErrorResponseSchema)
          }
        }
      }
    }
  }),
  zValidator('json', postSchema, (result, c) => {
    if (result.success) {
      return
    }
    const errors = validationErrors(result.error)
    if (acceptsJson(c.req.header('Accept'))) {
      return c.json({ errors }, 422)
    }
    c.status(422)
    return c.render('posts/new', { errors })
  }),
  (c) => {
    const { title, body } = c.req.valid('json')
    const post = { id: nextId++, title, body }
    posts.push(post)
    if (acceptsJson(c.req.header('Accept'))) {
      c.header('Location', `/posts/${post.id}`)
      return c.json({ post }, 201)
    }
    return c.redirect(`/posts/${post.id}`, 303)
  }
)

postsApp.get(
  '/:id',
  describeRoute({
    tags: ['Posts'],
    operationId: 'showPost',
    summary: 'Show a post',
    description: 'Returns a single post as JSON when requested as an API.',
    parameters: [jsonApiHeader, postIdParam],
    responses: {
      200: {
        description: 'Post detail.',
        content: {
          'application/json': {
            schema: resolver(postDetailResponseSchema)
          }
        }
      },
      404: {
        description: 'Post was not found.',
        content: {
          'application/json': {
            schema: resolver(errorResponseSchema)
          }
        }
      }
    }
  }),
  (c) => {
    const id = Number(c.req.param('id'))
    const post = posts.find((p) => p.id === id)
    if (!post) {
      return c.notFound()
    }
    return c.render('posts/show', { post })
  }
)
