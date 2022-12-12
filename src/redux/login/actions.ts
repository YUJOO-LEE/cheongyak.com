import { createAction } from 'typesafe-actions';
import { createAsyncAction } from 'typesafe-actions';
import { AxiosError } from 'axios';

import {
  GetRequestType,
  GetResponseType
} from './types';

//액션 타입
export const SET_USER = 'user/SET_USER' as const;

//액션 생성 함수
export const setUser = createAction(SET_USER)<any>();

//비동기 액션 타입
export const LOG_IN_REQUEST = 'LOG_IN_REQUEST' as const;
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS' as const;
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE' as const;

//비동기 액션 생성 함수
export const getUserAsync = createAsyncAction(
  LOG_IN_REQUEST,
  LOG_IN_SUCCESS,
  LOG_IN_FAILURE
)<GetRequestType, GetResponseType, AxiosError>();
