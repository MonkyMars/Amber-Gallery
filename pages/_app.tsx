import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '../utils/ThemeContext';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SpeedInsights />
      <Analytics />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
