"use client";

import React from "react";
import { Button, Form, Input, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useSignUp } from "../hooks";
import { useSearchParams } from "next/navigation";

const { Link } = Typography;

type SignUpValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  invite_token?: string;
};

const SignUpForm: React.FC = () => {
  const intl = useIntl();
  const signupMutation = useSignUp();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") || undefined;
  const invitedEmail = searchParams.get("email") || undefined;

  const handleSubmit = (values: SignUpValues) => {
    signupMutation.mutate({
      ...values,
      invite_token: inviteToken,
    });
  };

  return (
    <Form<SignUpValues>
      layout="vertical"
      size="large"
      requiredMark={false}
      onFinish={handleSubmit}
      initialValues={{ email: invitedEmail }}
      className="auth-form"
    >
      <Form.Item
        name="first_name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_up.errors.first_name_required" />
            )
          }
        ]}
      >
        <Input
          placeholder={intl.formatMessage({
            id: "auth.sign_up.placeholders.first_name"
          })}
          autoComplete="given-name"
        />
      </Form.Item>

      <Form.Item
        name="last_name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_up.errors.last_name_required" />
            )
          }
        ]}
      >
        <Input
          placeholder={intl.formatMessage({
            id: "auth.sign_up.placeholders.last_name"
          })}
          autoComplete="family-name"
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_up.errors.email_required" />
            )
          },
          {
            type: "email",
            message: (
              <FormattedMessage id="auth.sign_up.errors.invalid_email_format" />
            )
          }
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-black/35" />}
          placeholder={intl.formatMessage({
            id: "auth.sign_up.placeholders.email"
          })}
          autoComplete="email"
          disabled={Boolean(invitedEmail)}
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_up.errors.password_required" />
            )
          },
          {
            min: 8,
            message: (
              <FormattedMessage id="auth.sign_up.errors.password_too_short" />
            )
          }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="text-black/35" />}
          placeholder={intl.formatMessage({
            id: "auth.sign_up.placeholders.password"
          })}
          autoComplete="new-password"
        />
      </Form.Item>

      <div className="auth-links auth-links-end">
        <Link href={inviteToken ? `/auth/signin?invite=${encodeURIComponent(inviteToken)}` : "/auth/signin"}>
          <FormattedMessage id="auth.sign_up.have_account" />
        </Link>
      </div>

      <Form.Item className="!mb-4">
        <Button
          htmlType="submit"
          loading={signupMutation.isPending}
          disabled={signupMutation.isPending}
          type="primary"
          className="auth-primary-button"
        >
          <FormattedMessage id="auth.sign_up.buttonCTA" />
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SignUpForm;
