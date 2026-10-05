import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  firestoreProjectId: required("FIRESTORE_PROJECT_ID"),
  googleApplicationCredentials: required("GOOGLE_APPLICATION_CREDENTIALS"),
  kobisApiKey: required("KOBIS_API_KEY"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
