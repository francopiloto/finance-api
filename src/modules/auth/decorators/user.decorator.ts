import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (param: string | undefined, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();
    return param && user ? user[param] : user;
  },
);
