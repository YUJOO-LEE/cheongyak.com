import { AxiosError } from "axios";
import { ActionType } from "typesafe-actions";
import { GetResponseType } from "../../api/articles/types";
import { TypeArticle } from "../../asset/types";

import * as actions from "./actions";

export type articlesState = {
  data: Array<TypeArticle> | string | GetResponseType | AxiosError<unknown, any>
};

export type articlesAction = ActionType<typeof actions>;
