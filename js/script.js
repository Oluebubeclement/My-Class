/* script.js - common frontend JS for TechSphere */
const APPS_SCRIPT_BASE = "YOUR_APPS_SCRIPT_WEB_APP_URL"; // ← REPLACE with the deployed Apps Script web app URL

/* Utility: postForm(action, data) -> calls Apps Script */
async function postForm(action, data) {
  const form = new FormData();
  form.append("action", action);
  Object.keys(data).forEach(k => {
    if (data[k] !== undefined && data[k] !== null) form.append(k, data[k]);
  });
  const resp = await fetch(APPS_SCRIPT_BASE, {
    method: "POST",
    body: form
  });
  return await resp.json();
}

/* Registration handler for register.html */
async function handleRegisterForm(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const course = form.course.value;
  const amount = form.amount.value || "";
  // If the user checks "I have paid", we flag paymentStatus = "Paid"
  const paid = form.paid && form.paid.checked;
  const paymentStatus = paid ? "Paid" : "Pending";

  const payload = { name, email, phone, course, amount, paymentStatus, paymentMethod: "Bank Transfer" };
  try {
    const res = await postForm("register", payload);
    if (res && res.success) {
      if (res.redirect) {
        // If payment confirmed, redirect to WhatsApp group
        window.location.href = res.redirect;
      } else {
        alert("Registration saved. Please complete payment using the bank details shown. After payment, click the WhatsApp group link on the Contact page.");
        // Optionally clear form
        form.reset();
      }
    } else {
      alert("There was an error saving your registration. Try again.");
    }
  } catch (err) {
    console.error(err);
    alert("Network error. Try again later.");
  }
}

/* Review submission handler for reviews.html */
async function handleReviewForm(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim() || "Anonymous";
  const review = form.review.value.trim();
  const rating = form.rating.value || "";
  try {
    const res = await postForm("submitReview", { name, review, rating });
    if (res && res.success) {
      alert("Thank you! Your review was submitted.");
      form.reset();
      loadReviews(); // refresh list
    } else {
      alert("Error submitting review.");
    }
  } catch (err) {
    console.error(err);
    alert("Network error. Try again later.");
  }
}

/* Load reviews from Apps Script: GET ?page=getReviews */
async function loadReviews() {
  try {
    const res = await fetch(APPS_SCRIPT_BASE + "?page=getReviews");
    const reviews = await res.json();
    const container = document.getElementById("reviewsList");
    if (!container) return;
    container.innerHTML = "";
    if (!reviews || reviews.length === 0) {
      container.innerHTML = "<p>No reviews yet — be the first!</p>";
      return;
    }
    reviews.reverse().forEach(r => {
      const el = document.createElement("div");
      el.className = "review";
      el.innerHTML = `<strong>${escapeHtml(r.name)}</strong> <small>⭐ ${escapeHtml(r.rating)}</small><p>${escapeHtml(r.review)}</p>`;
      container.appendChild(el);
    });
  } catch (err) {
    console.error("Error loading reviews:", err);
  }
}

/* small helper to avoid injection in dynamic HTML */
function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/[&<>"'`]/g, function (m) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" })[m];
  });
}

/* DOM ready bindings (if pages include forms with these IDs) */
document.addEventListener("DOMContentLoaded", () => {
  const regForm = document.getElementById("registerForm");
  if (regForm) regForm.addEventListener("submit", handleRegisterForm);

  const revForm = document.getElementById("reviewForm");
  if (revForm) revForm.addEventListener("submit", handleReviewForm);

  if (document.getElementById("reviewsList")) loadReviews();
});


