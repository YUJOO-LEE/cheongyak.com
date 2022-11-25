import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { TypeArticleProps } from '../asset/types';
import { RootState } from '../redux';

export default function Article(props: TypeArticleProps) {

  const searchParams = useSearchParams();
  const queries = searchParams.toString();
  const baseUrl = 'https://cheongyak.com/img/house';

  // store 내 필터 리스트 불러오기
  const filterList = useSelector((store: RootState)=> store.filter.data);
  
  return (
    <article>
      <div className='pic'>
        <Link href={`/content/${props.id}?${queries}`}>
          <img src={`${baseUrl}/${props.id}/${props.imageFileName}`} alt={props.subject} />
        </Link>
      </div>
      <div className='txt'>
        <h3>
          {props.subject}
        </h3>
        <div className='tags'>
          <span data-state={props.state}>
            {Array.isArray(filterList) && filterList[0].list[props.state]}
          </span>
          {props.area !== 0 && <span data-area={props.area}>
            {Array.isArray(filterList) && filterList[1].list[props.area]}
          </span>}
          <span data-type={props.type}>
            {Array.isArray(filterList) && filterList[2].list[props.type]}
          </span>
        </div>
      </div>
    </article>
  );
}