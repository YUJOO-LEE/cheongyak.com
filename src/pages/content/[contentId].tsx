/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

import Layout from '../../components/common/Layout';
import Map from '../../components/content/Map';
import ContentPicture from '../../components/content/ContentPicture';
import ContentTable from '../../components/content/ContentTable';
import Popup, { TypeHandle } from '../../components/content/Popup';
import Scroll from '../../asset/scroll';
import { RootState } from '../../redux';
import { getContentAsync } from '../../redux/content';
import { TypeImages } from '../../asset/types';
import Youtube from '../../components/content/Youtube';
import Link from 'next/link';

export default function Content() {

  const dispatch = useDispatch();
  const router = useRouter();
  const frame = useRef<HTMLDivElement>(null);
  const position = useRef<number[]>([]);
  const pop = useRef<TypeHandle>(null);
  const [ TabIndex, setTabIndex ] = useState<number>(0);  // 선택한 메뉴
  const [ curY, setCurY ] = useState<number>(0);

  const baseUrl = `${process.env.NEXT_PUBLIC_IMG_URL}/img/house`;
  const tabMenus = ['정보', '결과', '사진', '위치'];  // 메뉴명
  const contentId = parseInt(router.query.contentId as string);

  // store 내 컨텐츠, 필터 리스트 불러오기
  const ContentData = useSelector((store: RootState)=> store.content.data);
  const FilterList = useSelector((store: RootState)=> store.filter.data);

  // 컨텐츠 별 섹션 위치값 저장
  const getMenus = () => {
    if (!frame.current) return;

    position.current = [];
    const menus = frame.current.querySelectorAll<HTMLElement>('.tabBody>div');
    for (const li of menus) {
      position.current.push(li.offsetTop - 50);
    }
    activation();
  };

  // 스크롤 위치값 저장
  const activation = ()=>{
    const scroll = window.scrollY || window.pageYOffset;
    setCurY(scroll);
  }

  // 섹션 위치 값 저장 이벤트 실행
  useEffect(() => {
    if (!FilterList) return;
    getMenus();

    window.addEventListener('resize', getMenus);
    window.addEventListener('scroll', getMenus);
    
    return(()=>{
      window.removeEventListener('resize', getMenus);
      window.removeEventListener('scroll', getMenus);
    });
  }, [FilterList])
  
  // contentId 변경값에 따라 dispatch
  useEffect(() => {
    if (!contentId) return;
    dispatch(getContentAsync.request({id: contentId}));
  }, [contentId])

  return (
  <Layout type='content'>
    {(ContentData.id && Array.isArray(FilterList) && FilterList.length) &&
    <>
      <div id='content' ref={frame}>
        <figure // 상단 페이지 제목부분
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
                <Link href={`/list?area=${ContentData.area.id}`}>
                  <span>#{FilterList[1].list[ContentData.area.id]}</span>
                </Link>
              )}
              <Link href={`/list?type=${ContentData.type}`}>
                <span>#{ContentData.type && FilterList[2].list[ContentData.type]}</span>
              </Link>
            </div>
          </div>
        </figure>
        
        <div
          className={`inner ${curY >= position.current[0] ? 'menuOn' : undefined}`}
        >
          <ul // 섹션 이동 메뉴 출력
            className='tabMenu'>
            {tabMenus.filter((_, i) => {
              // 분양완료가 아니라면 완료 메뉴 제외
              if (ContentData.state !== 'COMPLETE' && i === 1) return false;
              // 위치값 없으면 위치 메뉴 제외
              if (!ContentData.latlng && i === 3) return false;
              return true;
            }).map((menu, i)=>{
              return (
                <li key={`tabMenu${i}`} 
                  className={TabIndex === i ? 'on' : undefined}
                  onClick={()=>{setTabIndex(i); Scroll(position.current[i]);}}
                >{menu}</li>
              );
            })}
          </ul>
          <div  // 컨텐츠 별 섹션
            className='tabBody'
          >
            <div>
              <ContentTable data={ContentData}></ContentTable>
            </div>
            <div className='gallery'>
              {(ContentData.state === 'COMPLETE' && ContentData.resultImages) && 
                <div className='inner'>
                {ContentData.resultImages?.map((data: TypeImages, idx: number)=>{
                  return (
                    <ContentPicture key={`images${data.id}`}>
                      <img src={`${baseUrl}/${ContentData.id}/${data.imageFileName}`} 
                        alt={ContentData.subject} 
                        onClick={()=>{
                          pop.current?.setImgList('resultImages');
                          pop.current?.setImgIndex(idx);
                          pop.current?.setOpen(true);
                        }}
                      />
                    </ContentPicture>
                  );
                })}
                </div>
              }
            </div>
            <div className='gallery'>
              <div className='inner'>
              {ContentData.youtube && 
                <Youtube>
                  <Link href={`https://www.youtube.com/watch?v=${ContentData.youtube}`
                } target='_blank'>
                    <img 
                      src={`http://i.ytimg.com/vi/${ContentData.youtube}/mqdefault.jpg`}
                      alt={ContentData.subject} />
                  </Link>
                </Youtube>
              }
              {ContentData.images?.map((data: TypeImages, idx: number)=>{
                return (
                  <ContentPicture key={`images${data.id}`}>
                    <img src={`${baseUrl}/${ContentData.id}/${data.imageFileName}`} 
                      alt={ContentData.subject} 
                      onClick={()=>{
                        pop.current?.setImgList('images');
                        pop.current?.setImgIndex(idx);
                        pop.current?.setOpen(true);
                      }}
                    />
                  </ContentPicture>
                );
              })}
              </div>
            </div>
            {ContentData.latlng && 
              <div>
                <Map
                  // 테스트용 latLng='37.5208062,127.0227158' 
                  latLng={ContentData.latlng}
                ></Map>
              </div>
            }
          </div>
        </div>
      </div>
      <Popup ref={pop}></Popup>
    </>
    }
  </Layout>);
}