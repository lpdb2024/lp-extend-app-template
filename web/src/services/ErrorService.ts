import { AxiosError } from "axios";
import { Notify } from "quasar";

export class ErrorService {
  handleRequestError(error: unknown, useNotify?: boolean): string {
    if (error instanceof AxiosError) {
      if (error.code === AxiosError.ERR_CANCELED) {
        console.warn("Request cancelled");
        console.error(error);
        return "Request cancelled";
      }

      const message =
        error.response?.data?.message ??
        error.response?.data?.errorMessage ??
        `${error.message} ${error.code}`;
      console.error(error);
      if (useNotify) {
        Notify.create({
          type: "lpFail",
          spinner: false,
          message: "Error",
          caption: error.response?.data?.errorMessage || message,
        });
      }
      return message;
    }

    console.error(error);
    return "Sorry, something went wrong";
  }
}

export default new ErrorService();
