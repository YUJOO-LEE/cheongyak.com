import { delay, put, takeLatest } from "redux-saga/effects";
import { LOG_IN_FAILURE, LOG_IN_REQUEST, LOG_IN_SUCCESS } from "./actions";

function* getUserSaga() {
    try {
      yield delay(2000);
      yield put({
        type: LOG_IN_SUCCESS,
    });
    } catch (error: any) {
      yield put({
        type: LOG_IN_FAILURE,
        error: error.response.data
    });
    }
}

export function* userSaga() {
  yield takeLatest(LOG_IN_REQUEST, getUserSaga);
}

export { userSaga as default };