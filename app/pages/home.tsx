import { Head } from '@inertiajs/react'
import Layout from './layout'

export default function Home({ message }: { message: string }) {
  return (
    <Layout>
      <Head title="Home" />
      <h1>{message}</h1>
      <p>Try the Posts page to see forms and dynamic routes.</p>
    </Layout>
  )
}
