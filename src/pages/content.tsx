/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

import Layout from '../components/Layout';
//import Map from '../common/Map';
import ContentPicture from '../components/ContentPicture';
import ContentTable from '../components/ContentTable';
import Scroll from '../asset/scroll';
import { getContentAsync } from '../redux/content';

export default function Content() {

  const dispatch = useDispatch();
  const SearchParams = useSearchParams();
  const ContentData = useSelector((store:any)=> store.content.data);
  const FilterList = useSelector((store:any)=> store.filter.data);


  const [ TabIndex, setTabIndex ] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const position = useRef<number[]>([]);
  const [ curY, setCurY ] = useState(0);
  
  const baseUrl = 'https://cheongyak.com/img/house';
  const tabMenus = ['정보', '결과', '사진', '위치'];
  const paramsValue = SearchParams.get('id') || '';
  const paramsId = parseInt(paramsValue);

  const getMenus = () => {
    if (!frame.current) return;

    position.current = [];
    const menus = frame.current.querySelectorAll<HTMLElement>('.tabBody>div');
    for (const li of menus) {
      position.current.push(li.offsetTop - 50);
    }
    activation();
  };

  const activation = ()=>{
    const scroll = window.scrollY || window.pageYOffset;
    setCurY(scroll);
  }

  useEffect(() => {
    dispatch(getContentAsync.request({id: paramsId}));
    
    return(()=>{
      window.removeEventListener('resize', getMenus);
      window.removeEventListener('scroll', getMenus);
    });
  }, [paramsId])

  useEffect(()=>{
    if (!FilterList || !frame) return;
    getMenus();

    window.addEventListener('resize', getMenus);
    window.addEventListener('scroll', getMenus);

  }, [FilterList, frame])
  
  return ( <Layout type='content'>
    {(ContentData.id && FilterList.length) &&
    <div id='content' ref={frame}>
      <figure
        style={{backgroundImage: `url(${baseUrl}/${ContentData.id}/${ContentData.images[0].imageFileName})`}}
      >
        <div className='txt'>
          <div className='date'>
            {ContentData.gonggoDate}-{ContentData.announcementDate} {FilterList[0].list[ContentData.state]}
          </div>
          <h1>{ContentData.subject}</h1>
          <div className='tags'>
            <span>#{FilterList[1].list[ContentData.area.id]}</span>
            <span>#{FilterList[2].list[ContentData.type]}</span>
          </div>
        </div>
      </figure>
      
      <div className={`inner 
        ${curY >= position.current[0] ? 'menuOn' : undefined}`}
      >
        <ul
          className='tabMenu'>
          {tabMenus.map((menu, i)=>{
            if (i === 1 && ContentData.state !== 'COMPLETE') return <></>;
            return (
              <li key={i} 
                className={TabIndex === i ? 'on' : undefined}
                onClick={()=>{setTabIndex(i); Scroll(position.current[i]);}}
              >{menu}</li>
            );
          })}
        </ul>
        <div className='tabBody'>
          <div>
            <ContentTable data={ContentData}></ContentTable>
          </div>
          <div className='gallery'>
            {ContentData.state === 'COMPLETE' && 
              <div className='inner'>
              <ContentPicture />
              </div>
            }
          </div>
          <div className='gallery'>
            <div className='inner'>
            {ContentData.images.map((data: {id: number, imageFileName: string})=>{
              return(
                <div key={data.id}>
                  <ContentPicture>
                    <img src={`${baseUrl}/${ContentData.id}/${data.imageFileName}`} alt={ContentData.subject} />
                  </ContentPicture>
                </div>
              );
            })}
            </div>
          </div>
          <div>
            {/* <Map latLng={ContentData.latLng} naver={naver}></Map> */}
          </div>
        </div>
      </div>
    </div>
    }
  </Layout>);
}