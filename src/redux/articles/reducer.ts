import { createReducer } from "typesafe-actions";
import { articlesState, articlesAction } from "./types";
import { SET_ARTICLES, ARTICLES_REQUEST, ARTICLES_SUCCESS, ARTICLES_FAILURE } from "./actions";

const initialState: articlesState = {
  data: []
};

const reducer = createReducer<articlesState, articlesAction>(initialState, {
  [SET_ARTICLES]: (state, action) => {
    return {
    ...state,
    data: action.payload,
  }},
  [ARTICLES_REQUEST]: (state) => {
    return {
    ...state
  }},
  [ARTICLES_SUCCESS]: (state, action) => {
    return {
    ...state,
    data: action.payload,
  }},
  [ARTICLES_FAILURE]: (state) => {
    return {
    ...state
  }},
});

export default reducer;
