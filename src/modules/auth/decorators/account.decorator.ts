import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAuthAccount = createParamDecorator(
  (param: string | undefined, context: ExecutionContext) => {
    const { authInfo } = context.switchToHttp().getRequest();
    return param && authInfo?.account ? authInfo.account[param] : authInfo?.account;
  },
);
