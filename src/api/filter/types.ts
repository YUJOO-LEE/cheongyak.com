import { TypeFilter } from "../../asset/types";
import { filterState } from "../../redux/filter";

export type GetRequestType = string;

export interface GetResponseType extends filterState {
  payload: Array<TypeFilter>;
};
