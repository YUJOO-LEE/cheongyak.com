import { GetResponseType } from './../../api/filter/types';
import { ActionType } from "typesafe-actions";
import { TypeFilter } from "../../asset/types";

import * as actions from "./actions";
import { AxiosError } from 'axios';

export type filterState = {
  data: Array<TypeFilter> | string | GetResponseType | AxiosError<unknown, any>
};

export type filterAction = ActionType<typeof actions>;
