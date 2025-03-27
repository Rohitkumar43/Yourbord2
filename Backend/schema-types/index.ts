import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores"
  }),
  name: z.string().min(2).max(50),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
      message: "Password must include at least one letter, one number, and one special character"
    })
});

export const signInSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8)
});

export const RoomNameSchema = z.object({
  name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_\s]+$/, {
    message: "Room name can only contain letters, numbers, underscores, and spaces"
  })
});