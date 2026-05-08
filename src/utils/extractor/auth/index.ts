function normalizeMessage(value: string): string {
  return value.trim().toLowerCase();
}

// Helper to extract error message KEY
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = normalizeMessage(error.message);

    if (message.includes("user-already-verified"))
      return "auth.messages.errors.user_already_verified";

    if (
      message.includes("user-not-found") ||
      message.includes("user not found")
    )
      return "auth.messages.errors.user_not_found";

    if (
      message.includes("invalid-credentials") ||
      message.includes("invalid email or password")
    )
      return "auth.messages.errors.invalid_email_or_password";

    if (message.includes("account-deleted"))
      return "auth.messages.errors.account_deleted";

    if (
      message.includes("account-blocked") ||
      message.includes("account is blocked") ||
      message.includes("user account is blocked")
    )
      return "auth.messages.errors.account_blocked";

    if (message.includes("account-not-verified"))
      return "auth.messages.errors.account_not_verified";

    if (message.includes("wrong-password"))
      return "auth.messages.errors.incorrect_password";

    if (
      message.includes("email-already-exists") ||
      message.includes("user-already-exists")
    )
      return "auth.messages.errors.email_already_exists";

    if (message.includes("invalid-otp") || message.includes("invalid otp"))
      return "auth.messages.errors.invalid_otp";

    if (message.includes("auth/weak-password"))
      return "auth.messages.errors.weak_password_6";

    if (message.includes("auth/too-many-requests"))
      return "auth.messages.errors.too_many_attempts";

    if (message.includes("google-signin-failed"))
      return "auth.messages.errors.google_signin_failed";

    if (
      message.includes("authentication required") ||
      message.includes("subscription check required")
    )
      return "auth.messages.errors.subscription_check_required";

    if (
      message.includes("no active subscription") ||
      message.includes("subscription inactive") ||
      message.includes("active subscription")
    )
      return "auth.messages.errors.no_active_subscription";

    if (
      message.includes("free trial has expired") ||
      message.includes("trial expired")
    )
      return "auth.messages.errors.free_trial_expired";

    if (
      message.includes("cannot change plan on a free trial") ||
      message.includes("please subscribe first")
    )
      return "auth.messages.errors.cannot_change_free_trial";

    if (
      message.includes("cannot cancel a free-trial") ||
      message.includes("cannot cancel a free trial")
    )
      return "auth.messages.errors.cannot_cancel_free_trial";

    if (message.includes("already on this plan"))
      return "auth.messages.errors.already_on_plan";

    if (
      message.includes("invalid plan") ||
      message.includes("plan") && message.includes("not found")
    )
      return "auth.messages.errors.plan_not_found";

    if (
      message.includes("not configured in stripe") ||
      message.includes("has no stripe price configured") ||
      message.includes("stripe_secret_key") ||
      message.includes("stripe secret")
    )
      return "auth.messages.errors.plan_not_configured";

    if (
      message.includes("no stripe customer associated") ||
      message.includes("failed to open billing portal")
    )
      return "auth.messages.errors.billing_portal_unavailable";

    if (
      message.includes("failed to start checkout") ||
      message.includes("checkout")
    )
      return "auth.messages.errors.checkout_failed";

    if (
      message.includes("failed to change plan") ||
      message.includes("change plan")
    )
      return "auth.messages.errors.plan_change_failed";

    if (
      message.includes("failed to cancel subscription") ||
      message.includes("cancel subscription")
    )
      return "auth.messages.errors.subscription_cancel_failed";

    if (
      message.includes("insufficient credits") ||
      message.includes("used all your scraping credits") ||
      message.includes("credit") && message.includes("remaining")
    )
      return "auth.messages.errors.insufficient_credits";

    if (
      message.includes("credits") && message.includes("positive") ||
      message.includes("amount must be positive")
    )
      return "auth.messages.errors.invalid_credit_amount";

    if (message.includes("maximum") && message.includes("campaign"))
      return "auth.messages.errors.campaign_limit_reached";

    if (
      message.includes("maximum") && message.includes("smtp") ||
      message.includes("smtp domain")
    )
      return "auth.messages.errors.smtp_limit_reached";

    if (
      message.includes("payment required") ||
      message.includes("please choose a plan") ||
      message.includes("please upgrade your plan") ||
      message.includes("upgrade your plan")
    )
      return "auth.messages.errors.plan_upgrade_required";

    if (
      message.includes("payment integration") ||
      message.includes("integration not found") ||
      message.includes("verification failed") ||
      message.includes("unsupported provider")
    )
      return "auth.messages.errors.payment_integration_failed";
  }

  return "auth.messages.errors.unexpected_error";
}

// Helper to extract success message KEY
function getSuccessMessage(message: unknown): string {
  if (typeof message === "string") {
    const normalizedMessage = normalizeMessage(message);

    if (
      normalizedMessage.includes("password-reset-email-sent") ||
      normalizedMessage.includes("password reset otp sent successfully")
    )
      return "auth.messages.success.password_reset_email_sent";

    if (
      normalizedMessage.includes("account-created") ||
      normalizedMessage.includes("user registered successfully")
    )
      return "auth.messages.success.account_created";

    if (
      normalizedMessage.includes("signed-in-successfully") ||
      normalizedMessage.includes("login successful")
    )
      return "auth.messages.success.signed_in_successfully";

    if (normalizedMessage.includes("signed-out-successfully"))
      return "auth.messages.success.signed_out_successfully";

    if (
      normalizedMessage.includes("password-updated") ||
      normalizedMessage.includes("password reset successfully")
    )
      return "auth.messages.success.password_updated";

    if (
      normalizedMessage.includes("google-signin-success") ||
      normalizedMessage.includes("google login successful")
    )
      return "auth.messages.success.google_signin_success";

    if (
      normalizedMessage.includes("plan changed successfully") ||
      normalizedMessage.includes("subscription updated") ||
      normalizedMessage.includes("updated subscription")
    )
      return "auth.messages.success.plan_changed";

    if (
      normalizedMessage.includes("subscription will be cancelled") ||
      normalizedMessage.includes("subscription canceled") ||
      normalizedMessage.includes("subscription cancelled")
    )
      return "auth.messages.success.subscription_cancelled";

    if (
      normalizedMessage.includes("free trial started") ||
      normalizedMessage.includes("trialing")
    )
      return "auth.messages.success.free_trial_started";

    if (
      normalizedMessage.includes("credits added") ||
      normalizedMessage.includes("credits deducted") ||
      normalizedMessage.includes("balance retrieved") ||
      normalizedMessage.includes("ledger retrieved")
    )
      return "auth.messages.success.credits_updated";

    if (
      normalizedMessage.includes("payment integration connected") ||
      normalizedMessage.includes("payment integration updated") ||
      normalizedMessage.includes("payment integration verified")
    )
      return "auth.messages.success.payment_integration_updated";
  }

  return "auth.messages.success.operation_successful";
}

export { getErrorMessage, getSuccessMessage };
