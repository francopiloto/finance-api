import { SetMetadata } from '@nestjs/common';

import { DISABLE_DEFAULT_AUTH_GUARD_KEY } from '../auth.constants';

export const Public = () => SetMetadata(DISABLE_DEFAULT_AUTH_GUARD_KEY, true);
