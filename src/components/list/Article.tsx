import React from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { TypeArticleProps } from '../../asset/types';
import { RootState } from '../../redux';

export default function Article(props: TypeArticleProps) {

  const router = useRouter();
  const searchParams = useSearchParams();
  const queries = searchParams.toString();
  const baseUrl = `${process.env.NEXT_PUBLIC_IMG_URL}/img/house`;

  // store 내 필터 리스트 불러오기
  const filterList = useSelector((store: RootState)=> store.filter.data);

  const handleClick = () => {
    router.push(`/content/${props.id}?${queries}`);
  }
  
  return (
    <article onClick={handleClick}>
      <div className='pic'>
        <img src={`${baseUrl}/${props.id}/${props.imageFileName}`} alt={props.subject} />
      </div>
      <div className='txt'>
        {props.newContent ? <span className='label'>NEW</span>
        : props.updateContent && <span className='label'>UPDATE</span>}
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