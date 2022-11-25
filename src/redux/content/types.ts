import { ActionType } from "typesafe-actions";
import { GetResponseType } from "../../api/content/types";
import { TypeContent } from "../../asset/types";

import * as actions from "./actions";

export interface contentState {
  data: TypeContent | GetResponseType;
};

export type contentAction = ActionType<typeof actions>;
