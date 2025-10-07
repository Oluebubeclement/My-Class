const scriptURL = "YOUR_SCRIPT_URL"; // Replace with your Apps Script link

document.querySelectorAll("form").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify(data)
    }).then(() => {
      alert("Form submitted successfully!");
      if (data.type === "registration") {
        window.location.href = "https://chat.whatsapp.com/F8alWo3bj8E98p5ORpTQKC";
      }
      form.reset();
    }).catch(() => alert("Error submitting form. Try again."));
  });
});

