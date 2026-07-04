class HttpException extends Error {
  constructor(status, message, details) {
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
