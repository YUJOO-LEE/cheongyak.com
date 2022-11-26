import { ActionType } from "typesafe-actions";
import { TypeContent } from "../../asset/types";

import * as actions from "./actions";

export interface contentState {
  data: TypeContent | GetResponseType;
};

export interface GetResponseType extends contentState, TypeContent {
  payload: TypeContent;
};

export type contentAction = ActionType<typeof actions>;

export interface GetRequestType {
  id: number;
};
