document.addEventListener("DOMContentLoaded", () => {
  const currentYear = new Date().getFullYear();
  const footerText = document.querySelector(".site-footer p");

  if (footerText) {
    footerText.innerHTML = footerText.innerHTML.replace("2026", currentYear);
  }
});
