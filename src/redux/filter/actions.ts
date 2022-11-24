import { createAction } from 'typesafe-actions';
import { createAsyncAction } from 'typesafe-actions';
import { AxiosError } from 'axios';

import {
  GetRequestType,
  GetResponseType
} from '../../api/filter/types';

//액션 타입
export const SET_FILTER = 'filter/SET_FILTER' as const;

//액션 생성 함수
export const setFilter = createAction(SET_FILTER)<any>();

//비동기 액션 타입
export const FILTER_REQUEST = 'filter/FILTER_REQUEST' as const;
export const FILTER_SUCCESS = 'filter/FILTER_SUCCESS' as const;
export const FILTER_FAILURE = 'filter/FILTER_FAILURE' as const;

//비동기 액션 생성 함수
export const getFilterAsync = createAsyncAction(
  FILTER_REQUEST,
  FILTER_SUCCESS,
  FILTER_FAILURE
)<GetRequestType, GetResponseType, AxiosError>();
