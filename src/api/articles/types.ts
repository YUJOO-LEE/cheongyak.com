export interface GetRequestType {
  state?: string;
  area?: string;
  type?: string;
};

export interface GetResponseType {
  data: [];
  code: string;
  message: string;
  payload: any;
};
