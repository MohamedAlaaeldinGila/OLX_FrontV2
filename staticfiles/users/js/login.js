document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");
    const loginBtn = document.getElementById("login-btn");
    const btnText = loginBtn.querySelector(".btn-text");
    const btnLoading = loginBtn.querySelector(".btn-loading");

    const apiUrl = "http://127.0.0.1:8001/users/login/";

    console.log("Login JS loaded");

    // Email validation
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Reset errors
        emailError.textContent = "";
        passwordError.textContent = "";

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        let valid = true;

        if (!isValidEmail(email)) {
            emailError.textContent = "Please enter a valid email.";
            valid = false;
        }
        if (password.length < 6) {
            passwordError.textContent = "Password must be at least 6 characters.";
            valid = false;
        }

        if (!valid) return;

        // Show loading
        btnText.style.display = "none";
        btnLoading.style.display = "flex";
        loginBtn.disabled = true;

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(), // only needed if it’s same-origin Django view
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle API errors
                if (data.detail) {
                    passwordError.textContent = data.detail;
                } else {
                    passwordError.textContent = "Invalid email or password.";
                }
            } else {
                // ✅ Successful login
                localStorage.setItem("token", data.token); // save token if JWT
                window.location.href = "/users/home/"; // redirect to home
            }
        } catch (error) {
            console.error("Login error:", error);
            passwordError.textContent = "Network error. Please try again.";
        } finally {
            // Reset button
            btnText.style.display = "inline";
            btnLoading.style.display = "none";
            loginBtn.disabled = false;
        }
    });
});

// --- Utility: CSRF helper (for Django API views if not JWT) ---
function getCSRFToken() {
    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="));
    return cookieValue ? cookieValue.split("=")[1] : "";
}
