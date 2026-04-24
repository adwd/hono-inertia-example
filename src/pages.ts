import type { ResolvedComponent } from '@inertiajs/react'

const pages = import.meta.glob<{ default: ResolvedComponent }>('../app/pages/**/*.tsx')

export async function resolvePageComponent(name: string) {
  const importer = pages[`../app/pages/${name}.tsx`]

  if (!importer) {
    throw new Error(`Inertia page not found: ${name}`)
  }

  const page = await importer()
  return page.default
}
