"use client";
import AuthCard from "../ui/auth-card";
import ForgotPassForm from "./forgot-form";

const ForgotPasswordLayout = () => {
  return (
    <div>
      <AuthCard
        title="auth.forgot_password.title"
        children={<ForgotPassForm />}
      />
    </div>
  );
};

export default ForgotPasswordLayout;
