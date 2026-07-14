export interface UserCredentials {
  email: string;
  password: string;
  role?: string;
}

/** Pre-configured demo users bundled with the Rolnopol application. 
 * CREDENSHIALS SHOULD NEVER BE STORED LIKE THIS IN A REAL APPLICATION. This is only for testing purposes.
*/
export const TEST_USERS = {
  demo: {
    email: 'demo@example.com',
    password: 'demo123',
    role: 'user',
  },
  test: {
    email: 'test@example.com',
    password: 'brownPass123',
    role: 'user',
  },
  john: {
    email: 'john.doe@example.com',
    password: 'johndoe123',
    role: 'user',
  },
} as const satisfies Record<string, UserCredentials>;

export const INVALID_CREDENTIALS = {
  wrongPassword: {
    email: 'demo@example.com',
    password: 'wrong_password_xyz',
  },
  nonExistentUser: {
    email: 'nobody@notexist.example.com',
    password: 'somepassword123',
  },
} as const;
