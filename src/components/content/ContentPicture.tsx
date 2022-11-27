import React from "react";

export default function ContentPicture({children}: {children?: React.ReactElement}){
  return (
    <div className='wrap'>
      {children}
    </div>
  );
}