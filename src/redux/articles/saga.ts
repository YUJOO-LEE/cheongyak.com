import { call, put, takeLatest } from "redux-saga/effects";
import { apiGetArticles } from "../../api/articles/api";
import { GetResponseType } from "../../api/articles/types";
import { getArticlesAsync, ARTICLES_REQUEST } from "./actions";

function* getArticlesSaga(
  action: ReturnType<typeof getArticlesAsync.request>
) {
  try {
    const response: GetResponseType = yield call(
      apiGetArticles,
      action.payload
    );

    console.log('READ', response);
    yield put(getArticlesAsync.success(response));
  } catch (error: any) {
    yield put(getArticlesAsync.failure(error));
  }
}

export function* articlesSaga() {
  yield takeLatest(ARTICLES_REQUEST, getArticlesSaga);
}

export { articlesSaga as default };
