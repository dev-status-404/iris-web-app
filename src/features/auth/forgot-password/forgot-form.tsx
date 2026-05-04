"use client";

import React from "react";
import { Button, Form, Input, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import { useForgotPassword } from "@/features/auth/hooks";
const { Link } = Typography;

const ForgotPassForm: React.FC = () => {
  const forgotPassMutation = useForgotPassword();

  const handleSubmit = (values: { email: string }) => {
    forgotPassMutation.mutateAsync(values);
    forgotPassMutation.isSuccess && localStorage.setItem("email", values.email);
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

      <div className="auth-links">
        <Link href="/auth/signup">
          <FormattedMessage id="auth.sign_in.dont_have_account" />
        </Link>
      </div>

      <Form.Item className="!mb-4">
        <Button
          loading={forgotPassMutation.isPending}
          htmlType="submit"
          type="primary"
          className="auth-primary-button"
        >
          <FormattedMessage id="auth.forgot_password.buttonCTA" />
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ForgotPassForm;
