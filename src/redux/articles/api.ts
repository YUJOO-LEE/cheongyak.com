import axios from "axios";
import { GetRequestType, GetResponseType } from "./types";

export async function apiGetArticles(option: GetRequestType) {
  const params = {
    state: option.state,
    area: option.area,
    type: option.type
  }
  const response = await axios.get<GetResponseType>(
    `https://kongnas.com:8110/api/houses`,
    {params}
  );

  return response.data.data;
}
