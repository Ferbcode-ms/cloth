/**
 * Script to create an admin user in Supabase
 * Usage: node scripts/createAdmin.js [email] [password]
 * Make sure to set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Connected to Supabase client");

    const email = (process.argv[2] || "admin@example.com").toLowerCase();
    const password = process.argv[3] || "admin123";

    // Check if admin already exists
    const { data: existingAdmin, error: findError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findError) {
      console.error("Error checking for existing admin user:", findError);
      process.exit(1);
    }

    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists`);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const { data: newAdmin, error: insertError } = await supabase
      .from("admin_users")
      .insert({
        email,
        password: hashedPassword,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting admin user:", insertError);
      process.exit(1);
    }

    console.log(`Admin user created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("\nPlease change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Unexpected error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();
