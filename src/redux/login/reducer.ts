import { createReducer } from "typesafe-actions";
import { userState, userAction, TypeUser } from "./types";
import { LOG_IN_FAILURE, LOG_IN_REQUEST, LOG_IN_SUCCESS } from "./actions";

export const initialState = {
  profile: null,
  logInLoading: false,  // 로그인 시도중
  logInDone: false, 
  logInError: null,
};

export const loginRequestAction = ({ profile }: { profile: TypeUser }) =>{
  return {
    type: LOG_IN_REQUEST,
    payload: profile,
  }
};

const reducer = createReducer<userState, userAction>(initialState, {
  [LOG_IN_REQUEST]: (state, action) => {
    console.log('reducer / loginRequestAction ');
    return {
      ...state,
      profile: action.payload,
      logInLoading : true,
      logInDone : false,
      logInError : null,
  }},
  [LOG_IN_SUCCESS]: (state) => {
    return {
      ...state,
      logInLoading : false,
      logInDone : true,
      logInError : null,
  }},
  [LOG_IN_FAILURE]: (error: any) => {
    return {
      profile: null,
      logInLoading : false,
      logInDone : true,
      logInError : error,
  }},
});

export default reducer;
