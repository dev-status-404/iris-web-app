"use client";

import React from "react";
import Image from "next/image";
import { FormattedMessage } from "react-intl";
import lightLogo from "../../../../public/assets/PNGs/logo.png";
import darkLogo from "../../../../public/assets/PNGs/logo_dark.png";

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
          <Image
            src={lightLogo}
            alt=""
            width={126}
            height={48}
            className="h-auto w-[126px] object-contain dark:hidden"
            priority
          />
          <Image
            src={darkLogo}
            alt=""
            width={126}
            height={48}
            className="hidden h-auto w-[126px] object-contain dark:block"
            priority
          />
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
          <Image
            src={lightLogo}
            alt="DataHarvX"
            width={116}
            height={44}
            className="mx-auto h-auto w-[116px] object-contain dark:hidden lg:hidden"
            priority
          />
          <Image
            src={darkLogo}
            alt="DataHarvX"
            width={116}
            height={44}
            className="mx-auto hidden h-auto w-[116px] object-contain dark:block lg:hidden"
            priority
          />

          <div className="auth-title-group">
            <p className="auth-kicker lg:hidden">
              <FormattedMessage id="auth.common.workspace" />
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
