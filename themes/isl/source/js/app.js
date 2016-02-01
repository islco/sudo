/* jshint devel: true */

(function() {
  'use strict';

  var slides;
  var slideMinWidth = 1024;
  var slideMinHeight = 500;
  var slidesInitialized = false;

  var resizeTimerNav;
  var resizeTimerSlide;


  // Toggle navigation
  function toggleNavigation() {
    $('.nav-icon').toggleClass('is-active');
    $('body').toggleClass('is-unscrollable');
    $('.nav-menu').toggleClass('is-available').delay(100).queue(function(next) {
      $('.nav-menu').toggleClass('is-visible');
      next();
    });
  }

  /**
   * Updates the currently selected slide nav item
   * @param {string} sibling - 'prev' or 'next'
   */
  function updateSlideNav(sibling) {
    var $currentSlide = $('.is-current');
    $currentSlide[sibling]().addClass('is-current');
    $currentSlide.removeClass('is-current');
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

    slidesInitialized = true;
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

  $(document).ready(function() {

    // Toggle nav menu
    $('.nav-icon').click(function() {
      toggleNavigation();
    });

    resizeWindow(function(){
      if ($(window).width() >= slideMinWidth && $('.nav-icon').hasClass('is-active')) {
        toggleNavigation();
      }
    });

    if ($('body').hasClass('js-values')) {
      resizeWindow(resetSlides);

      resetSlides();
    }
  });


})();
