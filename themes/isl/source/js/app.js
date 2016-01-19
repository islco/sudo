/* jshint devel: true */

$(document).ready(function(){

  // set minimum browser size needed to initialize
  var intializeWidth = 1024;
  var intializeHeight = 500;

  var resizeTimer;
  var slides;
  var isInitialized = false;


  $(window).on('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      checkInit();
    }, 300);
  });

  var checkInit = function() {
    if ( $(window).width() > intializeWidth && $(window).height() > intializeHeight ) {
      // If scroll is already initialized
      if (!isInitialized) {
        // scroll back to top to reset slide position
        window.scrollTo(0, 0);
        initializeScroll();
        isInitialized = true;
        console.log('initialized');
      }
    }
    else {
      if (isInitialized) {
        slides.destroy();
        $('.page').css('overflow', 'visible');
        isInitialized = false;
        console.log('destroyed');
      }
    }
  }

  var initializeScroll = function() {
    slides = new IScroll('.slides-container', {
      snap: '.slide',
      snapSpeed: 750,
      disableMouse: true
    });

    var slideMoved = false;
    var sensitivity = 10;

    $('.page').css('overflow', 'hidden');

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
      }

      if (event.deltaY > sensitivity) {
        slides.prev();
        slideMoved = true;
      }
    });
  }

  checkInit();
});
