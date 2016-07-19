/* jshint browser: true, devel: true, jquery: true */
/* global sudoUtils, sudoNav, sudoSlides, Pjax */

var sudo = $.extend(
  {
    init: function() {
      'use strict';

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
  elements: 'a[href]',
  selectors: ['title', '.js-pjax-nav', '.js-pjax-main']
});

$(document).on('pjax:success', function() {
  'use strict';

  sudo.cleanupSlides();
  sudo.cleanupNav();
  sudo.init();
});


/**
 * Recruiting message
 */

if (window.console) {
  console.log('Like code? https://isl.co/careers/');
}
