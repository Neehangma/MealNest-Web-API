export class HttpException extends Error {
  status: any;
  details: any;
  constructor(status: number, message: string, details?: any) {
    super(message);
    this.name = "HttpException";
    this.status = status;
    this.details = details;
  }
}

export const notFound = (message: string = "Resource not found") => new HttpException(404, message);
