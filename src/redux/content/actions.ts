import { createAction } from 'typesafe-actions';
import { createAsyncAction } from 'typesafe-actions';
import { AxiosError } from 'axios';

import {
  GetRequestType,
  GetResponseType
} from '../../api/content/types';

//액션 타입
export const SET_CONTENT = 'content/SET_CONTENT' as const;

//액션 생성 함수
export const setContent = createAction(SET_CONTENT)<any>();

//비동기 액션 타입
export const CONTENT_REQUEST = 'content/CONTENT_REQUEST' as const;
export const CONTENT_SUCCESS = 'content/CONTENT_SUCCESS' as const;
export const CONTENT_FAILURE = 'content/CONTENT_FAILURE' as const;

//비동기 액션 생성 함수
export const getContentAsync = createAsyncAction(
  CONTENT_REQUEST,
  CONTENT_SUCCESS,
  CONTENT_FAILURE
)<GetRequestType, GetResponseType, AxiosError>();
