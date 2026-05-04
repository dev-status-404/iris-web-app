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
  }

  return "auth.messages.success.operation_successful";
}

export { getErrorMessage, getSuccessMessage };
