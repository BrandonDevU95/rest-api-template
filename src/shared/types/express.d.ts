declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: 'admin' | 'user';
    }

    interface Request {
      correlationId?: string;
    }
  }
}

export {};
