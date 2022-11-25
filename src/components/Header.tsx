import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { useSearchParams } from 'next/navigation';
import { TypeQueries } from '../asset/types';

export default function Header({type}: {type: string}) {

  const searchParams = useSearchParams();

  // 사용할 쿼리스트링 값 지정
  const queries: TypeQueries = {
    state: searchParams.get('state') || '',
    area: searchParams.get('area') || '',
    type: searchParams.get('type') || ''
  }

  return (
    <header className={`type-${type}`}>
      <div className='inner'>
        {type === 'content' && (
          <Link href={{
            pathname: '/list',
            query: { ...queries},
          }}>
          <p className='goBack'>List</p>
          </Link>
        )}
        <h1>
          <Link href='/'>
            <Logo></Logo>
            <span>청약닷컴</span>
          </Link>
        </h1>
      </div>
    </header>
  );
}