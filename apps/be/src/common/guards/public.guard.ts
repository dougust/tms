import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators';

export abstract class PublicGuard {
  protected constructor(private reflector: Reflector) {}

  async isPublic(context: ExecutionContext): Promise<boolean> {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
