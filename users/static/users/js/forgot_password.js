document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot-form");
  const emailInput = document.getElementById("email");
  const errorBox = document.getElementById("error");

  const verify_reset_otpUrl = window.verify_reset_otpUrl; // or use the variable from template

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    try {
      const response = await fetch("http://127.0.0.1:8001/users/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value }),
      });

      const data = await response.json();
      if (!response.ok) {
        errorBox.textContent = data.error || "Something went wrong.";
      } else {
        window.location.href = `${window.verify_reset_otpUrl}?email=${encodeURIComponent(emailInput.value)}`;
      }
    } catch {
      errorBox.textContent = "Network error. Please try again.";
    }
  });
});
