// import { useRef } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import React from 'react';
import { TypeArticleProps } from '../asset/types';

export default function Article(props: TypeArticleProps) {

  const baseUrl = 'https://cheongyak.com/img/house';
  const filterList = useSelector((store: any)=> store.filter.data);
  
  return (
    <article>
      <div className='pic'>
        <Link href={`/content/${props.id}`}>
          <img src={`${baseUrl}/${props.id}/${props.imageFileName}`} alt={props.subject} />
        </Link>
      </div>
      <div className='txt'>
        <h3>
          {props.subject}
        </h3>
        <div className='tags'>
          <span data-state={props.state}>
            {filterList && filterList[0].list[props.state]}
          </span>
          {props.area !== 0 && <span data-area={props.area}>
            {filterList && filterList[1].list[props.area]}
          </span>}
          <span data-type={props.type}>
            {filterList && filterList[2].list[props.type]}
          </span>
        </div>
      </div>
    </article>
  );
}