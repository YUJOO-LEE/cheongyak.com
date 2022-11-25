import { TypeContent } from "../../asset/types";
import { contentState } from "../../redux/content";

export interface GetRequestType {
  id: number;
};

export interface GetResponseType extends contentState, TypeContent {
  payload: TypeContent;
};
