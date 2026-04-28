import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import react from '@vitejs/plugin-react'
import { createServer } from 'vite'

let app
let vite

const acceptJson = { Accept: 'application/json' }

before(async () => {
  vite = await createServer({
    appType: 'custom',
    configFile: false,
    plugins: [react()],
    server: {
      middlewareMode: true
    }
  })

  const mod = await vite.ssrLoadModule('/app/server.ts')
  app = mod.default
})

after(async () => {
  await vite?.close()
})

test('posts can be viewed, created, and viewed again as JSON', async () => {
  const indexRes = await app.request('/posts', {
    headers: acceptJson
  })
  assert.equal(indexRes.status, 200)
  assert.match(indexRes.headers.get('content-type') ?? '', /^application\/json/)
  assert.equal(indexRes.headers.get('vary'), 'Accept, X-Inertia')

  const indexBody = await indexRes.json()
  assert.deepEqual(indexBody, {
    posts: [
      {
        id: 1,
        title: 'Hello, Hono',
        body: 'Hono is a small, fast web framework.'
      },
      {
        id: 2,
        title: 'Inertia on the Edge',
        body: 'SPA feel without the API boilerplate.'
      }
    ]
  })

  const createRes = await app.request('/posts', {
    method: 'POST',
    headers: {
      ...acceptJson,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Plain REST Props',
      body: 'Only props are returned for JSON GET.'
    })
  })
  assert.equal(createRes.status, 201)
  assert.equal(createRes.headers.get('location'), '/posts/3')
  assert.deepEqual(await createRes.json(), {
    post: {
      id: 3,
      title: 'Plain REST Props',
      body: 'Only props are returned for JSON GET.'
    }
  })

  const showRes = await app.request('/posts/3', {
    headers: acceptJson
  })
  assert.equal(showRes.status, 200)
  assert.deepEqual(await showRes.json(), {
    post: {
      id: 3,
      title: 'Plain REST Props',
      body: 'Only props are returned for JSON GET.'
    }
  })

  const updatedIndexRes = await app.request('/posts', {
    headers: acceptJson
  })
  assert.equal(updatedIndexRes.status, 200)

  const updatedIndexBody = await updatedIndexRes.json()
  assert.equal(updatedIndexBody.posts.length, 3)
  assert.deepEqual(updatedIndexBody.posts[2], {
    id: 3,
    title: 'Plain REST Props',
    body: 'Only props are returned for JSON GET.'
  })
})

test('JSON post validation errors return a JSON error payload', async () => {
  const res = await app.request('/posts', {
    method: 'POST',
    headers: {
      ...acceptJson,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: '',
      body: ''
    })
  })

  assert.equal(res.status, 422)
  assert.deepEqual(await res.json(), {
    errors: {
      title: 'Title is required',
      body: 'Body is required'
    }
  })
})

test('JSON not found responses use a REST-style error payload', async () => {
  const res = await app.request('/posts/999', {
    headers: acceptJson
  })

  assert.equal(res.status, 404)
  assert.match(res.headers.get('content-type') ?? '', /^application\/json/)
  assert.deepEqual(await res.json(), {
    error: {
      code: 'not_found',
      message: 'Not Found'
    }
  })
})

test('Inertia requests still receive an Inertia page object', async () => {
  const res = await app.request('/posts', {
    headers: {
      ...acceptJson,
      'X-Inertia': 'true'
    }
  })

  assert.equal(res.status, 200)
  assert.equal(res.headers.get('x-inertia'), 'true')
  assert.match(res.headers.get('vary') ?? '', /X-Inertia/)

  const body = await res.json()
  assert.equal(body.component, 'posts/index')
  assert.equal(body.url, '/posts')
  assert.ok(Array.isArray(body.props.posts))
  assert.equal(body.posts, undefined)
})

test('plain browser requests still receive HTML', async () => {
  const res = await app.request('/posts')
  assert.equal(res.status, 200)
  assert.match(res.headers.get('content-type') ?? '', /^text\/html/)

  const body = await res.text()
  assert.match(body, /^<!DOCTYPE html>/)
  assert.match(body, /<html>/)
})

test('OpenAPI spec describes the JSON posts API', async () => {
  const res = await app.request('/openapi.json')
  assert.equal(res.status, 200)
  assert.match(res.headers.get('content-type') ?? '', /^application\/json/)

  const spec = await res.json()
  assert.equal(spec.openapi, '3.1.0')
  assert.equal(spec.info.title, 'Hono Inertia Example API')

  assert.ok(spec.paths['/posts'])
  assert.ok(spec.paths['/posts'].get)
  assert.ok(spec.paths['/posts'].post)
  assert.ok(spec.paths['/posts/{id}'])
  assert.ok(spec.paths['/posts/{id}'].get)
  assert.equal(spec.paths['/posts/new'], undefined)

  assert.ok(spec.paths['/posts'].get.responses['200'].content['application/json'])
  assert.ok(spec.paths['/posts'].post.requestBody.content['application/json'])
  assert.ok(spec.paths['/posts'].post.responses['201'].content['application/json'])
  assert.ok(spec.paths['/posts/{id}'].get.responses['404'].content['application/json'])
})
