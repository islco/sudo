/* jshint devel: true */

(function () {
  'use strict';
  
  var $values = $('.value');
  var $slideNavs = $('.sidenav > ul > li');
  var offset = $('.value').height() / 3;

  for(var i = 0; i < $values.length; i++) {
    var slide = $('.js-value-' + (i + 1));
    var max = slide.offset().top + (slide.height());

      slide.scrollspy({
        min: i === 0 ? 0 : slide.offset().top - offset,
        max: max,
        onEnter: function(element) {
          var slideNumber = $(element).attr('class').split(' ')[0].split('-')[2];
          $slideNavs.removeClass('is-active');
          $('.js-nav-slide-' + slideNumber).addClass('is-active');
      }
    });
  }

})();
