import { ActionType } from "typesafe-actions";
import { TypeFilter } from "../../asset/types";

import * as actions from "./actions";
import { AxiosError } from 'axios';

export type filterState = {
  data: Array<TypeFilter> | string | GetResponseType | AxiosError<unknown, any>
};

export interface GetResponseType extends filterState {
  payload: Array<TypeFilter>;
};

export type filterAction = ActionType<typeof actions>;

export type GetRequestType = string;
