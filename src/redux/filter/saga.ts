import { call, put, takeLatest } from "redux-saga/effects";
import { apiGetFilter } from "./api";
import { GetResponseType } from "./types";
import { getFilterAsync, FILTER_REQUEST } from "./actions";

function* getFilterSaga() {
  try {
    const response: GetResponseType = yield call(
      apiGetFilter
    );

    yield put(getFilterAsync.success(response));
  } catch (error: any) {
    yield put(getFilterAsync.failure(error));
  }
}

export function* filterSaga() {
  yield takeLatest(FILTER_REQUEST, getFilterSaga);
}

export { filterSaga as default };
