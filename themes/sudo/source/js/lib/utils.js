/* jshint browser: true, jquery: true */

window.sudoUtils = function() {
  'use strict';

  var $body = $('body');

  return {
    disableScroll: function() {
      $body.addClass('scroll-disable');
    },

    reEnableScroll: function() {
      $body.removeClass('scroll-disable');
    }
  };
};
