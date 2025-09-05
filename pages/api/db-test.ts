import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Try fetching 1 row from "profiles"
    const { data, error } = await supabase.from("profiles").select("*").limit(1);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
}


