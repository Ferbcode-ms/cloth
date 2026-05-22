import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";

const defaultBanner = {
  text: "Sign up and get 20% off to your first order.",
  linkUrl: "/products",
  linkText: "Sign Up Now",
  isVisible: true,
};

export async function GET() {
  try {
    let { data: settings, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!settings) {
      const { data: newSettings, error: insertError } = await supabase
        .from("settings")
        .insert({
          banner: defaultBanner,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      settings = newSettings;
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { banner } = body;

    let { data: settings, error: getError } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (getError) throw getError;

    if (!settings) {
      const { data: newSettings, error: insertError } = await supabase
        .from("settings")
        .insert({
          banner: banner || defaultBanner,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      settings = newSettings;
    } else {
      const { data: updatedSettings, error: updateError } = await supabase
        .from("settings")
        .update({
          banner: banner || settings.banner,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id)
        .select()
        .single();

      if (updateError) throw updateError;
      settings = updatedSettings;
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
