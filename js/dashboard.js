const links = document.querySelectorAll(".nav-link");
const panels = document.querySelectorAll(".section-panel");
const title = document.querySelector(".topbar h2");

links.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    links.forEach(function (l) { l.classList.remove("active"); });
    panels.forEach(function (p) { p.classList.remove("active"); });

    link.classList.add("active");
    document.getElementById("section-" + link.dataset.section).classList.add("active");
    title.textContent = link.textContent.trim();
  });
});