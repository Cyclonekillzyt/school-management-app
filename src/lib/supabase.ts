import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV } from "@/config/env";

export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_PUBLISHABLE_KEY,{
    auth:{
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    }
  }
);


