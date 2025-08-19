const allowedEmails = ["shahzebahmad2024@gmail.com", "trustindeal.amanwiz@gmail.com"];
const scriptURL = "https://script.google.com/macros/s/AKfycbyb0CI0mL5nkHmLjYm_AYwgZyhcmefGGJ85NAvsLrbQGLa-oaoy0no_q0A9Ky-PIqh6kw/exec";
const clientID = "599836800018-6df1f03d2l70q5aoncd0s3b99j72je38.apps.googleusercontent.com";

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

function handleCredentialResponse(response) {
  const payload = parseJwt(response.credential);
  const email = payload.email || "";
  if (allowedEmails.includes(email)) {
    document.querySelector('[name="email"]').value = email;
    document.getElementById("whoami").innerHTML = `Fiber line marking`;
    document.getElementById("deniedMsg").classList.add("hidden");
    document.getElementById("signinCard").classList.add("hidden");
    document.getElementById("formCard").classList.remove("hidden");
    localStorage.setItem('loggedInEmail', email);
    localStorage.setItem('loginTime', Date.now());
  } else {
    document.getElementById("deniedMsg").classList.remove("hidden");
  }
}

function autoDetectLocation() {
  if (!navigator.geolocation) {
    document.getElementById("locationRow").classList.remove("hidden");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      document.querySelector("[name=locationLink]").value =
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    },
    () => document.getElementById("locationRow").classList.remove("hidden"),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function compressImageToDataURL(file, maxKB = 500) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const scale = Math.min(1, Math.sqrt((maxKB * 1024) / (file.size || (img.width * img.height))));
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let quality = 0.75;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length / 1024 > maxKB && quality > 0.2) {
          quality -= 0.05;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function onSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const overlay = document.createElement("div");
  overlay.className = "spinner-overlay";
  overlay.innerHTML = '<div class="spinner"></div><div class="spinner-text">Submitting...</div>';
  document.body.appendChild(overlay);

  const p1 = form.photo1.files[0];
  const p2 = form.photo2.files[0];
  if (!p1 || !p2) {
    document.querySelector(".spinner-overlay")?.remove();
    showToast("❌ Both JC Photo and Area Photo are required", "error");
    return;
  }

  let photos;
  try {
    photos = [await compressImageToDataURL(p1, 500), await compressImageToDataURL(p2, 500)];
  } catch (err) {
    document.querySelector(".spinner-overlay")?.remove();
    showToast("❌ Image processing failed: " + err.message, "error");
    return;
  }

  const payload = {
    email: form.email.value,
    locationLink: form.locationLink.value,
    photos,
    jcname: form.jcname.value,
    splitter: form.splitter.value,
    wire: form.wire.value,
    wirecolor: form.wirecolor.value,
    linename: form.linename.value,
    drumno: form.drumno.value,
    remark: form.remark.value,
    startTime: form.startTime.value
  };

  fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(resp => {
    document.querySelector(".spinner-overlay")?.remove();
    if (resp.status === "success") {
      showToast("✅ Tagging submitted successfully!", "success");
      setTimeout(() => window.location.reload(), 2000);
    } else {
      showToast("❌ " + (resp.message || "Server error"), "error");
    }
  })
  .catch(err => {
    document.querySelector(".spinner-overlay")?.remove();
    showToast("❌ Network error: " + err, "error");
  });
}

function showToast(text, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function startTagging() {
  const submitBtn = document.getElementById('submitBtn');
  const startTimeField = document.querySelector('[name="startTime"]');
  const countdownEl = document.getElementById('countdown');
  const startBtn = document.getElementById('startTaggingBtn');
  const timerStart = Date.now();

  startTimeField.value = new Date().toISOString();
  submitBtn.disabled = true;
  startBtn.disabled = true;

  showToast("🕒 Please wait 60 seconds before submitting.", "info");

  const timer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - timerStart) / 1000);
    const remaining = 60 - elapsed;
    countdownEl.textContent = `(${remaining}s)`;
    if (remaining <= 0) {
      clearInterval(timer);
      submitBtn.disabled = false;
      countdownEl.textContent = "";
      showToast("✅ You can now submit the form.", "success");
    }
  }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  const loggedInEmail = localStorage.getItem('loggedInEmail');
  const loginTime = localStorage.getItem('loginTime');
  const oneHour = 3600000;

  if (loggedInEmail && loginTime && (Date.now() - loginTime < oneHour) && allowedEmails.includes(loggedInEmail)) {
    document.querySelector('[name="email"]').value = loggedInEmail;
    document.getElementById("whoami").innerHTML = `Fiber line marking`;
    document.getElementById("signinCard").classList.add("hidden");
    document.getElementById("formCard").classList.remove("hidden");
  } else {
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: clientID,
        callback: handleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("signinBtn"),
        { theme: "outline", size: "large", type: "standard", shape: "pill" }
      );
    }
  }

  document.getElementById("dataForm").addEventListener("submit", onSubmit);
  autoDetectLocation();

  const reloginBtn = document.getElementById("reloginBtn");
  if (reloginBtn) {
    reloginBtn.addEventListener('click', () => {
      google.accounts.id.prompt();
      document.getElementById("deniedMsg").classList.add("hidden");
    });
  }
});
