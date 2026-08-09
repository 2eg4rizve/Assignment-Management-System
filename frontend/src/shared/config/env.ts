import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  API_BASE_URL: z.string().url(),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function getServerEnvironment(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ServerEnvironment {
  const result = serverEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    throw new Error(
      "Invalid server environment. Set API_BASE_URL to the backend API root.",
      { cause: result.error },
    );
  }

  return result.data;
}
