/* jshint browser: true, devel: true, jquery: true */
/* global IScroll */

(function($) {
  'use strict';

  var slides;
  var slideMinWidth = 1024;
  var slideMinHeight = 500;
  var slidesInitialized = false;

  var keycode = {
    arrowUp: 38,
    arrowDown: 40
  };

  // Toggle navigation
  function toggleNavigation() {
    $('.nav-icon').toggleClass('is-active');
    $('body').toggleClass('is-unscrollable');
    $('.nav-menu').toggleClass('is-available').delay(100).queue(function(next) {
      $('.nav-menu').toggleClass('is-visible');
      next();
    });
  }

  function setSlideNav(nextSlide) {
    var $currentSlide = $('.is-current');

    if (nextSlide.length) {
      nextSlide.addClass('is-current');
      $currentSlide.removeClass('is-current');
    }
  }

  /**
   * Updates the currently selected slide nav
   * @param {string} sibling - 'prev' or 'next'
   */
  function updateSlideNav(sibling) {
    var $nextSlide = $('.is-current')[sibling]();
    setSlideNav($nextSlide);
  }

  /**
   * Jumps the currently selected slide nav to a specific one
   */
  function jumpSlideNav(slideNumber) {
    var $nextSlide = $('.slides-navigation li:eq(' + slideNumber + ')');
    setSlideNav($nextSlide);
  }

  // Check whether to initialize or destroy slides
  function resetSlides() {
    var requiresInitialization = $(window).width() >= slideMinWidth && $(window).height() > slideMinHeight;

    if (requiresInitialization) {
      if (!slidesInitialized) {
        initializeSlides();
      }
    }
    else {
      if (slidesInitialized) {
        destroySlides();
      }
    }
  }

  // Initialize slides
  function initializeSlides() {
    var slideMoved = false;
    var sensitivity = 10;

    // Scroll back to top to reset slide position
    window.scrollTo(0, 0);

    slides = new IScroll('.slides-container', {
      snap: '.slide',
      snapSpeed: 750,
      disableMouse: true
    });

    $('.js-values').css('overflow', 'hidden');

    $('.slides-container').on('mousewheel', function(event) {
      // if scroll has stopped, unlock
      if (Math.abs(event.deltaY) === 1) {
        slideMoved = false;
        slides._transitionTime();
      }

      // Prevent multiple slides from moving per scroll
      if (slideMoved) {
        return;
      }

      if (event.deltaY < (-1 * sensitivity)) {
        slides.next();
        slideMoved = true;
        updateSlideNav('next');
      }

      if (event.deltaY > sensitivity) {
        slides.prev();
        slideMoved = true;
        updateSlideNav('prev');
      }
    });

    $('body').on('keyup', function(event) {
      if (event.which === keycode.arrowDown) {
        slides.next();
        slideMoved = true;
        updateSlideNav('next');
      }
    });

    $('body').on('keyup', function(event) {
      if (event.which === keycode.arrowUp) {
        slides.prev();
        slideMoved = true;
        updateSlideNav('prev');
      }
    });

    slidesInitialized = true;
  }

  function gotoSlides(slideNumber) {
    var $currentSlideNumber = $('.is-current').data('slide');

    if ($currentSlideNumber !== slideNumber) {
      slides.goToPage(0, slideNumber, 1000);
      jumpSlideNav(slideNumber);
    }
  }

  // Destroy slides
  function destroySlides() {
    slides.destroy();
    $('.slides-container').off('mousewheel');
    $('.js-values').css('overflow', 'visible');
    slidesInitialized = false;
  }

  // Executes callback in a debounced resize window event
  function resizeWindow(callback) {
    var resizeTimer;

    $(window).on('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        callback();
      }, 300);
    });
  }

  function easterEgg() {
    console.log(' _____  _____ _        ______             _                      _             ');
    console.log('|_   _|/ ____| |      |  ____|           (_)                    (_)            ');
    console.log('  | | | (___ | |      | |__   _ __   __ _ _ _ __   ___  ___ _ __ _ _ __   __ _ ');
    console.log('  | |  \\___ \\| |      |  __| | \'_ \\ / _` | | \'_ \\ / _ \\/ _ \\ \'__| | \'_ \\ / _` |');
    console.log(' _| |_ ____) | |____  | |____| | | | (_| | | | | |  __/  __/ |  | | | | | (_| |');
    console.log('|_____|_____/|______| |______|_| |_|\\__, |_|_| |_|\\___|\\___|_|  |_|_| |_|\\__, |');
    console.log('                                     __/ |                                __/ |');
    console.log('                                    |___/                                |___/ ');
    console.log();
    console.log('Oh, hi there! We see you like viewing code! Well, ISL is hiring!');
    console.log('Mosey on over to http://isl.co/careers/ and take a look at our open positions!');
    console.log('Hope to hear from you soon!');
  }

  $(document).ready(function() {

    easterEgg();

    // Toggle nav menu
    $('.nav-icon').click(function() {
      toggleNavigation();
    });

    resizeWindow(function(){
      if ($(window).width() >= slideMinWidth && $('.nav-icon').hasClass('is-active')) {
        toggleNavigation();
      }
    });

    // If on values page
    if ($('body').hasClass('js-values')) {
      resizeWindow(resetSlides);

      resetSlides();

      $('.slides-navigation li').on('click', function() {
        var slideNumber = $(this).data('slide');
        gotoSlides(slideNumber);
      });
    }

  });

})(jQuery);
