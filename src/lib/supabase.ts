import { createClient } from "@supabase/supabase-js";

function SUPABASE_CLASS() {
  // create supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string
  );

  // returns the id of all users
  async function getAllUsers(): Promise<Array<string>> {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      throw new Error(`Error in getAllUsers: ${error.message}`);
    }
    return data.users.map((user) => user.id);
  }

  return { getAllUsers };
}

export default SUPABASE_CLASS;
