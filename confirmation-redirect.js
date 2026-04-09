/**
 * Redirects prototype forms to confirmation.html with safe query params
 * (no form field values in the URL). Use data-confirm on the form and
 * optional data-confirm-title / data-confirm-message on submit buttons.
 */
(function () {
  function resolveMessage(form, submitter) {
    var fromBtn = submitter && submitter.getAttribute("data-confirm-message");
    if (fromBtn !== null && fromBtn !== "") return fromBtn;
    var fromForm = form.getAttribute("data-confirm-message");
    return fromForm || "";
  }

  function resolveTitle(form, submitter) {
    var fromBtn = submitter && submitter.getAttribute("data-confirm-title");
    if (fromBtn) return fromBtn;
    var fromForm = form.getAttribute("data-confirm-title");
    return fromForm || "Saved";
  }

  function buildUrl(form, submitter) {
    var title = resolveTitle(form, submitter);
    var message = resolveMessage(form, submitter);
    var returnUrl = form.getAttribute("data-confirm-return") || "index.html";
    var params = new URLSearchParams();
    params.set("title", title);
    if (message) params.set("message", message);
    params.set("return", returnUrl);
    return "confirmation.html?" + params.toString();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form[data-confirm]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var url = buildUrl(form, e.submitter || null);
        window.location.href = url;
      });
    });
  });
})();
