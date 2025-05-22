import { BeforeInsert, PrimaryColumn, PrimaryColumnOptions } from 'typeorm';
import { uuidv7 } from 'uuidv7';

/**
 * Custom decorator for UUIDv7-based primary columns.
 * Generates a UUIDv7 value by default and sets the column type to 'uuid'.
 *
 * Usage:
 * @PrimaryUuidColumn()
 * id: string;
 */
export function PrimaryUuidColumn(options: PrimaryColumnOptions = {}) {
  return function (target: any, propertyKey: string) {
    PrimaryColumn({ type: 'uuid', ...options })(target, propertyKey);

    const hookName = `__generateUuidBeforeInsert__${propertyKey}`;

    if (!target[hookName]) {
      Object.defineProperty(target, hookName, {
        value: function () {
          if (!this[propertyKey]) {
            this[propertyKey] = uuidv7();
          }
        },
        writable: false,
        enumerable: false,
        configurable: false,
      });

      BeforeInsert()(target, hookName);
    }
  };
}
