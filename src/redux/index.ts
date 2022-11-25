import { combineReducers } from "redux";
import { all } from "redux-saga/effects";
import { createWrapper } from 'next-redux-wrapper';
import filter, { filterSaga } from "./filter";
import articles, { articlesSaga } from "./articles";
import content, { contentSaga } from "./content";
import configureStore from "./configureStore";

export const rootReducer = combineReducers({
  filter,
  articles,
  content,
});

export type RootState = ReturnType<typeof rootReducer>;
export function* rootSaga() {
  yield all([filterSaga(), articlesSaga(), contentSaga()]);
}

const wrapper = createWrapper(configureStore, {
  debug: process.env.NODE_ENV === 'development'
});

export default wrapper;