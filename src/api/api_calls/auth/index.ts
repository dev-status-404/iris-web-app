import { GenericResponse } from "@/types/api";
import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";

type RegisterInput = {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type VerifyOtpInput = {
  email: string;
  otp: string;
};

type ForgotPasswordInput = {
  email: string;
};

type ResetPasswordInput = {
  email: string;
  otp: string;
  newPassword: string;
};

type GoogleSignInInput = {
  credential: string;
};

export async function Register(input: {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.signup, input);
  return data;
}

export async function VerifyOTP(input: VerifyOtpInput): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.verifyOtp, input);
  return data;
}

export async function Login(input: LoginInput): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.signin, input);
  return data;
}

export async function GoogleSignIn(input: GoogleSignInInput): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.google, input);
  return data;
}

export async function ResendOTP(input: ForgotPasswordInput): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.resendOtp, input);
  return data;
}

export async function ForgotPassword(input: ForgotPasswordInput): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.forgot_password, input);
  return data;
}

export async function ResetPassword(input: ResetPasswordInput): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.reset_password, input);
  return data;
}