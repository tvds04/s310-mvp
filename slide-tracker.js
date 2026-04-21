/**
 * Presentation slide navbar — include this script on any slide page (after skip link in <body>).
 * Add or reorder slides here; each entry is one pill in the bar.
 */
(function () {
  var SLIDES = [
    { num: 1, label: "Title", href: "title-slide.html" },
    { num: 2, label: "Tools used", href: "tools-used.html" },
    { num: 3, label: "Website", href: "index.html" }
  ];

  function currentFile() {
    var path = decodeURIComponent(location.pathname).replace(/\\/g, "/");
    var segments = path.split("/").filter(function (s) {
      return s.length;
    });
    var last = segments[segments.length - 1] || "";
    if (!last || !/\.html?$/i.test(last)) {
      return "index.html";
    }
    return last;
  }

  function hrefToFilename(href) {
    var part = (href || "").split("#")[0].split("?")[0];
    var segments = part.replace(/\\/g, "/").split("/").filter(function (s) {
      return s.length;
    });
    return segments[segments.length - 1] || "";
  }

  function inject() {
    if (document.getElementById("slide-tracker")) {
      return;
    }
    var skip = document.querySelector("a.skip-link");
    var nav = document.createElement("div");
    nav.className = "slide-tracker";
    nav.id = "slide-tracker";
    nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-label", "Presentation slides");

    var items = SLIDES.map(function (s) {
      return (
        "<li><a href=\"" +
        s.href +
        "\"><span class=\"slide-tracker-num\" aria-hidden=\"true\">" +
        s.num +
        "</span> " +
        s.label +
        "</a></li>"
      );
    }).join("");

    nav.innerHTML =
      "<div class=\"slide-tracker-inner\">" +
      "<span class=\"slide-tracker-label\">Slides</span>" +
      "<ul class=\"slide-tracker-steps\">" +
      items +
      "</ul></div>";

    if (skip && skip.parentNode) {
      skip.parentNode.insertBefore(nav, skip.nextSibling);
    } else {
      document.body.insertBefore(nav, document.body.firstChild);
    }
  }

  function sync() {
    var root = document.getElementById("slide-tracker");
    if (!root) {
      return;
    }
    var here = currentFile().toLowerCase();
    root.querySelectorAll(".slide-tracker-steps a").forEach(function (a) {
      var target = hrefToFilename(a.getAttribute("href")).toLowerCase();
      var active = here === target;
      a.classList.toggle("slide-tracker__link--current", active);
      if (active) {
        a.setAttribute("aria-current", "true");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  inject();
  sync();
})();
