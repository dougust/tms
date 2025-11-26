type IEntity = { id: string };

export function reduceToRecord<T extends IEntity>(
  entities: T[]
): Record<string, T> {
  return entities.reduce(toRecordReducer, {});
}

export function toRecordReducer<T extends IEntity>(
  acc: Record<string, T>,
  entity: T
): Record<string, T> {
  if (entity.id) {
    acc[entity.id] = entity;
  }
  return acc;
}

export function reduceToRecordWithSelect<T extends object>(
  entities: T[],
  selector: (entity: T) => string
) {
  return entities.reduce((acc, entity): Record<string, T> => {
    const key = selector(entity);
    if (key) {
      acc[key] = entity;
    }
    return acc;
  }, {} as Record<string, T>);
}
