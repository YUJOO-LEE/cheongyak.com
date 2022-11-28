import axios from "axios";
import { GetRequestType, GetResponseType } from "./types";

export async function apiGetContent(option: GetRequestType) {
  const response = await axios.get<GetResponseType>(
    `https://kongnas.com:8110/api/houses/${option.id}`
  );

  return response.data.data;
}
