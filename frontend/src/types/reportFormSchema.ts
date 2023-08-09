import { z } from "zod";

export const reportFormSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim(),
  reference_uris: z.array(z.string().trim()),
  domain: z.enum(["performance", "ethics", "security"]),
  purls: z.array(z.string().trim()),
  user_id: z.string(),
});

export const reportFormClientSchema = reportFormSchema
  .omit({
    user_id: true,
    purls: true,
  })
  .merge(z.object({ url: z.string().trim() }));
