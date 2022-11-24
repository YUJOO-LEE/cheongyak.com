
import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '../components/Layout';
import Article from '../components/Article';
import { RootState } from "../redux";
import { getArticlesAsync } from '../redux/articles';
import { useDispatch, useSelector } from 'react-redux';
import { TypeArticle, TypeQueries } from '../asset/types';


export default function ArticleList() {

  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const articlesList = useSelector((store: RootState)=> store.articles.data);

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
          {articlesList.length ? articlesList.map((data: TypeArticle)=>{
            return (
              <Article key={data.id} 
                id={data.id} 
                subject={data.subject} 
                imageFileName={data.image.imageFileName} 
                state={data.state} 
                area={data.area.id} 
                type={data.type} 
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