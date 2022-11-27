import Header from './Header';
import Footer from './Footer';
import Filter from './Filter';
import React from 'react';

export default function Layout({type, children}: {type: string, children: any}) {
  return (
    <>
      <Header type={type}></Header>
      <Filter type={type}></Filter>
        {children}
      <Footer></Footer>
    </>
  );
}