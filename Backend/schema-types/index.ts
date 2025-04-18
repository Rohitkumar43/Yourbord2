import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  username: z.string().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  name: z.string().min(1, { message: "Name is required" })
});

export const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" })
});



// export const CreateUserSchema = z.object({
//   username: z.string().min(3),
//   email: z.string().email(),
//   password: z.string().min(6),
//   name: z.string().min(1)
// });

// export const signInSchema = z.object({
//   username: z.string(),
//   password: z.string()
// });

export const RoomNameSchema = z.object({
  name: z.string().min(1).max(50, {
    message: "Room name can only contain letters, numbers, underscores, and spaces"
  })
});