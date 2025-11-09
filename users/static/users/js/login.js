document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");
    const loginBtn = document.getElementById("login-btn");
    const btnText = loginBtn.querySelector(".btn-text");
    const btnLoading = loginBtn.querySelector(".btn-loading");

    const apiUrl = "http://127.0.0.1:8001/users/login/";
    const profileUrl = "http://127.0.0.1:8001/users/profile/"; // endpoint to check if user is logged in

    console.log("Login JS loaded");

    // --- Check if user is already logged in ---
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
        try {
            const resp = await fetch(profileUrl, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            });
            if (resp.ok) {
                // User is logged in → redirect to signup/dashboard
                console.log("User already logged in. Redirecting...");
                window.location.href = "http://127.0.0.1:8000/"
                return;
            } 
        } catch (err) {
            console.error("Error checking auth:", err);
        }
    }

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
                    "X-CSRFToken": getCSRFToken(),
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.detail) {
                    passwordError.textContent = data.detail;
                } else {
                    passwordError.textContent = "Invalid email or password.";
                }
            } else {
                const access = data.tokens?.access;
                const refresh = data.tokens?.refresh;

                if (access && refresh) {
                    localStorage.setItem("access", access);
                    localStorage.setItem("refresh", refresh);
                    console.log("✅ Tokens saved to localStorage");
                } else {
                    console.warn("⚠️ No tokens found in response:", data);
                }

                window.location.href = loginUrl; // redirect after login
            }
        } catch (error) {
            console.error("Login error:", error);
            passwordError.textContent = "Network error. Please try again.";
        } finally {
            btnText.style.display = "inline";
            btnLoading.style.display = "none";
            loginBtn.disabled = false;
        }
    });
});

function getCSRFToken() {
    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="));
    return cookieValue ? cookieValue.split("=")[1] : "";
}
