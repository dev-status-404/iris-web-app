"use client";

import React from "react";
import { FormattedMessage } from "react-intl";

type Props = {
  children: React.ReactNode;
  title: string;
};

const subtitleMap: Record<string, string> = {
  "auth.sign_in.sign_in_with_email": "auth.sign_in.subtitle",
  "auth.sign_up.sign_up_with_email": "auth.sign_up.subtitle",
  "auth.otp.title": "auth.otp.subtitle",
  "auth.reset_password.title": "auth.reset_password.subtitle",
};

const AuthCard = ({ children, title }: Props) => {
  const subtitle = subtitleMap[title];

  return (
    <div className="auth-frame">
      <aside className="auth-brand-panel" aria-hidden="true">
        <div className="auth-brand-mark">
          {/* <span className="auth-brand-wordmark">iriscalls</span> */}
        </div>

        <div className="auth-brand-copy">
          <p className="auth-kicker">
            <FormattedMessage id="auth.common.workspace" />
          </p>
          <h1>
            <FormattedMessage id="auth.common.headline" />
          </h1>
          <p>
            <FormattedMessage id="auth.common.description" />
          </p>
        </div>

        <div className="auth-brand-stats">
          <span>
            <strong>24/7</strong>
            <FormattedMessage id="auth.common.signal_one" />
          </span>
          <span>
            <strong>10x</strong>
            <FormattedMessage id="auth.common.signal_two" />
          </span>
        </div>
      </aside>

      <main className="auth-card">
        <div className="auth-card-header">
          <span className="auth-brand-wordmark !text-7xl lg:hidden">iriscalls</span>

          <div className="auth-title-group">
            <p className="auth-kicker lg:hidden">
              {/* <FormattedMessage id="auth.common.workspace" /> */}
            </p>
            <h2>
              <FormattedMessage id={title} />
            </h2>
            {subtitle ? (
              <p>
                <FormattedMessage id={subtitle} />
              </p>
            ) : null}
          </div>
        </div>

        <div className="auth-form-area">{children}</div>
      </main>
    </div>
  );
};

export default AuthCard;
