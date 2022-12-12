import { ActionType } from "typesafe-actions";

import * as actions from "./actions";

export type TypeUser = {
  connected_at: string,
  id: number,
  kakao_account: {
    profile:{
      is_default_image: boolean,
      nickname: string,
      profile_image_url: string,
      thumbnail_image_url: string,
      },
    profile_image_needs_agreement: string,
    profile_nickname_needs_agreement: string,
  },
  properties: {
    nickname: string,
    profile_image: string,
    thumbnail_image: string,
  }
}

export type userState = {
  profile: TypeUser | null;
  logInLoading: boolean;
  logInDone: boolean;
  logInError: string | null;
};

export interface GetResponseType extends userState {
  payload: TypeUser;
};

export type userAction = ActionType<typeof actions>;

export type GetRequestType = TypeUser;
