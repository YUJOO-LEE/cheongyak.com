import { NextPage } from 'next';
import Link from 'next/link';
import React from 'react';
import Logo from '../components/common/Logo';

const IndexPage: NextPage = function () {
  return (
    <>
      <div id='index'>
        <div className='inner'>
          <h1>
            <Logo></Logo>
            <span>청약닷컴</span>
          </h1>
          <ul>
            <li>
              <Link href='/list?state=EXPECT'>
                <span>청약예정지</span>
              </Link>
            </li>
            <li>
              <Link href='/list?state=COMPLETE'>
                <span>청약완료지</span>
              </Link>
            </li>
          </ul>
          <p>2022 cheongyak.com &copy; All Right Reserved.</p>
        </div>
      </div>
    </>
  );
};

export default IndexPage;