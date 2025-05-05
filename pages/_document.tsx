import React from 'react';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import { GoogleAnalytics } from '@next/third-parties/google';
import type { DocumentContext } from 'next/document';

const GOOGLE_TAG = process.env.NEXT_PUBLIC_GOOGLE_TAG;

const MyDocument = () => (
  <Html lang="is">
    <Head />
    <body>
      <Main />
      <NextScript />
    </body>
    {GOOGLE_TAG && <GoogleAnalytics gaId={GOOGLE_TAG} />}
  </Html>
);

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const cache = createCache();
  const originalRenderPage = ctx.renderPage;
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => (
        <StyleProvider cache={cache}>
          <App {...props} />
        </StyleProvider>
      )
    });

  const initialProps = await Document.getInitialProps(ctx);
  const style = extractStyle(cache, true);
  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        <style dangerouslySetInnerHTML={{ __html: style }} />
      </>
    )
  };
};

export default MyDocument;
