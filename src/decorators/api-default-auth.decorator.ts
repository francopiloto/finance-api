import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger'

export function ApiDefaultAuth() {
    return applyDecorators(ApiBearerAuth(), ApiUnauthorizedResponse({ description: 'Access denied' }))
}
