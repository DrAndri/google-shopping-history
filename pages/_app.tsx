import { ConfigProvider } from 'antd';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <ConfigProvider><Component {...pageProps} /></ConfigProvider>;
}
