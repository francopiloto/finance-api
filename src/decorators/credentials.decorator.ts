import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Credentials = createParamDecorator((param: string, context: ExecutionContext) => {
    const { credentials } = context.switchToHttp().getRequest()
    return param && credentials ? credentials[param] : credentials
})
