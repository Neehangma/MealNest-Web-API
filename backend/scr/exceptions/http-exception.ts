class HttpException extends Error {
  status: number;
  details: any;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.name = "HttpException";
    this.status = status;
    this.details = details;
  }
}

const notFound = (message = "Resource not found") => new HttpException(404, message);

module.exports = {
  HttpException,
  notFound,
};
