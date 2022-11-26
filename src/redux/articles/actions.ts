import { createAction } from 'typesafe-actions';
import { createAsyncAction } from 'typesafe-actions';
import { AxiosError } from 'axios';

import {
  GetRequestType,
  GetResponseType
} from './types';

//액션 타입
export const SET_ARTICLES = 'articles/SET_ARTICLES' as const;

//액션 생성 함수
export const setArticles = createAction(SET_ARTICLES)<any>();

//비동기 액션 타입
export const ARTICLES_REQUEST = 'articles/ARTICLES_REQUEST' as const;
export const ARTICLES_SUCCESS = 'articles/ARTICLES_SUCCESS' as const;
export const ARTICLES_FAILURE = 'articles/ARTICLES_FAILURE' as const;

//비동기 액션 생성 함수
export const getArticlesAsync = createAsyncAction(
  ARTICLES_REQUEST,
  ARTICLES_SUCCESS,
  ARTICLES_FAILURE
)<GetRequestType, GetResponseType, AxiosError>();
