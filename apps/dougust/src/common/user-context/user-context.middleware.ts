import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserContextService } from './user-context.service';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  constructor(private readonly context: UserContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const businessId = process.env.BUSINESS_ID;
    this.context.run({ businessId }, next);
  }
}
