import axios from "axios";
import { GetRequestType, GetResponseType } from "./types";

export async function apiGetContent(option: GetRequestType) {
  const response = await axios.get<GetResponseType>(
    `http://kongnas.com:8080/api/houses/${option.id}`
  );

  return response.data.data;
}
