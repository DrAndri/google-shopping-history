import { ConfigProvider } from 'antd';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { GoogleAnalytics } from '@next/third-parties/google';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ConfigProvider>
        <Component {...pageProps} />
      </ConfigProvider>
      <GoogleAnalytics gaId="G-DNB7LS6RGC" />
    </>
  );
}
