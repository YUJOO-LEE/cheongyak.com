import axios from "axios";
import { GetResponseType } from "./types";

export async function apiGetFilter() {
  const response = await axios.get<GetResponseType>(
    `/db/filter.json`
  );

  return response.data.data;
}
