import { Head } from '@inertiajs/react'
import Layout from './layout'
import { useState } from 'react'

export default function Message({ message }: { message: string }) {
  const [count, setCount] = useState(0)
  return (
    <Layout>
      <Head title="Message" />
      <h1>{message}</h1>
          <p>This is a message page.</p>
          <div>
              <h2>Count: {count}</h2>
              <button onClick={() => setCount(count + 1)}>Increment</button>
          </div>
    </Layout>
  )
}
