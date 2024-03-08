import { AxiosResponse } from "axios";

export const validateResponse = (response: AxiosResponse) => {
  if (response.status !== 200) {
    throw new Error(`Request failed with status code ${response.status}`);
  }
  return response;
};
