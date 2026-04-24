import build from '@hono/vite-build/node'
import devServer, { defaultOptions } from '@hono/vite-dev-server'
import nodeAdapter from '@hono/vite-dev-server/node'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'server') {
    return {
      define: {
        'import.meta.env.VITE_MANIFEST_CONTENT': JSON.stringify(
          readFileSync('./dist/client/.vite/manifest.json', 'utf-8')
        )
      },
      plugins: [
        build({
          entry: './app/server.ts',
          staticRoot: './dist/client',
          staticPaths: ['/assets/*', '/favicon.ico']
        })
      ]
    }
  }

  return {
    appType: 'custom',
    plugins: [
      devServer({
        entry: './app/server.ts',
        adapter: nodeAdapter,
        injectClientScript: false,
        exclude: [...defaultOptions.exclude]
      }),
      react()
    ],
    build: {
      outDir: 'dist/client',
      manifest: true,
      emptyOutDir: true,
      rollupOptions: {
        input: ['/src/client.tsx', '/src/style.css']
      }
    }
  }
})
