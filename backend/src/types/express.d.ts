declare global {
  namespace Express {
    /** The authenticated admin, resolved from the database by authMiddleware —
     *  not merely decoded from the token, so a role change or a revoked session
     *  takes effect on the very next request. */
    interface AuthenticatedAdmin {
      id: string;
      email: string;
      name: string;
      role: string;
      partnerName: string | null;
    }

    interface Request {
      admin?: AuthenticatedAdmin;
    }
  }
}

export {};
