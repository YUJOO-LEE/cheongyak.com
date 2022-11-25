import { TypeArticle, TypeQueries } from "../../asset/types";
import { articlesState } from "../../redux/articles";

export type GetRequestType = TypeQueries;

export interface GetResponseType extends articlesState {
  payload: TypeArticle;
};
