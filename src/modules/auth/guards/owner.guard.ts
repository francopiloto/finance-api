import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource, EntityTarget } from 'typeorm';

import { OWNER_ENTITY_KEY, OWNER_PARAM_KEY } from '../auth.constants';

@Injectable()
export class IsOwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const entity = this.reflector.get<EntityTarget<any>>(OWNER_ENTITY_KEY, context.getHandler());

    if (!entity) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const paramKey = this.reflector.get<string>(OWNER_PARAM_KEY, context.getHandler()) || 'id';
    const resourceId = request.params?.[paramKey] ?? request.body?.[paramKey];

    if (!resourceId) {
      throw new NotFoundException('Missing resource ID');
    }

    const repo = this.dataSource.getRepository(entity);
    const resource = await repo.findOne({ where: { id: resourceId, user } });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return true;
  }
}
