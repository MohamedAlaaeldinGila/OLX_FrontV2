document.addEventListener("DOMContentLoaded", () => {
  const otpForm = document.getElementById("otp-form");
  const otpInput = document.getElementById("otp");
  const otpError = document.getElementById("otp-error");
  const verifyBtn = document.getElementById("verify-btn");

  const apiUrl = "http://127.0.0.1:8001/users/verify-otp/";

  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    otpError.textContent = "";

    const email = new URLSearchParams(window.location.search).get("email");
    const otp = otpInput.value.trim();

    if (!otp) {
      otpError.textContent = "Please enter the OTP code.";
      return;
    }

    verifyBtn.disabled = true;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        otpError.textContent = data.error || "Invalid OTP.";
      } else {
        window.location.href = "http://127.0.0.1:8000/users/login/";
      }
    } catch (err) {
      otpError.textContent = "Network error. Try again.";
    } finally {
      verifyBtn.disabled = false;
    }
  });
});
