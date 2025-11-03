// context.provider.ts
import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';

interface RequestContext {
  businessId: string;
}

@Injectable()
export class UserContextService {
  private storage = new AsyncLocalStorage<RequestContext>();

  run(context: RequestContext, callback: () => void) {
    this.storage.run(context, callback);
  }

  getStore() {
    return this.storage.getStore();
  }

  get businessId(): string | undefined {
    return this.getStore()?.businessId;
  }
}
