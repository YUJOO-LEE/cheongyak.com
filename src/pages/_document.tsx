import React from 'react';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="ko" translate="no">
        <Head>
          <meta charSet='utf-8' />
          <link rel='icon' href='img/favicon.ico' />
          <meta name='theme-color' content='#000000' />
          <meta
            name='description'
            content='검단신도시, 운정신도시 청약 정보'
          />
          <meta property='og:type' content='website' />
          <meta property='og:title' content='청약닷컴' />
          <meta property='og:url' content='cheongyak.com' />
          <meta property='og:description' content='신도시 청약 정보' />
          <meta property='og:image' content='img/metaimg.png' />
          <script src='https://kit.fontawesome.com/08c501c945.js' crossOrigin='anonymous'></script>
          <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=0f018f7ff64a71f0976e2448a4ec8cea&autoload=false"></script>

          <body>
            <Main />
            <NextScript />
          </body>
        </Head>
      </Html>
    );
  }
}

