import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { EntityTarget } from 'typeorm';

import { OWNER_ENTITY_KEY, OWNER_PARAM_KEY } from '../auth.constants';
import { IsOwnerGuard } from '../guards/owner.guard';

export const OwnerEntity = (entity: EntityTarget<any>, param = 'id') =>
  applyDecorators(
    UseGuards(IsOwnerGuard),
    SetMetadata(OWNER_ENTITY_KEY, entity),
    SetMetadata(OWNER_PARAM_KEY, param),
  );
