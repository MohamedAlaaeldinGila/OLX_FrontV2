document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("verify-otp-form");
  const codeInput = document.getElementById("otp");
  const errorBox = document.getElementById("error");

  const resetPasswordUrl = window.resetPasswordUrl; // pass from template

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const email = new URLSearchParams(window.location.search).get("email");

    try {
      const response = await fetch("http://127.0.0.1:8001/users/verify-reset-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp_code: codeInput.value
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        errorBox.textContent = data.error || "OTP verification failed.";
      } else {
        // ✅ Store reset token in sessionStorage
        sessionStorage.setItem("reset_token", data.reset_token);

        // Redirect to reset password page
        window.location.href = `${resetPasswordUrl}?email=${encodeURIComponent(email)}`;
      }
    } catch {
      errorBox.textContent = "Network error. Try again.";
    }
  });
});
