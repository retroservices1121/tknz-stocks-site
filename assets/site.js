/* tknz Stocks — progressive motion. Content is fully visible without this file.
   Scroll reveal + light screenshot parallax, both skipped under prefers-reduced-motion. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches || !("IntersectionObserver" in window)) return;

  var root = document.documentElement;
  root.classList.add("js");

  // Scroll reveal
  var revealEls = document.querySelectorAll("[data-reveal]");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  revealEls.forEach(function (el) { io.observe(el); });

  // Screenshot parallax (wide viewports only)
  var wide = window.matchMedia("(min-width: 48rem)");
  var layers = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (!layers.length) return;

  var ticking = false;
  var frame = 0;
  var active = true;
  function reset() {
    layers.forEach(function (el) { el.style.transform = ""; });
  }
  function update() {
    ticking = false;
    frame = 0;
    // Re-check the live preference: a frame queued before reduced motion was enabled must not apply.
    if (!active || reduce.matches) { reset(); return; }
    var vh = window.innerHeight;
    layers.forEach(function (el) {
      if (!wide.matches) { el.style.transform = ""; return; }
      // Measure the untransformed parent so the offset doesn't feed back on itself.
      var r = (el.parentElement || el).getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.06;
      var offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
    });
  }
  function onScroll() {
    if (!active || reduce.matches) return;
    if (!ticking) { ticking = true; frame = window.requestAnimationFrame(update); }
  }
  function disable() {
    active = false;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
    ticking = false;
    reset();
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  function onPrefChange(e) { if (e.matches) disable(); }
  if (reduce.addEventListener) reduce.addEventListener("change", onPrefChange);
  else if (reduce.addListener) reduce.addListener(onPrefChange);
  update();
})();
