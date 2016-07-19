/* jshint browser: true, jquery: true */

window.sudoNav = function() {
  'use strict';

  var $navIcon;
  var $navMenu;
  var navActive;

  return {
    showNav: function() {
      this.disableScroll();
      $navIcon.addClass('is-active');
      $navMenu.addClass('is-active');
      navActive = true;
    },

    hideNav: function() {
      this.reEnableScroll();
      $navIcon.removeClass('is-active');
      $navMenu.removeClass('is-active');
      navActive = false;
    },

    isNavActive: function() {
      return navActive;
    },

    cleanupNav: function() {
      if (navActive) {
        this.hideNav();
      }

      $navIcon.off('click.sudo.nav');
    },

    navInit: function() {
      $navIcon = $('.js-nav-icon');
      $navMenu = $('.js-nav-menu');

      var self = this;
      $navIcon.on('click.sudo.nav', function() {
        if (navActive === true) {
          self.hideNav();
        } else {
          self.showNav();
        }
      });
    }
  };
};
