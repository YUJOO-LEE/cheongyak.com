import axios from 'axios';
import Layout from "components/common/Layout";
import Article from "components/common/Article";
import { useEffect, useRef, useState } from 'react';

export default function ArticleList() {
  const [ listData, setList ] = useState([]);

  const baseUrl = useRef(process.env.PUBLIC_URL);

  useEffect(()=>{
    axios.get(`${baseUrl.current}/db/dummyList.json`).then((json)=>{
      setList(json.data.articleList);
    })
  }, [])

  
  return (
    <Layout>
      <div id="list">
        <div className="inner">
          {listData.map((data, i)=>{
            return (
              <Article key={i} 
                id={i} 
                title={data.title} 
                imgSrc={data.imgSrc} 
                state={data.state} 
                area={data.area} 
                type={data.type} 
              >{data.desc}</Article>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}