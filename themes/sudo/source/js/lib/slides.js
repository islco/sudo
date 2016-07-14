/* jshint browser: true, jquery: true */
/* global IScroll */

window.sudoSlides = function() {
  'use strict';

  var $window = $(window);
  var $body = $('body');
  var $slides;
  var $slidesNav;
  var $slidesNavLinks;
  var $slidesWrapper;
  var slidesWrapper;
  var slidesInitialized;
  var scroller;

  var keycodes = {
    arrowUp: 38,
    arrowDown: 40
  };

  function getCurrentSlide() {
    return $slidesNav.find('.is-current').data('slide');
  }

  function gotoSlide(slideNumber, currentSlideNumber) {
    currentSlideNumber = currentSlideNumber || getCurrentSlide();

    if (slideNumber >= 0 && slideNumber < $slidesNavLinks.length && slideNumber !== currentSlideNumber) {
      scroller.goToPage(0, slideNumber, 1000);

      $slidesNavLinks
        .removeClass('is-current')
        .eq(slideNumber).addClass('is-current');
    }
  }

  function gotoNextSlide() {
    var currentSlideNumber = getCurrentSlide();
    return gotoSlide(currentSlideNumber + 1, currentSlideNumber);
  }

  function gotoPreviousSlide() {
    var currentSlideNumber = getCurrentSlide();
    return gotoSlide(currentSlideNumber - 1, currentSlideNumber);
  }

  return {

    initializeSlides: function() {
      var sensitivity = 10;
      var slideMoved = false;

      this.disableScroll();
      window.scrollTo(0, 0);  // back to top in case you've scrolled on mobile

      scroller = new IScroll(slidesWrapper, {
        snapSpeed: 750,
        snap: '.slide',
        disableMouse: true
      });

      $slidesWrapper.on('mousewheel.sudo.slides', function(event) {
        // if scroll has stopped, unlock
        if (Math.abs(event.deltaY) === 1) {
          slideMoved = false;
          scroller._transitionTime();
        }

        // Prevent multiple slides from moving per scroll
        if (slideMoved) {
          return;
        }

        if (event.deltaY < (-1 * sensitivity)) {
          gotoNextSlide();
          slideMoved = true;
        } else if (event.deltaY > sensitivity) {
          gotoPreviousSlide();
          slideMoved = true;
        }
      });

      $body.on('keyup.sudo.slides', function(event) {
        if (event.which === keycodes.arrowDown) {
          gotoNextSlide();
          slideMoved = true;
        }
      });

      $body.on('keyup.sudo.slides', function(event) {
        if (event.which === keycodes.arrowUp) {
          gotoPreviousSlide();
          slideMoved = true;
        }
      });

      gotoSlide(0);
      slidesInitialized = true;
    },

    destroySlides: function() {
      if (scroller) {
        scroller.destroy();
        this.reEnableScroll();
        slidesInitialized = false;
        $slidesWrapper.off('mousewheel.sudo.slides');
        $body.off('keyup.sudo.slides');
      }
    },

    cleanupSlides: function() {
      this.destroySlides();
      $window.off('resize.sudo.slides');
    },

    initializeOrDestroySlides: function() {
      var isDesktop = window.matchMedia('(min-height: 500px) and (min-width: 64em)').matches;

      if (isDesktop && !slidesInitialized) {
        this.initializeSlides();

      } else if (!isDesktop && slidesInitialized) {
        this.destroySlides();

      } else if (slidesInitialized) {
        scroller.refresh();
      }
    },

    slidesInit: function() {
      slidesInitialized = false;
      slidesWrapper = document.querySelector('.js-slides');

      if (slidesWrapper) {

        $slidesWrapper = $(slidesWrapper);
        $slides = $slidesWrapper.find('.slide');

        $slidesNav = $('.js-slides-nav');
        $slidesNavLinks = $slidesNav.find('.slides-nav__link');

        $slidesNavLinks.on('click.sudo.slides', function(event) {
          event.preventDefault();
          gotoSlide($(this).data('slide'));
        });

        this.initializeOrDestroySlides();

        var throttling = false;
        var self = this;
        $window.on('resize.sudo.slides', function() {
          if (!throttling) {
            throttling = true;

            self.initializeOrDestroySlides();

            return setTimeout(function() {
              throttling = false;
            }, 50);
          }
        });
      }
    }
  };
};
