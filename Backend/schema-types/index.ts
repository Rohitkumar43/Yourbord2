import {z} from "zod";

export const CreateUserSchema = z.object({
  username: z.string().min(1).max(50),
  name: z.string().min(1).max(20),
  password: z.string().min(8),
});


export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});


export const RoomNameSchema = z.object({
  name: z.string(),
});
