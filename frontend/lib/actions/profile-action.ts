"use server";

import { getProfile, updateProfile } from "@/services/profile-service";

export async function handleGetProfile() {
  return await getProfile();
}

export async function handleUpdateProfile(data: any) {
  return await updateProfile(data);
}