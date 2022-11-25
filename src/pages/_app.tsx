import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import wrapper from '../redux/index';
import '../scss/style.scss';
import { Provider } from "react-redux";
import { getFilterAsync } from '../redux/filter';

function MyApp({ Component, pageProps }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(pageProps);

  // 필터 리스트 dispatch
  useEffect(() => {
    if (!store) return;
    store.dispatch(getFilterAsync.request(''));
  }, [store])
  
  return (
    <Provider store={store}>
      <Component {...props} />
    </Provider>
  )
}

export default MyApp;
