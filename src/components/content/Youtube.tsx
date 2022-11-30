import React from "react";

export default function Youtube({children}: {children?: React.ReactElement}){
  return (
    <div className='youtube'>
      {children}
      <i className="fa-brands fa-youtube"></i>
    </div>
  );
}