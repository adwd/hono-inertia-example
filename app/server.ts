import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { renderer } from '../src/renderer'

type Post = { id: number; title: string; body: string }

const posts: Post[] = [
  { id: 1, title: 'Hello, Hono', body: 'Hono is a small, fast web framework.' },
  { id: 2, title: 'Inertia on the Edge', body: 'SPA feel without the API boilerplate.' }
]
let nextId = 3

const required = (message: string) =>
  z.preprocess((v) => (typeof v === 'string' ? v : ''), z.string().trim().min(1, message))

const postSchema = z.object({
  title: required('Title is required'),
  body: required('Body is required')
})

const app = new Hono()

app.use(renderer())

app.get('/', (c) => c.render('home', { message: 'Hono × Inertia' }))
app.get('/about', (c) => c.render('about', { title: 'About' }))

app.get('/posts', (c) => c.render('posts/index', { posts }))
app.get('/posts/new', (c) => c.render('posts/new'))

app.post(
  '/posts',
  zValidator('json', postSchema, (result, c) => {
    if (result.success) {
      return
    }
    const errors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !errors[key]) errors[key] = issue.message
    }
    c.status(422)
    return c.render('posts/new', { errors })
  }),
  (c) => {
    const { title, body } = c.req.valid('json')
    const post = { id: nextId++, title, body }
    posts.push(post)
    return c.redirect(`/posts/${post.id}`, 303)
  }
)

app.get('/posts/:id', (c) => {
  const id = Number(c.req.param('id'))
  const post = posts.find((p) => p.id === id)
  if (!post) {
    return c.notFound()
  }
  return c.render('posts/show', { post })
})

app.get('/message', (c) => c.render('message', { message: 'Hello, World!' }))
  
app.notFound((c) => {
  return c.render('common/not-found')
})

export default app
