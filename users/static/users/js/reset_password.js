document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-password-form");
  const newPassInput = document.getElementById("new_password");
  const confirmPassInput = document.getElementById("confirm_password");
  const errorBox = document.getElementById("error");

  const loginUrl = window.loginUrl; // passed from template

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const email = new URLSearchParams(window.location.search).get("email");
    const resetToken = sessionStorage.getItem("reset_token"); // get token from previous step
    console.log("Reset Token:", resetToken);

    if (!resetToken) {
      errorBox.textContent = "Reset token not found. Please verify OTP again.";
      return;
    }

    if (newPassInput.value !== confirmPassInput.value) {
      errorBox.textContent = "Passwords do not match.";
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8001/users/reset-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          new_password: newPassInput.value,
          confirm_password: confirmPassInput.value,
          reset_token: resetToken
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        errorBox.textContent = data.error || "Reset failed.";
      } else {
        sessionStorage.removeItem("reset_token"); // clean up token
        window.location.href = loginUrl;
      }
    } catch {
      errorBox.textContent = "Network error. Try again.";
    }
  });
});
