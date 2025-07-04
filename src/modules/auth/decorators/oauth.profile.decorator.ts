import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentOAuthProfile = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
