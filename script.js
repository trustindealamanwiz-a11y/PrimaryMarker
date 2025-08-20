// Parse JWT to extract user info from Google credential
function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
  return JSON.parse(jsonPayload);
}

// Google Sign-In callback
function handleCredentialResponse(response) {
  const payload = parseJwt(response.credential);
  const email = payload.email || "";

  // ✅ Direct allow any email
  document.querySelector('[name="email"]').value = email;
  document.getElementById("whoami").innerHTML = `Fiber line marking`;
  document.getElementById("deniedMsg").classList.add("hidden");
  document.getElementById("signinCard").classList.add("hidden");
  document.getElementById("formCard").classList.remove("hidden");

  // Save to local storage
  localStorage.setItem("loggedInEmail", email);
  localStorage.setItem("loginTime", Date.now());
}

// Auto detect location
function autoDetectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        document.getElementById("latitude").value = pos.coords.latitude;
        document.getElementById("longitude").value = pos.coords.longitude;
      },
      function (err) {
        console.warn("Location access denied:", err.message);
      }
    );
  }
}

// Attach submit handler after DOM load
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("dataForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(form);

      fetch(form.action, {
        method: "POST",
        body: formData
      })
        .then((res) => res.text())
        .then((msg) => alert("Submitted: " + msg))
        .catch((err) => console.error("Error:", err));
    });
  }

  // auto detect location when form is loaded
  autoDetectLocation();
});
