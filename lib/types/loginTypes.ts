export interface LoginUser {
  id: string;
  email: string;
  password: string;
  role: string;
  status?: string;
}

export type ResetPasswordActionState = {
  errors?: {
    token?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  state_error?: string | null;
  message?: string | null;
};

export type ForgotPasswordActionState = {
  errors?: {
    email?: string[];
  };
  state_error?: string | null;
  message?: string | null;
};

export type TokenCheckResult =
  | { valid: true; reason: "" }
  | { valid: false; reason: "no_token" }
  | { valid: false; reason: "not_found" }
  | { valid: false; reason: "expired"; expiredAt: Date };
