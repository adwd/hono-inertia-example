import { Head } from '@inertiajs/react'
import Layout from './layout'

export default function About({ title }: { title: string }) {
  return (
    <Layout>
      <Head title="About" />
      <h1>{title}</h1>
      <p>Hono + Inertia.js on Node.js!</p>
    </Layout>
  )
}
