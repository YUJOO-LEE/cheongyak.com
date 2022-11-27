import React, { useRef, forwardRef, useEffect, useState, useImperativeHandle } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { FreeMode, Navigation, Thumbs } from "swiper";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper/types/swiper-class';

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export interface TypeHandle {
  setOpen: (isOpen: boolean) => void;
  setImgIndex: (idx: number) => void;
}

const Popup = forwardRef<TypeHandle>((_, ref)=>{

  const router = useRouter();
  const [Open, setOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);  // 슬라이드 초기출력 인덱스
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
  const popup = useRef() as React.MutableRefObject<HTMLDivElement>;

  const baseUrl = 'https://cheongyak.com/img/house';
  const paramsId = parseInt(router.query.contentId as string);

  // store 내 이미지 리스트 불러오기
  const ImagesData = useSelector((store: RootState)=> store.content.data.images);

  // 상위 컴포넌트로 메서드 반환
  useImperativeHandle(
    ref,
    () => ({
      setOpen: (isOpen)=> setOpen(isOpen),
      setImgIndex: (idx)=> setImgIndex(idx),
    })
  )

  // 상위 컴포넌트에서 Open 조작 시 이펙트
  useEffect(() => {

    // 초기값 설정
    setThumbsSwiper(null);
    document.body.style.overflow = 'auto';
    if (!popup.current) return;
    popup.current.classList.remove('on');

    // Open 값 true 일때만 노출
    if (Open) {
      popup.current.classList.add('on');
      document.body.style.overflow = 'hidden';
    }
  }, [Open]);

  return (
    <>
    {(Open && ImagesData?.length) &&
      <aside className='pop' ref={popup}>
        <div className='con'>
          <Swiper // 상세 이미지
            initialSlide={imgIndex}
            spaceBetween={0}
            navigation={true}
            thumbs={{ swiper: thumbsSwiper }}
            modules={[FreeMode, Navigation, Thumbs]}
            className="slide"
          >
            {ImagesData.map((data: any, idx: number)=>
              <SwiperSlide key={`slide${idx}`}>
                <img src={`${baseUrl}/${paramsId}/${data.imageFileName}`} 
                  alt={`${idx}번째 이미지`} 
                  onClick={()=>setImgIndex(idx)}
                />
              </SwiperSlide>
            )}
          </Swiper>
          <Swiper // 이미지 목록
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={3}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="slideList"
            breakpoints={{
              540: {
                slidesPerView: 5,
              },
              1180: {
                slidesPerView: 7,
              }
            }}
          >
            {ImagesData.map((data: any, idx: number)=>
              <SwiperSlide key={`list${idx}`}>
                <img src={`${baseUrl}/${paramsId}/${data.imageFileName}`} 
                  alt={`${idx}번째 이미지`} 
                  onClick={()=>setImgIndex(idx)}
                />
              </SwiperSlide>
            )}
          </Swiper>
        </div>
        <span className='close' onClick={()=>{setOpen(false)}} >
          <FontAwesomeIcon icon={faX}></FontAwesomeIcon>
        </span>
      </aside>
    }
    </>
  );
});

export default Popup;
