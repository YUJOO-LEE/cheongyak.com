import { createReducer } from "typesafe-actions";
import { contentState, contentAction } from "./types";
import { SET_CONTENT, CONTENT_REQUEST, CONTENT_SUCCESS, CONTENT_FAILURE } from "./actions";

const initialState: contentState = {
  data: []
};

const reducer = createReducer<contentState, contentAction>(initialState, {
  [SET_CONTENT]: (state, action) => {
    return {
    ...state,
    data: action.payload,
  }},
  [CONTENT_REQUEST]: (state) => {
    return {
    ...state
  }},
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
