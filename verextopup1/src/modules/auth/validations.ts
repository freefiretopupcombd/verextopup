import { z } from "zod";

// ==================================================
// AUTH VALIDATIONS
// ==================================================
// Security considerations:
//   - Email normalized (trim + lowercase)
//   - Password: min 8, require letter + number
//   - All strings have max length (DoS prevent)
// ==================================================

// Password strength: min 8 char, at least 1 letter + 1 number
const passwordSchema = z
  .string()
  .min(8, "Password কমপক্ষে ৮ character")
  .max(100, "Password অনেক বড়")
  .regex(/[a-zA-Z]/, "Password এ অন্তত একটি letter থাকতে হবে")
  .regex(/[0-9]/, "Password এ অন্তত একটি number থাকতে হবে");

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email দিতে হবে")
      .max(255, "Email অনেক বড়")
      .email("সঠিক email দিন"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm Password দিন"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password দুটো মিলছে না",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email দিন")
    .max(255)
    .email("সঠিক email দিন"),
  password: z.string().min(1, "Password দিন").max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;