console.log("nav.js loaded");

async function initNav() {
    const token = localStorage.getItem("access");
    const signupLink = document.getElementById("signup-link");
    const navIcons = document.getElementById("nav-icons");

    if (!token || !signupLink || !navIcons) {
        console.log("Navbar elements not found, retrying...");
        // Retry after 100ms
        setTimeout(initNav, 100);
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:8001/users/profile/", {
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (!res.ok) return;

        // Replace Sign Up with logout
        signupLink.outerHTML = `
            <li class="nav-item">
              <a href="#" id="logout-link">Logout</a>
            </li>
        `;

        // Show nav icons
        navIcons.style.display = "flex";
        console.log("Navbar updated");

        // Attach logout functionality
        const logoutLink = document.getElementById("logout-link");
        if (logoutLink) {
            logoutLink.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.href = loginurl;
            });
        }

    } catch (err) {
        console.error(err);
    }
}

initNav();
