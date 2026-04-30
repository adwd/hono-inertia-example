import { renderToString } from 'react-dom/server'
import { Link, ReactRefresh, Script, ViteClient } from 'vite-ssr-components/react'
import { serializePage, type PageObject } from '@hono/inertia'

function Document({ page }: { page: PageObject }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ViteClient />
        <ReactRefresh />
        <Script src="/src/client.tsx" />
        <Link href="/src/style.css" rel="stylesheet" />
      </head>
      <body>
        <script
          type="application/json"
          data-page="app"
          dangerouslySetInnerHTML={{ __html: serializePage(page) }}
        />
        <div id="app" />
      </body>
    </html>
  )
}

export function rootView(page: PageObject) {
  return '<!DOCTYPE html>' + renderToString(<Document page={page} />)
}
