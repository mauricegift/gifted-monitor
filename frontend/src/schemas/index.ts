import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a special character");

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-z]+$/, "Username must be lowercase letters only"),
  name: z.string().min(2, "Name is too short").max(100, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export const verifyOtpSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be digits only"),
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const createMonitorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  url: z.string().min(1, "URL is required").url("Enter a valid URL"),
  path: z.string().optional(),
  method: z.enum(["GET", "HEAD", "POST"]),
  body: z.string().optional(),
  intervalMins: z.number().min(0.5, "Minimum interval is 30 seconds").max(1440, "Maximum 24 hours"),
  notify_down: z.boolean().optional(),
  notify_up: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginForm = z.infer<typeof loginSchema>;
// identifier maps to email or username on submit
export type SignupForm = z.infer<typeof signupSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type CreateMonitorForm = z.infer<typeof createMonitorSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
