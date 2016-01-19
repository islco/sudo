/* jshint devel: true */

$(document).ready(function(){
  $('.page').css('overflow', 'hidden');

  var slides = new IScroll('.slides-container', {
    snap: '.slide',
    snapSpeed: 750,
    disableMouse: true
  });

  var slideMoved = false;
  var sensitivity = 10;

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
});
