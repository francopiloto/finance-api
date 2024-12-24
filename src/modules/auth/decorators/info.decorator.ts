import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const AuthInfo = createParamDecorator((param: string | undefined, context: ExecutionContext) => {
    const { authInfo } = context.switchToHttp().getRequest()
    return param && authInfo ? authInfo[param] : authInfo
})
