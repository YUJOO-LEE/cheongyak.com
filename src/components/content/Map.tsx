/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from "react";

export default function Map({latLng}: {latLng: string}) {

  const { kakao } = window as MyWindow;
  const container = useRef(null);

  useEffect(() => {
    if (!container.current || !latLng || !kakao) return;

    const con = container.current as HTMLElement;
    const lat = +latLng.split(',')[0];
    const lng = +latLng.split(',')[1];

    // 카카오 맵 생성
    kakao.maps.load(()=>{
      const curlatLng = new kakao.maps.LatLng(lat,lng);
      const option = {
        center: curlatLng,
        lever: 3
      };

      // 맵 인스턴스
      const mapInstance = new kakao.maps.Map(con, option);

      // 옵션 생성
      const markerPosition  = new kakao.maps.LatLng(lat,lng); // 마커 포지션
      const marker = new kakao.maps.Marker({position: markerPosition}); // 마커 생성
      const mapTypeControl = new kakao.maps.MapTypeControl(); // 지도타입 컨트롤
      const zoomControl = new kakao.maps.ZoomControl(); // 줌 컨트롤

      // 맵에 옵션 추가
      mapInstance.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
      mapInstance.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
      marker.setMap(mapInstance);

      // 리사이즈 시 중앙정렬 (반응형)
      const resize = ()=>{
        mapInstance.setCenter(new kakao.maps.LatLng(lat,lng));
      }
      window.addEventListener('resize', resize);
    })

    return ()=>{
      con.innerHTML = '';
    }
  }, [container.current, latLng]);

  return (
    <div id='map' ref={container}>
    </div>
  );
}