import React, { useRef, forwardRef, useEffect, useState, useImperativeHandle } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux';
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

const Popup = forwardRef<TypeHandle>((props, ref)=>{

  const router = useRouter();
  const [Open, setOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);

  const popup = useRef() as React.MutableRefObject<HTMLDivElement>;
  const ImagesData = useSelector((store: RootState)=> store.content.data.images);

  const baseUrl = 'https://cheongyak.com/img/house';
  const paramsId = parseInt(router.query.contentId as string);

  useImperativeHandle(
    ref,
    () => ({
      setOpen: (isOpen)=> setOpen(isOpen),
      setImgIndex: (idx)=> setImgIndex(idx),
    })
  )

  useEffect(() => {
    setThumbsSwiper(null);
    document.body.style.overflow = 'auto';

    if (!popup.current) return;
    if (Open) {
      popup.current.classList.add('on');
      document.body.style.overflow = 'hidden';
    } else {
      popup.current.classList.remove('on');
    }
  }, [Open]);
  
  const handleClick = (idx: number)=>{
    setImgIndex(idx);
  }

  return (
    <>
    {(Open && ImagesData?.length) &&
      <aside className='pop' ref={popup}>
        <div className='con'>
          <Swiper
            initialSlide={imgIndex}
            loop={true}
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
                  onClick={()=>handleClick(idx)}
                />
              </SwiperSlide>
            )}
          </Swiper>
          <Swiper
            onSwiper={setThumbsSwiper}
            loop={true}
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
                  onClick={()=>handleClick(idx)}
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
