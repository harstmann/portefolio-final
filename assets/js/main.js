(function () {
  "use strict";

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var storedTheme = null;
  try { storedTheme = localStorage.getItem("jh-theme"); } catch (e) {}

  if (storedTheme) {
    root.setAttribute("data-theme", storedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    root.setAttribute("data-theme", "light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("jh-theme", next); } catch (e) {}
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Header scroll state + progress bar ---------- */
  var header = document.getElementById("siteHeader");
  var progressBar = document.getElementById("progressBar");
  var backToTop = document.getElementById("backToTop");

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = pct + "%";
    if (header) header.classList.toggle("scrolled", scrollTop > 10);
    if (backToTop) backToTop.classList.toggle("visible", scrollTop > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1200;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------- Skill bars ---------- */
  var skillFills = Array.prototype.slice.call(document.querySelectorAll(".skill-bar-fill"));
  if (skillFills.length && "IntersectionObserver" in window) {
    var skillObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.style.width = el.getAttribute("data-width") + "%";
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    skillFills.forEach(function (el) { skillObserver.observe(el); });
  } else {
    skillFills.forEach(function (el) { el.style.width = el.getAttribute("data-width") + "%"; });
  }

  /* ---------- Project filters ---------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var projectCards = Array.prototype.slice.call(document.querySelectorAll(".project-card"));

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");

      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      projectCards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-cat") === filter;
        card.style.display = match ? "" : "none";
      });
    });
  });

  /* ---------- Typed role rotator ---------- */
  var typedEl = document.getElementById("typedRole");
  if (typedEl) {
    var roles = ["Full Stack", "Créateur de Contenu", "Assistant Virtuel", "Producteur Musical", "IA & RAG"];
    var roleIndex = 0;
    var charIndex = roles[0].length;
    var deleting = false;

    function tick() {
      var word = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        if (charIndex > word.length) {
          deleting = true;
          charIndex = word.length;
          setTimeout(tick, 1400);
          return;
        }
      } else {
        charIndex--;
        if (charIndex < 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          charIndex = 0;
        }
      }
      typedEl.textContent = roles[roleIndex].slice(0, charIndex);
      setTimeout(tick, deleting ? 45 : 85);
    }
    setTimeout(tick, 1000);
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
