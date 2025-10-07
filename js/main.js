// js/main.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzWffGbdyLO_JV1tDla_nvZjFsgUK_1ujHVwPpf7P2eEracowRM0nFZ4leOxVYPQ-3y/exec"; // <-- Replace this with your Apps Script exec URL
const WHATSAPP_LINK = "https://chat.whatsapp.com/F8alWo3bj8E98p5ORpTQKC";

/* Utility to POST JSON */
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

/* Load reviews on reviews page */
async function loadReviews() {
  try {
    const res = await fetch(SCRIPT_URL + "?action=getReviews");
    const reviews = await res.json();
    const container = document.getElementById("reviewsList");
    if (!container) return;
    if (!Array.isArray(reviews) || reviews.length === 0) {
      container.innerHTML = "<p>No reviews yet. Be the first to leave a review!</p>";
      return;
    }
    container.innerHTML = reviews.map(r => `
      <div class="review-card">
        <strong>${escapeHtml(r.name || "Anonymous")}</strong> • <small>${new Date(r.timestamp).toLocaleString()}</small>
        <p>${escapeHtml(r.comment || "")}</p>
        <small>Rating: ${escapeHtml(r.rating || "")}/5</small>
      </div>
    `).join("");
  } catch (err) {
    console.error("Error loading reviews:", err);
  }
}

/* Escape helper */
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* Setup event listeners after DOM loaded */
document.addEventListener("DOMContentLoaded", () => {
  // Registration form
  const regForm = document.getElementById("registrationForm");
  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(regForm).entries());
      data.type = "register";
      try {
        const resp = await postJSON(SCRIPT_URL, data);
        if (resp && resp.status === "success") {
          alert("Registration saved. You will be redirected to the WhatsApp group.");
          // open whatsapp link in new tab and also navigate to payment page locally
          window.open(resp.whatsapp || WHATSAPP_LINK, "_blank");
          window.location.href = "payment.html";
        } else {
          alert("Could not save registration: " + (resp.message || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        alert("Error submitting registration — check console.");
      }
    });
  }

  // Review form
  const revForm = document.getElementById("reviewForm");
  if (revForm) {
    revForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(revForm).entries());
      data.type = "review";
      try {
        const resp = await postJSON(SCRIPT_URL, data);
        if (resp && resp.status === "success") {
          alert("Thanks — your review has been submitted.");
          revForm.reset();
          // reload reviews list if present
          await loadReviews();
        } else {
          alert("Could not save review: " + (resp.message || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        alert("Error submitting review — check console.");
      }
    });
  }

  // Load reviews on reviews page
  if (document.getElementById("reviewsList")) {
    loadReviews();
  }
});
