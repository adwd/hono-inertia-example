import type { MiddlewareHandler } from 'hono'
import type { Errors, FlashData, Page } from '@inertiajs/core'
import { renderToString } from 'react-dom/server'
import { Link, ReactRefresh, Script, ViteClient } from 'vite-ssr-components/react'
import { renderPage } from './ssr'

type PageProps = Record<string, unknown> & { errors: Errors }
type PageObject = Page & { props: PageProps; flash: FlashData }

declare module 'hono' {
  interface ContextRenderer {
    (component: string, props?: Record<string, unknown>): Response | Promise<Response>
  }
}

function serializePage(page: PageObject) {
  return JSON.stringify(page).replace(/</g, '\\u003c')
}

function HeadAssets() {
  return (
    <>
      <ViteClient />
      <ReactRefresh />
      <Script src="/src/client.tsx" />
      <Link href="/src/style.css" rel="stylesheet" />
    </>
  )
}

function renderClientBody(page: PageObject) {
  return `<script type="application/json" data-page="app">${serializePage(page)}</script><div id="app"></div>`
}

function renderDocument(page: PageObject, ssr?: { head: string[]; body: string }) {
  const head = renderToString(<HeadAssets />) + (ssr?.head ?? []).join('')
  const body = ssr?.body ?? renderClientBody(page)

  return `<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`
}

export function renderer(options: { version?: string | null } = {}): MiddlewareHandler {
  return async function inertiaRenderer(c, next) {
    c.setRenderer(async function renderInertia(component, props = {}) {
      const url = new URL(c.req.url)
      const page: PageObject = {
        component,
        props: {
          errors: {},
          ...props
        },
        url: url.pathname + url.search,
        version: options.version ?? null,
        flash: {},
        rememberedState: {}
      }

      if (c.req.header('X-Inertia')) {
        c.header('X-Inertia', 'true')
        c.header('Vary', 'X-Inertia')
        return c.json(page)
      }

      const ssr = await renderPage(page)

      return c.html(renderDocument(page, ssr))
    })
    await next()
  }
}
