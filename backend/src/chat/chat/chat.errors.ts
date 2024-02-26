export class DatabaseError extends Error {
  constructor(message: string) {
    const errorPrefix = 'Database Error';
    const fullMessage = `${errorPrefix}: ${message}`;
    super(fullMessage);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    const errorPrefix = 'Not Found Error';
    const fullMessage = `${errorPrefix}: ${message}`;
    super(fullMessage);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}