import { Html, Head, Main, NextScript } from 'next/document'
import { GTMScript, GTMNoScript } from '../components/Gtm';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <GTMScript />
      </Head>
      <body>
        <GTMNoScript />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
