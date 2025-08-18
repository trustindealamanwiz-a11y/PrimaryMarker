// script.js

document.addEventListener("DOMContentLoaded", () => {
    // Example: Step navigation
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

    // Countdown (updates every 2 sec)
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

    // Toast Example
    function showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add("fade-out"), 3000);
        setTimeout(() => toast.remove(), 4000);
    }

    // Example usage:
    // showToast("Form loaded successfully", "success");
});
