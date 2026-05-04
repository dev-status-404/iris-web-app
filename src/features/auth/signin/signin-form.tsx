"use client";

import React from "react";
import { Button, Divider, Form, Input, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import { useGoogleSignin, useLogin } from "../hooks";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/slices/user/user-slice";
import { persistor } from "@/redux/store";
import { useRouter } from "next/navigation";
import { setAuthCookies } from "@/lib/cookies";
import { GoogleLogin } from "@react-oauth/google";

const { Link, Text } = Typography;

const SignInForm: React.FC = () => {
  const logInMutation = useLogin();
  const googleSigninMutation = useGoogleSignin();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = (values: { email: string; password: string }) => {
    logInMutation.mutateAsync(values, {
      onSuccess: async (data) => {
        const redirect = data.data.redirect;
        const userData = data.data.user;
        const token = data.data.token;

        setAuthCookies({
          accessToken: token,
          refreshToken: "",
        });

        // Dispatch user data to Redux
        dispatch(loginSuccess(userData));
        // Flush persistor to ensure state is saved before navigation
        await persistor.flush();
        // Small delay to ensure Redux state is persisted
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Navigate to dashboard
        router.replace(redirect);
      },
    });
  };

  const onGoogleSuccess = async (credentialResponse: any) => {
    await googleSigninMutation.mutateAsync(credentialResponse, {
      onSuccess: async (data) => {
        const redirect = data.data.redirect;
        const userData = data.data.user;
        const token = data.data.token;

        setAuthCookies({
          accessToken: token,
          refreshToken: "",
        });

        // Dispatch user data to Redux
        dispatch(loginSuccess(userData));
        // Flush persistor to ensure state is saved before navigation
        await persistor.flush();
        // Small delay to ensure Redux state is persisted
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Navigate to dashboard
        router.replace(redirect);
      },
    });
  };
  const onGoogleError = async () => {
    console.log("Login Failed");
  };

  return (
    <Form
      onFinish={handleSubmit}
      layout="vertical"
      size="large"
      requiredMark={false}
      className="auth-form"
    >
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_up.errors.email_required" />
            ),
          },
          {
            type: "email",
            message: (
              <FormattedMessage id="auth.sign_up.errors.invalid_email_format" />
            ),
          },
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-black/35" />}
          placeholder="xyz@gmail.com"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_in.errors.password_required" />
            ),
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="text-black/35" />}
          placeholder="*********"
          autoComplete="current-password"
        />
      </Form.Item>

      <div className="auth-links">
        <Link href="/auth/signup">
          <FormattedMessage id="auth.sign_in.dont_have_account" />
        </Link>
        <Link href="/auth/forgot-password">
          <FormattedMessage id="auth.sign_in.forgot_password" />
        </Link>
      </div>

      <Form.Item className="!mb-4">
        <Button
          disabled={logInMutation.isPending}
          loading={logInMutation.isPending}
          htmlType="submit"
          type="primary"
          className="auth-primary-button"
        >
          <FormattedMessage id="auth.sign_in.buttonCTA" />
        </Button>
      </Form.Item>

      <Divider className="auth-divider">
        <Text className="text-[12px]">
          <FormattedMessage id="auth.sign_in.strip_line" />
        </Text>
      </Divider>

      <div className="auth-google-wrap">
        <div>
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            useOneTap
          />
        </div>
      </div>
    </Form>
  );
};

export default SignInForm;
