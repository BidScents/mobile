import { z } from 'zod'

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export type ForgotPasswordRequestFormData = z.infer<typeof forgotPasswordRequestSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>