// script.js

document.addEventListener("DOMContentLoaded", () => {
    // ================================
    // Step navigation
    // ================================
    const steps = document.querySelectorAll(".step");
    const stepCards = document.querySelectorAll(".step-card");

    let currentStep = 0;

    function showStep(index) {
        stepCards.forEach((card, i) => {
            card.classList.toggle("hidden", i !== index);
        });
        steps.forEach((step, i) => {
            step.classList.remove("active", "completed");
            if (i < index) step.classList.add("completed");
            if (i === index) step.classList.add("active");
        });
    }

    document.querySelectorAll("[data-next]").forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStep < stepCards.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    document.querySelectorAll("[data-prev]").forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // ================================
    // Countdown (updates every 2 sec)
    // ================================
    const countdownEl = document.getElementById("countdown");
    if (countdownEl) {
        let timeLeft = 60;
        setInterval(() => {
            if (timeLeft > 0) {
                timeLeft -= 2;
                countdownEl.textContent = `Refreshing in ${timeLeft}s`;
            }
        }, 2000);
    }

    // ================================
    // Toast Notifications
    // ================================
    function showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add("fade-out"), 3000);
        setTimeout(() => toast.remove(), 4000);
    }

    // ================================
    // Google Login + Expiry + Retry
    // ================================
    const allowedEmails = [
        "rajsingh8112812272@gmail.com",
        "trustindeal.amanwiz@gmail.com",
        "mrityunjaykumar7602@gmail.com",
        "4278146@gmail.com",
        "manojbaba231352@gmail.com",
        "shahzebahad2024@gmail.com"
    ];

    const LOGIN_EXPIRY_MINUTES = 60;
    const retryBtn = document.getElementById("retryBtn");

    // Parse JWT
    function parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    // Handle Google login response
    window.handleCredentialResponse = function (response) {
        const data = parseJwt(response.credential);
        const userEmail = data.email;

        if (!allowedEmails.includes(userEmail)) {
            document.getElementById("deniedMsg").classList.remove("hidden");
            if (retryBtn) retryBtn.classList.remove("hidden");
            showToast("Login failed. Unauthorized email.", "error");
            return;
        }

        // Save login
        localStorage.setItem("loggedInUser", userEmail);
        localStorage.setItem("loginTime", Date.now());

        showForm(userEmail);
        showToast("Login successful", "success");
    };

    // Show form
    function showForm(userEmail) {
        document.querySelector("input[name='email']").value = userEmail;
        document.getElementById("whoami").innerText = "Signed in as: " + userEmail;
        document.getElementById("signinCard").classList.add("hidden");
        document.getElementById("formCard").classList.remove("hidden");
        if (retryBtn) retryBtn.classList.add("hidden");
    }

    // Retry login manually
    window.retryLogin = function () {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("loginTime");
        location.reload();
    };

    // On page load → check login
    function checkLogin() {
        const savedUser = localStorage.getItem("loggedInUser");
        const savedTime = localStorage.getItem("loginTime");

        if (savedUser && savedTime) {
            const elapsed = (Date.now() - parseInt(savedTime, 10)) / (1000 * 60);
            if (elapsed < LOGIN_EXPIRY_MINUTES && allowedEmails.includes(savedUser)) {
                showForm(savedUser);
                return;
            } else {
                localStorage.removeItem("loggedInUser");
                localStorage.removeItem("loginTime");
            }
        }

        // Initialize Google Sign-in
        google.accounts.id.initialize({
            client_id: "599836800018-6df1f03d2l70q5aoncd0s3b99j72je38.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("signinBtn"),
            { theme: "outline", size: "large" }
        );
    }

    checkLogin();
});
