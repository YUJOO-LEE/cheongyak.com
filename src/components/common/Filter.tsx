import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { RootState } from "../../redux";
import { useSelector } from 'react-redux';
import { TypeFilter, TypeQueries } from '../../asset/types';

export default function Filter({ type }: { type: string }) {

  const searchParams = useSearchParams();
  const [ showFilter, setShowFilter ] = useState(false);
  const [ param, setParam ] = useState(type);

  // store 내 필터 리스트 불러오기
  const filterList = useSelector((store: RootState)=> store.filter.data);

  // 사용할 쿼리스트링 값 지정
  const queries: TypeQueries = {
    state: searchParams.get('state') || '',
    area: searchParams.get('area') || '',
    type: searchParams.get('type') || ''
  }

  // list 페이지 pc 화면에서 filter 리스트 노출 
  useEffect(() => {
    if (param === 'list' && window.innerWidth >= 1180) setShowFilter(true);
    setParam(type);
  }, [param, type])

  return (
    <>
      <i className={`btnShowFilter ${showFilter ? 'on' : null}`} onClick={()=>setShowFilter(!showFilter)}></i>
      <div id='filter' className={showFilter ? 'on' : undefined}>
        <div className='inner'>
          <ul>
            {Array.isArray(filterList) && filterList.map((filter: TypeFilter, i: number)=>{
              return (
                <li key={i}>
                  <span>{filter.name}</span>
                  <ul>
                    {filter && Object.keys(filter.list).map((sub: string)=>{
                      return (
                        <li key={sub}><Link 
                          href={{
                            pathname: '/list',
                            query: { ...queries, [filter.key]: queries[filter.key] === sub ? '' : sub },
                          }}
                          className={queries[filter.key] === sub + '' ? 'on' : undefined}>{filter.list[sub]}</Link></li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
          <Link //onClick={handleReset} 
            className='btnResetFilter' href='/list'>초기화</Link>
        </div>
      </div>
    </>
  );
}