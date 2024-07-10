class AppError extends Error {
  public statusCode: number;
  public isOutOfStock?: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOutOfStock?: boolean,
    stack = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOutOfStock = isOutOfStock;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
