import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Missing Supabase environment variables. Storage functions will fail.");
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key"
);

export const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Utility to ensure a bucket exists
export async function ensureBucketExists(bucketName: string) {
  try {
    const { data: buckets, error } = await adminSupabase.storage.listBuckets();
    if (error) {
      console.error("Error listing buckets:", error);
      return false;
    }
    
    if (!buckets.some(b => b.name === bucketName)) {
      const { error: createError } = await adminSupabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
      });
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("ensureBucketExists failed:", err);
    return false;
  }
}
