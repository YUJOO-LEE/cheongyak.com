import { combineReducers } from "redux";
import { all } from "redux-saga/effects";
import { createWrapper } from 'next-redux-wrapper';
import filter, { filterSaga } from "./filter";
import articles, { articlesSaga } from "./articles";
import configureStore from "./configureStore";

export const rootReducer = combineReducers({
  filter,
  articles,
});

export type RootState = ReturnType<typeof rootReducer>;
export function* rootSaga() {
  yield all([filterSaga(), articlesSaga()]);
}

const wrapper: any = createWrapper(configureStore, {
  debug: process.env.NODE_ENV === 'development'
});

export default wrapper;