import { AxiosError } from "axios";
import { ActionType } from "typesafe-actions";
import { GetResponseType } from "../../api/content/types";
import { TypeContent } from "../../asset/types";

import * as actions from "./actions";

export type contentState = {
  data: TypeContent | string | GetResponseType | AxiosError<unknown, any>
};

export type contentAction = ActionType<typeof actions>;
