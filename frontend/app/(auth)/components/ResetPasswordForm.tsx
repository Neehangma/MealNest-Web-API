export default function ResetPasswordForm() {
  return (
    <main className="login-wrapper">
      <section className="auth-form-card">
        <h1>Reset Password</h1>
        <p>Enter your email address to request a password reset.</p>
        <form>
          <label>Email</label>
          <input type="email" placeholder="Enter email" />
          <button type="submit">Send Reset Link</button>
        </form>
      </section>
    </main>
  );
}
