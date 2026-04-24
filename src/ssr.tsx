import { createInertiaApp } from '@inertiajs/react'
import type { InertiaAppSSRResponse, Page } from '@inertiajs/core'
import { renderToString } from 'react-dom/server'
import { resolvePageComponent } from './pages'

export function renderPage(page: Page): Promise<InertiaAppSSRResponse> {
  return createInertiaApp({
    page,
    render: renderToString,
    resolve: resolvePageComponent,
    setup({ App, props }) {
      return <App {...props} />
    }
  })
}
