const navLinks = document.querySelectorAll(".nav-link");
const sectionPanels = document.querySelectorAll(".section-panel");
const pageTitle = document.querySelector(".topbar h2");

navLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    navLinks.forEach(function (l) { l.classList.remove("active"); });
    sectionPanels.forEach(function (p) { p.classList.remove("active"); });

    link.classList.add("active");
    const panel = document.getElementById("section-" + link.dataset.section);
    if (panel) panel.classList.add("active");
    pageTitle.textContent = link.textContent.trim();
  });
});