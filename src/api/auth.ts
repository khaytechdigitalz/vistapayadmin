import {apiClient} from "@/lib/axios";

export interface DashboardData {
  profile: []; 
}
 


export async function fetchCurrentUser() {
  return apiClient.get<{ status: boolean; message: string; data: DashboardData }>("/dashboard");
}
 

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function registerUser(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}) {
  const response = await apiClient.post("/auth/register", data);
  return response.data;
}

export async function verifyEmail(data: { email: string; otp: string }) {
  const response = await apiClient.post("/auth/register/verify/email", data);
  return response.data;
}

export async function resendVerification(email: string) {
  const response = await apiClient.post("/auth/resend-verification", { email });
  return response.data;
}

export async function loginUser(credentials: LoginCredentials) {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
}

export async function verifyLogin2fa(payload: { token: string; one_time_password: string }) {
  const response = await apiClient.post("/auth/login/2fa", payload);
  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await apiClient.post("/auth/forgotpassword", { email });
  return response.data;
}
export async function verifyOtp(data: { email: string; otp: string }) {
  const response = await apiClient.post("/auth/otp/verify", data);
  return response.data;
}
export async function resetPassword(data: {
  email: string;
  password: string;
  password_confirmation: string;
  otp: string;
}) {
  const response = await apiClient.post("/auth/resetpassword", data);
  return response.data;
}