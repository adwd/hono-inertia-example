import { Head } from '@inertiajs/react'
import Layout from '../Layout'

export default function NotFound() {
  return (
    <Layout>
      <Head title="Not Found" />
      <h1>Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </Layout>
  )
}
