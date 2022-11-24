import { call, put, takeLatest } from "redux-saga/effects";
import { apiGetContent } from "../../api/content/api";
import { GetResponseType } from "../../api/content/types";
import { getContentAsync, CONTENT_REQUEST } from "./actions";

function* getContentSaga(
  action: ReturnType<typeof getContentAsync.request>
) {
  try {
    const response: GetResponseType = yield call(
      apiGetContent,
      action.payload
    );

    console.log('READ', response);
    yield put(getContentAsync.success(response));
  } catch (error: any) {
    yield put(getContentAsync.failure(error));
  }
}

export function* contentSaga() {
  yield takeLatest(CONTENT_REQUEST, getContentSaga);
}

export { contentSaga as default };