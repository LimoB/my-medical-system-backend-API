import z from 'zod';
import {
  newUserSchema,
  updateUserSchema,
  newDoctorSchema,
} from '@/validation/zodSchemas';

export type NewUserInput = z.infer<typeof newUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type NewDoctorInput = z.infer<typeof newDoctorSchema>;
