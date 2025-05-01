import { Request } from 'express';

export const jwtFromRequest = (req: Request) =>
  req.headers?.authorization?.replace(/bearer\s+/i, '');
