import { z } from 'zod';

export const UserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const AddressSchema = z.object({
  line1: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export const TestDataSchema = z.object({
  users: z.array(UserSchema),
  addresses: z.array(AddressSchema),
  negative: z.object({
    emails: z.array(z.string()),
    passwords: z.array(z.string()),
  }),
});

export type User = z.infer<typeof UserSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type TestData = z.infer<typeof TestDataSchema>;
