import { AxiosError } from "axios";
import { ActionType } from "typesafe-actions";
import { TypeArticle, TypeQueries } from "../../asset/types";

import * as actions from "./actions";

export type articlesState = {
  data: Array<TypeArticle> | string | GetResponseType | AxiosError<unknown, any>
};

export interface GetResponseType extends articlesState {
  payload: TypeArticle;
};

export type articlesAction = ActionType<typeof actions>;

export type GetRequestType = TypeQueries;
