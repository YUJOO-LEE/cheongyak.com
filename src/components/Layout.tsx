import Header from './Header';
import Footer from './Footer';
import Filter from './Filter';
import React from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Layout({type, children}: {type: string, children: React.ReactElement}) {
  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <link rel='icon' href={`/favicon.ico`} />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content='#000000' />
        <meta
          name='description'
          content='검단신도시, 운정신도시 청약 정보'
        />
        <title>청약닷컴</title>
      </Head>
      <Script src='https://kit.fontawesome.com/08c501c945.js' crossOrigin='anonymous'></Script>
      <Header type={type}></Header>
      <Filter type={type}></Filter>
      {children}
      <Footer></Footer>
    </>
  );
}