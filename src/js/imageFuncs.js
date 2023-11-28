import { supabase } from "./supabaseClient";

export const getImage = (imageId) => {
    return `https://myzwukslktjvjnsckhhh.supabase.co/storage/v1/object/public/media/${imageId}`
}

function extractFileNameFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 1];
}

export const removeImage = async (imageId, ) => {
    const { delData, delError } = await supabase
        .storage
        .from('media')
        .remove([`${extractFileNameFromUrl(imageId)}`])
    if (delError) return delError
    console.log(delData || delError);
}

export const postImage = async (file, imageId) => {
    const { uplData, uplError } = await supabase
        .storage
        .from("media")
        .upload(`${imageId}`, file)
    if (uplError) return uplError
    console.log(uplData || uplError);
}
