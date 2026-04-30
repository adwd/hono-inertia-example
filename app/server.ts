import { Hono, type NotFoundResponse } from 'hono'
import { inertia } from '@hono/inertia'
import { openAPIRouteHandler } from 'hono-openapi'
import { postsApp } from './posts'
import { rootView } from './root-view'

const app = new Hono()

app.use(inertia({ rootView }))

app.get('/', (c) => c.render('home', { message: 'Hono × Inertia' }))
app.get('/about', (c) => c.render('about', { title: 'About' }))

app.route('/posts', postsApp)

app.get('/message', (c) => c.render('message', { message: 'Hello, World!' }))

app.get(
  '/openapi.json',
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: 'Hono Inertia Example API',
        version: '1.0.0',
        description: 'JSON API endpoints exposed by the Hono Inertia example.'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local development server'
        }
      ]
    }
  })
)

app.notFound((c) => {
  c.status(404)
  return c.render('common/not-found', {
    error: {
      code: 'not_found',
      message: 'Not Found'
    }
  }) as unknown as NotFoundResponse
})

export default app
