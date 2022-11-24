import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { RootState } from "../../redux";
import { getFilterAsync } from '../../redux/filter';
import { useDispatch, useSelector } from 'react-redux';
import { TypeFilter, TypeQueries } from '../../asset/types';

export default function Filter(props: { type: string; }) {

  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [ showFilter, setShowFilter ] = useState(false);
  const [ param, setParam ] = useState(props.type);

  const filterList = useSelector((store: RootState)=> store.filter.data);

  const queries: TypeQueries = {
    state: searchParams.get('state') || '',
    area: searchParams.get('area') || '',
    type: searchParams.get('type') || ''
  }

  useEffect(() => {
    dispatch(getFilterAsync.request(''));
  }, [dispatch])

  useEffect(() => {
    if (param === 'list' && window.innerWidth >= 1180) setShowFilter(true);
    setParam(props.type);
  }, [param, props.type])

  const handleFilter = () => {
    !showFilter ? setShowFilter(true) : setShowFilter(false) ;
  }

  return (
    <>
      <i className={`btnShowFilter ${showFilter ? 'on' : null}`} onClick={handleFilter}></i>
      <div id='filter' className={showFilter ? 'on' : undefined}>
        <div className='inner'>
          <ul>
            {filterList && filterList.map((filter: TypeFilter, i: number)=>{
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