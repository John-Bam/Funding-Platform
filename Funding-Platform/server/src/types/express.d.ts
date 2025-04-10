import { UserRole } from '../models/user'; // Make sure to import the correct types

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        role: UserRole;
      };
    }
  }
}

export {};