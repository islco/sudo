/* jshint browser: true, devel: true, jquery: true */
/* global sudoUtils, sudoNav, sudoSlides, Pjax */

var sudo = $.extend(
  {
    init: function() {
      "use strict";

      this.navInit();
      this.slidesInit();
    }
  },
  sudoUtils(),
  sudoNav(),
  sudoSlides()
);

sudo.init();

/**
 * Pjax
 */

new Pjax({
  elements: "a[href]",
  selectors: ["title", ".js-pjax-nav", ".js-pjax-main"]
});

$(document).on("pjax:success", function() {
  "use strict";

  sudo.cleanupSlides();
  sudo.cleanupNav();
  sudo.init();
});

$(document).on("pjax:complete", function() {
  //console.log("test print path", window.location.pathname);
  if (window.location.pathname !== "/browser-beats/") {
    // Stop Browser Beats if it has already been visited
    if (typeof browerBeatsVisited !== "undefined") {
      loopBeat.stop();
      window.removeEventListener("keydown", handlePress);
      window.removeEventListener("click", handlePress);
      window.removeEventListener("copy", handleOneOff);
      window.removeEventListener("paste", handleOneOff);
      window.removeEventListener("scroll", handleOneOff);
    }
  }
  if (window.location.pathname === "/browser-beats/") {
    // Restart Browser Beats if it has already been visited
    if (typeof browerBeatsVisited !== "undefined") {
      loopBeat.start();
      window.addEventListener("keydown", handlePress);
      window.addEventListener("click", handlePress);
      window.addEventListener("copy", handleOneOff);
      window.addEventListener("paste", handleOneOff);
      window.addEventListener("scroll", handleOneOff);
    }
  }
});

/**
 * Recruiting message
 */

if (window.console) {
  console.log("Like code? https://isl.co/careers/");
}
