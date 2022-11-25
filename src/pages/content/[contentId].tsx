/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

import Layout from '../../components/Layout';
import Map from '../../components/Map';
import ContentPicture from '../../components/ContentPicture';
import ContentTable from '../../components/ContentTable';
import Popup, { TypeHandle } from '../../components/Popup';
import Scroll from '../../asset/scroll';
import { RootState } from '../../redux';
import { getContentAsync } from '../../redux/content';
import { TypeImages } from '../../asset/types';

export default function Content() {

  const dispatch = useDispatch();
  const router = useRouter();
  const ContentData = useSelector((store: RootState)=> store.content.data);
  const FilterList = useSelector((store: RootState)=> store.filter.data);


  const [ TabIndex, setTabIndex ] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const position = useRef<number[]>([]);
  const pop = useRef<TypeHandle>(null);
  const [ curY, setCurY ] = useState<number>(0);
  
  const baseUrl = 'https://cheongyak.com/img/house';
  const tabMenus = ['정보', '결과', '사진', '위치'];
  const paramsId = parseInt(router.query.contentId as string);

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
    if (!paramsId) return;
    dispatch(getContentAsync.request({id: paramsId}));

    if (!FilterList || !frame.current) return;
    getMenus();

    window.addEventListener('resize', getMenus);
    window.addEventListener('scroll', getMenus);
    
    return(()=>{
      window.removeEventListener('resize', getMenus);
      window.removeEventListener('scroll', getMenus);
    });
  }, [paramsId, FilterList, frame.current])
  
  return ( <Layout type='content'>
    {(ContentData.id && Array.isArray(FilterList) && FilterList.length) &&
    <>
      <div id='content' ref={frame}>
        <figure
          style={{backgroundImage: `url(${baseUrl}/${ContentData.id}/${ContentData.images?.[0].imageFileName})`}}
        >
          <div className='txt'>
            <div className='date'>
              {ContentData.gonggoDate}-{ContentData.announcementDate} 
              {ContentData.state && FilterList[0].list[ContentData.state]}
            </div>
            <h1>{ContentData.subject}</h1>
            <div className='tags'>
              {(ContentData.area && ContentData.area.id !== 0) && (
                <span>#{FilterList[1].list[ContentData.area.id]}</span>
              )}
              <span>#{ContentData.type && FilterList[2].list[ContentData.type]}</span>
            </div>
          </div>
        </figure>
        
        <div className={`inner 
          ${curY >= position.current[0] ? 'menuOn' : undefined}`}
        >
          <ul
            className='tabMenu'>
            {tabMenus.filter((_, i) => {
              if (i === 1 && ContentData.state !== 'COMPLETE') return false;
              if (i === 3 && !ContentData.latlng) return false;
              return true;
            }).map((menu, i)=>{
              // if (i === 1 && ContentData.state !== 'COMPLETE') return <Fragment key={`tabMenu${i}`}></Fragment>;
              // if (i === 3 && !ContentData.latLng) return <Fragment key={`tabMenu${i}`}></Fragment>;

              return (
                <li key={`tabMenu${i}`} 
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
              {ContentData.images?.map((data: TypeImages, idx: number)=>{
                return (
                  <ContentPicture key={`images${data.id}`}>
                    <img src={`${baseUrl}/${ContentData.id}/${data.imageFileName}`} 
                      alt={ContentData.subject} 
                      onClick={()=>{
                        pop.current?.setImgIndex(idx);
                        pop.current?.setOpen(true);
                      }}
                    />
                  </ContentPicture>
                );
              })}
              </div>
            </div>
            {ContentData.latlng && (
              <div>
                <Map
                  // 테스트용 latLng='37.5208062,127.0227158' 
                  latLng={ContentData.latlng}
                ></Map>
              </div>
            )}
          </div>
        </div>
      </div>
      <Popup ref={pop}></Popup>
    </>
    }
  </Layout>);
}