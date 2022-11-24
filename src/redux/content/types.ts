import { ActionType } from "typesafe-actions";

import * as actions from "./actions";

export type contentState = any;

export type contentAction = ActionType<typeof actions>;
