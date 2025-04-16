import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

export const signInSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const RoomNameSchema = z.object({
  name: z.string().min(1).max(50, {
    message: "Room name can only contain letters, numbers, underscores, and spaces"
  })
});