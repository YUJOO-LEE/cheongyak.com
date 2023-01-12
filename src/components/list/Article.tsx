import React from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { TypeArticle } from '../../asset/types';
import { RootState } from '../../redux';

export default function Article({ id,
  subject,
  image,
  state,
  area,
  type,
  newContent,
  updateContent,
  openDate }: TypeArticle) {

  const router = useRouter();
  const searchParams = useSearchParams();
  const queries = searchParams.toString();
  const baseUrl = `${process.env.NEXT_PUBLIC_IMG_URL}/img/house`;

  // store 내 필터 리스트 불러오기
  const filterList = useSelector((store: RootState)=> store.filter.data);

  const handleClick = () => {
    router.push(`/content/${id}?${queries}`);
  }
  
  return (
    <article onClick={handleClick}>
      <div className='pic'>
        <img src={`${baseUrl}/${id}/${image.imageFileName}`} alt={subject} />
        {openDate !== '0.0' && <p>{openDate}</p>}
      </div>
      <div className='txt'>
        {newContent ? <span className='label'>NEW</span>
        : updateContent && <span className='label'>UPDATE</span>}
        <h3>
          {subject}
        </h3>
        {openDate !== '0.0' && <p>{openDate}</p>}
        <div className='tags'>
          <span data-state={state}>
            {Array.isArray(filterList) && filterList[0].list[state]}
          </span>
          {area.id !== 0 && <span data-area={area}>
            {Array.isArray(filterList) && filterList[1].list[area.id]}
          </span>}
          <span data-type={type}>
            {Array.isArray(filterList) && filterList[2].list[type]}
          </span>
        </div>
      </div>
    </article>
  );
}