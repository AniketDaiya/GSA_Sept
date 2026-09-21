/* Google Student Ambassador Program 2026 Guide — copy buttons + toast */

(function () {
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("gsa-theme", theme); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem("gsa-theme"); } catch (e) {}
  applyTheme(saved === "light" ? "light" : "dark");

  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  var toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  var hideTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 1900);
  }

  function copyText(text, ok, err) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { ok(); },
        function () { fallbackCopy(text, ok, err); }
      );
    } else {
      fallbackCopy(text, ok, err);
    }
  }

  function fallbackCopy(text, ok, err) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      ok();
    } catch (e) {
      err();
    }
    document.body.removeChild(ta);
  }

  function wireCopyButtons() {
    var els = document.querySelectorAll(".copy[data-copy]");
    els.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.getAttribute("data-copy"));
        if (!target) return;
        var label = btn.querySelector(".c-label");
        copyText(
          target.textContent,
          function () {
            if (label) label.textContent = "Copied";
            btn.classList.add("copied");
            showToast("Prompt copied");
            setTimeout(function () {
              btn.classList.remove("copied");
              if (label) label.textContent = "Copy";
            }, 1900);
          },
          function () {
            if (label) label.textContent = "Copy";
            showToast("Couldn't copy — long-press to copy instead");
          }
        );
      });
    });
  }

  function wirePromptToggles() {
    var heads = document.querySelectorAll(".prompt-head");
    heads.forEach(function (head) {
      head.addEventListener("click", function () {
        var body = head.nextElementSibling;
        if (!body) return;
        var expanded = head.getAttribute("aria-expanded") === "true";
        var label = head.querySelector(".expand-label");
        head.setAttribute("aria-expanded", expanded ? "false" : "true");
        if (expanded) {
          body.style.maxHeight = "0px";
          if (label) label.textContent = "Expand";
        } else {
          body.style.maxHeight = body.scrollHeight + "px";
          if (label) label.textContent = "Collapse";
        }
      });
      head.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          head.click();
        }
      });
    });
  }

  function wireLightbox() {
    var lb = document.createElement("div");
    lb.className = "lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Enlarged screenshot");

    var close = document.createElement("button");
    close.className = "lb-close";
    close.setAttribute("aria-label", "Close");
    close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

    var img = document.createElement("img");
    var cap = document.createElement("p");
    cap.className = "lb-cap";

    lb.appendChild(close);
    lb.appendChild(img);
    lb.appendChild(cap);
    document.body.appendChild(lb);

    function open(src, alt, caption) {
      img.src = src;
      img.alt = alt || "Screenshot";
      cap.textContent = caption || "";
      lb.classList.add("show");
      document.body.classList.add("lb-locked");
    }

    function closeLB() {
      lb.classList.remove("show");
      document.body.classList.remove("lb-locked");
    }

    document.querySelectorAll(".zoom").forEach(function (z) {
      z.addEventListener("click", function () {
        var im = z.querySelector("img");
        var fig = z.closest(".shot");
        var fcap = fig ? fig.querySelector("figcaption") : null;
        open(im.getAttribute("src"), im.getAttribute("alt"), fcap ? fcap.textContent.trim() : "");
      });
    });

    close.addEventListener("click", closeLB);
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLB();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("show")) closeLB();
    });
  }

  function wireScrollProgress() {
    var bar = document.querySelector(".scroll-progress");
    if (!bar) return;
    var ticking = false;

    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = p + "%";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function wireReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireCopyButtons();
    wirePromptToggles();
    wireLightbox();
    wireScrollProgress();
    wireReveal();
  });
})();