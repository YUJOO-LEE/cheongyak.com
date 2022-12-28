import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import wrapper from '../redux/index';
import '../scss/style.scss';
import { Provider } from "react-redux";
import { getFilterAsync } from '../redux/filter';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(pageProps);

  // 필터 리스트 dispatch
  useEffect(() => {
    if (!store) return;
    store.dispatch(getFilterAsync.request(''));
  }, [store])
  
  return (
    <Provider store={store}>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>청약닷컴</title>
        <meta charSet='utf-8' />
        <link rel='icon' href='img/favicon.ico' />
        <meta name='theme-color' content='#000000' />
        <meta name='description' content='검단신도시, 운정신도시 청약 정보' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content='청약닷컴' />
        <meta property='og:url' content='cheongyak.com' />
        <meta property='og:description' content='신도시 청약 정보' />
        <meta property='og:image' content='img/metaimg.png' />
      </Head>
      <Component {...props} />
    </Provider>
  )
}

export default MyApp;
