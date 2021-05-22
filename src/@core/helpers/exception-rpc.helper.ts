import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const clientRpcException = (e: any) => {
  let exception = e;
  try {
    exception = JSON.parse(e);
  } catch (e) {}

  const statusCode = exception?.statusCode;
  switch (statusCode) {
    case 400:
      throw new BadRequestException(exception);
    case 401:
      throw new UnauthorizedException(exception);
    case 403:
      throw new ForbiddenException(exception);
    case 404:
      throw new NotFoundException(exception);
    case 422:
      throw new UnprocessableEntityException(exception);
    default:
      throw new InternalServerErrorException(e);
  }
};
