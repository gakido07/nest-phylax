export type PasswordLoginArgs = {
  email: string;
  password: string;
  config?: {
    generateRefreshToken?: boolean;
  };
};
