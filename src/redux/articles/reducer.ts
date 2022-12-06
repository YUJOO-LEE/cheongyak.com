import { createReducer } from "typesafe-actions";
import { articlesState, articlesAction } from "./types";
import { ARTICLES_SUCCESS, ARTICLES_FAILURE } from "./actions";

const initialState: articlesState = {
  data: []
};

const reducer = createReducer<articlesState, articlesAction>(initialState, {
  [ARTICLES_SUCCESS]: (state, action) => {
    return {
    ...state,
    data: action.payload,
  }},
  [ARTICLES_FAILURE]: (state) => {
    return {
    ...state,
    data: [],
  }},
});

export default reducer;
