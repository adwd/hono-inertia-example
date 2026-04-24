import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import { resolvePageComponent } from './pages'

createInertiaApp({
  resolve: resolvePageComponent satisfies (name: string) => Promise<ResolvedComponent>
})
