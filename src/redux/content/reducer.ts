import { createReducer } from "typesafe-actions";
import { contentState, contentAction } from "./types";
import { CONTENT_SUCCESS, CONTENT_FAILURE } from "./actions";

const initialState: contentState = {
  data: {id: 0}
};

const reducer = createReducer<contentState, contentAction>(initialState, {
  [CONTENT_SUCCESS]: (state, action) => {
    return {
    ...state,
    data: action.payload,
  }},
  [CONTENT_FAILURE]: (state) => {
    return {
    ...state
  }},
});

export default reducer;
