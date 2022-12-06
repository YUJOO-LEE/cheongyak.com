
import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '../components/common/Layout';
import Article from '../components/list/Article';
import { RootState } from "../redux";
import { getArticlesAsync } from '../redux/articles';
import { useDispatch, useSelector } from 'react-redux';
import { TypeArticle, TypeQueries } from '../asset/types';


export default function ArticleList() {

  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // store 내 분양 리스트 불러오기
  const articlesList = useSelector((store: RootState)=> store.articles.data);

  // 쿼리스트링 변경에 따라 dispatch
  useEffect(() => {
    const queries: TypeQueries = {
      state: searchParams.get('state') || '',
      area: searchParams.get('area') || '',
      type: searchParams.get('type') || ''
    }

    dispatch(getArticlesAsync.request(queries));
  }, [dispatch, searchParams])

  return (
    <Layout type='list'>
      <div id='list'>
        <div className='inner'>
          {Array.isArray(articlesList) && articlesList.length ? articlesList.map((data: TypeArticle)=>{
            return (
              <Article key={data.id} 
                id={data.id} 
                subject={data.subject} 
                imageFileName={data.image.imageFileName} 
                state={data.state} 
                area={data.area.id} 
                type={data.type} 
                newContent={data.newContent} 
                updateContent={data.updateContent} 
              >{data.desc}</Article>
            );
          })
          : <p>검색된 데이터가 없습니다.</p>
          }
        </div>
      </div>
    </Layout>
  );
}