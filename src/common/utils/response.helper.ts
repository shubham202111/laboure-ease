export interface IResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
  fileName?: any;
  error?: any;
}

/**
 * Returns a basic success response without data.
 */
export function successResponse(msg:string): IResponse {
  const resObject: IResponse = {
    success: true,
    statusCode:200,
    message:msg,

  }
  return resObject;
}

/**
 * Returns a success response containing data.
 */
export function successResponseWithData(msg: string, data: any): IResponse {
  const resObject: IResponse = {
    success: true,
    statusCode:200,
    message:msg,
    data: data
  }
  return resObject;
}

export function successResponseUploadData(msg: string, data: any): IResponse {
  const resObject: IResponse = {
    success: true,
    statusCode:200,
    message:msg,
    fileName: data
  }
  return resObject;
}

/**
 * Returns a basic failure response with a message.
 */
export function failureResponse(msg:string, statusCode =400): IResponse {
  const resObject: IResponse = {
    success: false,
    statusCode:statusCode,
    message:msg,

  }
  return resObject;
}

/**
 * Returns a failure response including detailed error context.
 */
export function failureResponseWithError(msg: string, error: any): IResponse  {
  const resObject: IResponse = {
    success: false,
    statusCode:400,
    message:msg,
    error: error

  }
  return resObject;
}