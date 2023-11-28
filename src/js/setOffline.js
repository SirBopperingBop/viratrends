import { supabase } from "./supabaseClient";

const setOffline = async () => {
    try {
        const { data, error } = await supabase
            .from("users")
            .update({ is_online: false })
            .eq("username", logInfo.username);
        console.log(data, error);
    } catch (error) {
        console.log(error)
    }
    console.log("offline");
  }