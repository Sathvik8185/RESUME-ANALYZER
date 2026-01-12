document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "component/header.html");
  loadComponent("footer", "component/footer.html");
});

function loadComponent(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    })
    .catch(err => console.error("Load error:", err));
}
