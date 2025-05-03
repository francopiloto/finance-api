import { applyDecorators } from '@nestjs/common';
import { PrimaryColumn, PrimaryColumnOptions } from 'typeorm';
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
  return applyDecorators(
    PrimaryColumn({ type: 'uuid', ...options }),

    // Use initializer to assign UUIDv7 if value is not provided
    (target: object, propertyKey: string | symbol) => {
      const privateKey = Symbol(`__${String(propertyKey)}__`);

      Object.defineProperty(target, propertyKey, {
        get() {
          if (!this[privateKey]) {
            this[privateKey] = uuidv7();
          }

          return this[privateKey];
        },
        set(value: string) {
          this[privateKey] = value;
        },
        enumerable: true,
        configurable: true,
      });
    },
  );
}
