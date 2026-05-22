// Stub for MongoDB database connection since we migrated to Supabase.
// This function is kept to avoid breaking existing imports of connectDB in files that haven't been migrated yet.
export default async function connectDB() {
  return true;
}
