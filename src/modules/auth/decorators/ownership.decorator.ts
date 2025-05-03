import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { EntityTarget } from 'typeorm';

import { OWNER_ENTITY_KEY, OWNER_PARAM_KEY } from '../auth.constants';
import { OwnershipGuard } from '../guards/ownership.guard';

export const CheckOwnership = (entity: EntityTarget<any>, param = 'id') =>
  applyDecorators(
    UseGuards(OwnershipGuard),
    SetMetadata(OWNER_ENTITY_KEY, entity),
    SetMetadata(OWNER_PARAM_KEY, param),
  );
