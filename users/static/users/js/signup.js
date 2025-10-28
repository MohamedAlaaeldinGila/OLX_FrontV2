document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form"); // your signup form
    const firstNameInput = document.getElementById("Firstname");
    const secondNameInput = document.getElementById("secondname");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    const loginBtn = document.getElementById("login-btn");
    const btnText = loginBtn.querySelector(".btn-text");
    const btnLoading = loginBtn.querySelector(".btn-loading");

    // Error containers
    const errors = {
        firstName: document.getElementById("firstname-error"),
        secondName: document.getElementById("secondname-error"),
        username: document.getElementById("username-error"),
        email: document.getElementById("email-error"),
        password: document.getElementById("password-error"),
        confirmPassword: document.getElementById("confirmPassword-error"),
    };

    const apiUrl = "http://127.0.0.1:8001/users/register/"; // your backend API

    console.log("Signup JS loaded");

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Reset previous errors
        Object.values(errors).forEach(err => err.textContent = "");

        const firstName = firstNameInput.value.trim();
        const secondName = secondNameInput.value.trim();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        let valid = true;

        // Validation checks
        if (!firstName) {
            errors.firstName.textContent = "First name is required.";
            valid = false;
        }
        if (!secondName) {
            errors.secondName.textContent = "Second name is required.";
            valid = false;
        }
        if (!username) {
            errors.username.textContent = "Username is required.";
            valid = false;
        }
        if (!isValidEmail(email)) {
            errors.email.textContent = "Please enter a valid email.";
            valid = false;
        }
        if (password.length < 6) {
            errors.password.textContent = "Password must be at least 6 characters.";
            valid = false;
        }
        if (password !== confirmPassword) {
            errors.confirmPassword.textContent = "Passwords do not match.";
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
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: secondName,
                    username,
                    email,
                    password,
                    password2: confirmPassword,

                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.log("Backend returned:", data);
                if (data.detail) {
                    errors.password.textContent = data.detail;
                } else {
                    let foundError = false;
                    Object.entries(data).forEach(([field, messages]) => {
                        if (errors[field]) {
                            errors[field].textContent = Array.isArray(messages)
                                ? messages.join(" ")
                                : messages;
                            foundError = true;
                        }
                    });

                    // fallback if no field-specific errors found
                    if (!foundError) {
                        errors.password.textContent = "Signup failed. Please check your inputs.";
                    }
                }
            } else {
                window.location.href = loginUrl;
            }

        } catch (error) {
            console.error("Signup error:", error);
            errors.password.textContent = "Network error. Please try again.";
        } finally {
            // Reset button
            btnText.style.display = "inline";
            btnLoading.style.display = "none";
            loginBtn.disabled = false;
        }
    });
});
