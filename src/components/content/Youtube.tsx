import React from "react";

export default function Youtube({children}: {children?: React.ReactElement}){
  return (
    <div className='wrap youtube'>
      {children}
    </div>
  );
}