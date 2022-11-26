import { createReducer } from "typesafe-actions";
import { filterState, filterAction } from "./types";
import { FILTER_SUCCESS, FILTER_FAILURE } from "./actions";

const initialState: filterState = {
  data: []
};

const reducer = createReducer<filterState, filterAction>(initialState, {
  [FILTER_SUCCESS]: (state, action) => {
    return {
    ...state,
    data: action.payload,
  }},
  [FILTER_FAILURE]: (state, action) => {
    return {
    ...state,
    data: action.payload,
  }},
});

export default reducer;
