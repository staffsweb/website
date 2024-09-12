"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

// CG: Allow switching of PG course tab in subject pages, but don't scroll to the anchor
var anchorTarget = window.location.hash;

if (anchorTarget == "#courses__postgraduate") {
  window.location.hash = "";
}
/* global Waypoint, console */
// @TODO: Learn to module bundle properly and manage dependencies with a proper
// package manager 🤦
// These are currently duplicated because we're using gulp-include as a
// replacement for CodeKit, it compiles with both as a fallback becuase it's
// @Sheerman's first time using Gulp.
//@codekit-prepend silent './vendor/jquery.hoverIntent';

/*!
 * hoverIntent v1.10.1 // 2019.10.05 // jQuery v1.7.0+
 * http://briancherne.github.io/jquery-hoverIntent/
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007-2019 Brian Cherne
 */

/**
 * hoverIntent is similar to jQuery's built-in "hover" method except that
 * instead of firing the handlerIn function immediately, hoverIntent checks
 * to see if the user's mouse has slowed down (beneath the sensitivity
 * threshold) before firing the event. The handlerOut function is only
 * called after a matching handlerIn.
 *
 * // basic usage ... just like .hover()
 * .hoverIntent( handlerIn, handlerOut )
 * .hoverIntent( handlerInOut )
 *
 * // basic usage ... with event delegation!
 * .hoverIntent( handlerIn, handlerOut, selector )
 * .hoverIntent( handlerInOut, selector )
 *
 * // using a basic configuration object
 * .hoverIntent( config )
 *
 * @param  handlerIn   function OR configuration object
 * @param  handlerOut  function OR selector for delegation OR undefined
 * @param  selector    selector OR undefined
 * @author Brian Cherne <brian(at)cherne(dot)net>
 */


;

(function (factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
    module.exports = factory(require('jquery'));
  } else if (jQuery && !jQuery.fn.hoverIntent) {
    factory(jQuery);
  }
})(function ($) {
  'use strict'; // default configuration values

  var _cfg = {
    interval: 100,
    sensitivity: 6,
    timeout: 0
  }; // counter used to generate an ID for each instance

  var INSTANCE_COUNT = 0; // current X and Y position of mouse, updated during mousemove tracking (shared across instances)

  var cX, cY; // saves the current pointer position coordinates based on the given mousemove event

  var track = function track(ev) {
    cX = ev.pageX;
    cY = ev.pageY;
  }; // compares current and previous mouse positions


  var compare = function compare(ev, $el, s, cfg) {
    // compare mouse positions to see if pointer has slowed enough to trigger `over` function
    if (Math.sqrt((s.pX - cX) * (s.pX - cX) + (s.pY - cY) * (s.pY - cY)) < cfg.sensitivity) {
      $el.off(s.event, track);
      delete s.timeoutId; // set hoverIntent state as active for this element (permits `out` handler to trigger)

      s.isActive = true; // overwrite old mouseenter event coordinates with most recent pointer position

      ev.pageX = cX;
      ev.pageY = cY; // clear coordinate data from state object

      delete s.pX;
      delete s.pY;
      return cfg.over.apply($el[0], [ev]);
    } else {
      // set previous coordinates for next comparison
      s.pX = cX;
      s.pY = cY; // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)

      s.timeoutId = setTimeout(function () {
        compare(ev, $el, s, cfg);
      }, cfg.interval);
    }
  }; // triggers given `out` function at configured `timeout` after a mouseleave and clears state


  var delay = function delay(ev, $el, s, out) {
    var data = $el.data('hoverIntent');

    if (data) {
      delete data[s.id];
    }

    return out.apply($el[0], [ev]);
  }; // checks if `value` is a function


  var isFunction = function isFunction(value) {
    return typeof value === 'function';
  };

  $.fn.hoverIntent = function (handlerIn, handlerOut, selector) {
    // instance ID, used as a key to store and retrieve state information on an element
    var instanceId = INSTANCE_COUNT++; // extend the default configuration and parse parameters

    var cfg = $.extend({}, _cfg);

    if ($.isPlainObject(handlerIn)) {
      cfg = $.extend(cfg, handlerIn);

      if (!isFunction(cfg.out)) {
        cfg.out = cfg.over;
      }
    } else if (isFunction(handlerOut)) {
      cfg = $.extend(cfg, {
        over: handlerIn,
        out: handlerOut,
        selector: selector
      });
    } else {
      cfg = $.extend(cfg, {
        over: handlerIn,
        out: handlerIn,
        selector: handlerOut
      });
    } // A private function for handling mouse 'hovering'


    var handleHover = function handleHover(e) {
      // cloned event to pass to handlers (copy required for event object to be passed in IE)
      var ev = $.extend({}, e); // the current target of the mouse event, wrapped in a jQuery object

      var $el = $(this); // read hoverIntent data from element (or initialize if not present)

      var hoverIntentData = $el.data('hoverIntent');

      if (!hoverIntentData) {
        $el.data('hoverIntent', hoverIntentData = {});
      } // read per-instance state from element (or initialize if not present)


      var state = hoverIntentData[instanceId];

      if (!state) {
        hoverIntentData[instanceId] = state = {
          id: instanceId
        };
      } // state properties:
      // id = instance ID, used to clean up data
      // timeoutId = timeout ID, reused for tracking mouse position and delaying "out" handler
      // isActive = plugin state, true after `over` is called just until `out` is called
      // pX, pY = previously-measured pointer coordinates, updated at each polling interval
      // event = string representing the namespaced event used for mouse tracking
      // clear any existing timeout


      if (state.timeoutId) {
        state.timeoutId = clearTimeout(state.timeoutId);
      } // namespaced event used to register and unregister mousemove tracking


      var mousemove = state.event = 'mousemove.hoverIntent.hoverIntent' + instanceId; // handle the event, based on its type

      if (e.type === 'mouseenter') {
        // do nothing if already active
        if (state.isActive) {
          return;
        } // set "previous" X and Y position based on initial entry point


        state.pX = ev.pageX;
        state.pY = ev.pageY; // update "current" X and Y position based on mousemove

        $el.off(mousemove, track).on(mousemove, track); // start polling interval (self-calling timeout) to compare mouse coordinates over time

        state.timeoutId = setTimeout(function () {
          compare(ev, $el, state, cfg);
        }, cfg.interval);
      } else {
        // "mouseleave"
        // do nothing if not already active
        if (!state.isActive) {
          return;
        } // unbind expensive mousemove event


        $el.off(mousemove, track); // if hoverIntent state is true, then call the mouseOut function after the specified delay

        state.timeoutId = setTimeout(function () {
          delay(ev, $el, state, cfg.out);
        }, cfg.timeout);
      }
    }; // listen for mouseenter and mouseleave


    return this.on({
      'mouseenter.hoverIntent': handleHover,
      'mouseleave.hoverIntent': handleHover
    }, cfg.selector);
  };
}); //@codekit-prepend silent './vendor/smartResize';


(function ($, sr) {
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function debounce(func, threshold, execAsap) {
    var timeout;
    return function debounced() {
      var obj = this,
          args = arguments;

      function delayed() {
        if (!execAsap) func.apply(obj, args);
        timeout = null;
      }

      ;
      if (timeout) clearTimeout(timeout);else if (execAsap) func.apply(obj, args);
      timeout = setTimeout(delayed, threshold || 100);
    };
  }; // smartresize 


  jQuery.fn[sr] = function (fn) {
    return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
  };
})(jQuery, 'smartResize'); //@codekit-prepend silent './vendor/slick-1.8.1/slick/slick';

/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.8.0
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */

/* global window, document, define, jQuery, setInterval, clearInterval */


;

(function (factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
})(function ($) {
  'use strict';

  var Slick = window.Slick || {};

  Slick = function () {
    var instanceUid = 0;

    function Slick(element, settings) {
      var _ = this,
          dataSettings;

      _.defaults = {
        accessibility: true,
        adaptiveHeight: false,
        appendArrows: $(element),
        appendDots: $(element),
        arrows: true,
        asNavFor: null,
        prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
        nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
        autoplay: false,
        autoplaySpeed: 3000,
        centerMode: false,
        centerPadding: '50px',
        cssEase: 'ease',
        customPaging: function customPaging(slider, i) {
          return $('<button type="button" />').text(i + 1);
        },
        dots: false,
        dotsClass: 'slick-dots',
        draggable: true,
        easing: 'linear',
        edgeFriction: 0.35,
        fade: false,
        focusOnSelect: false,
        focusOnChange: false,
        infinite: true,
        initialSlide: 0,
        lazyLoad: 'ondemand',
        mobileFirst: false,
        pauseOnHover: true,
        pauseOnFocus: true,
        pauseOnDotsHover: false,
        respondTo: 'window',
        responsive: null,
        rows: 1,
        rtl: false,
        slide: '',
        slidesPerRow: 1,
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 500,
        swipe: true,
        swipeToSlide: false,
        touchMove: true,
        touchThreshold: 5,
        useCSS: true,
        useTransform: true,
        variableWidth: false,
        vertical: false,
        verticalSwiping: false,
        waitForAnimate: true,
        zIndex: 1000
      };
      _.initials = {
        animating: false,
        dragging: false,
        autoPlayTimer: null,
        currentDirection: 0,
        currentLeft: null,
        currentSlide: 0,
        direction: 1,
        $dots: null,
        listWidth: null,
        listHeight: null,
        loadIndex: 0,
        $nextArrow: null,
        $prevArrow: null,
        scrolling: false,
        slideCount: null,
        slideWidth: null,
        $slideTrack: null,
        $slides: null,
        sliding: false,
        slideOffset: 0,
        swipeLeft: null,
        swiping: false,
        $list: null,
        touchObject: {},
        transformsEnabled: false,
        unslicked: false
      };
      $.extend(_, _.initials);
      _.activeBreakpoint = null;
      _.animType = null;
      _.animProp = null;
      _.breakpoints = [];
      _.breakpointSettings = [];
      _.cssTransitions = false;
      _.focussed = false;
      _.interrupted = false;
      _.hidden = 'hidden';
      _.paused = true;
      _.positionProp = null;
      _.respondTo = null;
      _.rowCount = 1;
      _.shouldClick = true;
      _.$slider = $(element);
      _.$slidesCache = null;
      _.transformType = null;
      _.transitionType = null;
      _.visibilityChange = 'visibilitychange';
      _.windowWidth = 0;
      _.windowTimer = null;
      dataSettings = $(element).data('slick') || {};
      _.options = $.extend({}, _.defaults, settings, dataSettings);
      _.currentSlide = _.options.initialSlide;
      _.originalSettings = _.options;

      if (typeof document.mozHidden !== 'undefined') {
        _.hidden = 'mozHidden';
        _.visibilityChange = 'mozvisibilitychange';
      } else if (typeof document.webkitHidden !== 'undefined') {
        _.hidden = 'webkitHidden';
        _.visibilityChange = 'webkitvisibilitychange';
      }

      _.autoPlay = $.proxy(_.autoPlay, _);
      _.autoPlayClear = $.proxy(_.autoPlayClear, _);
      _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
      _.changeSlide = $.proxy(_.changeSlide, _);
      _.clickHandler = $.proxy(_.clickHandler, _);
      _.selectHandler = $.proxy(_.selectHandler, _);
      _.setPosition = $.proxy(_.setPosition, _);
      _.swipeHandler = $.proxy(_.swipeHandler, _);
      _.dragHandler = $.proxy(_.dragHandler, _);
      _.keyHandler = $.proxy(_.keyHandler, _);
      _.instanceUid = instanceUid++; // A simple way to check for HTML strings
      // Strict HTML recognition (must start with <)
      // Extracted from jQuery v1.11 source

      _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

      _.registerBreakpoints();

      _.init(true);
    }

    return Slick;
  }();

  Slick.prototype.activateADA = function () {
    var _ = this;

    _.$slideTrack.find('.slick-active').attr({
      'aria-hidden': 'false'
    }).find('a, input, button, select').attr({
      'tabindex': '0'
    });
  };

  Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {
    var _ = this;

    if (typeof index === 'boolean') {
      addBefore = index;
      index = null;
    } else if (index < 0 || index >= _.slideCount) {
      return false;
    }

    _.unload();

    if (typeof index === 'number') {
      if (index === 0 && _.$slides.length === 0) {
        $(markup).appendTo(_.$slideTrack);
      } else if (addBefore) {
        $(markup).insertBefore(_.$slides.eq(index));
      } else {
        $(markup).insertAfter(_.$slides.eq(index));
      }
    } else {
      if (addBefore === true) {
        $(markup).prependTo(_.$slideTrack);
      } else {
        $(markup).appendTo(_.$slideTrack);
      }
    }

    _.$slides = _.$slideTrack.children(this.options.slide);

    _.$slideTrack.children(this.options.slide).detach();

    _.$slideTrack.append(_.$slides);

    _.$slides.each(function (index, element) {
      $(element).attr('data-slick-index', index);
    });

    _.$slidesCache = _.$slides;

    _.reinit();
  };

  Slick.prototype.animateHeight = function () {
    var _ = this;

    if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
      var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);

      _.$list.animate({
        height: targetHeight
      }, _.options.speed);
    }
  };

  Slick.prototype.animateSlide = function (targetLeft, callback) {
    var animProps = {},
        _ = this;

    _.animateHeight();

    if (_.options.rtl === true && _.options.vertical === false) {
      targetLeft = -targetLeft;
    }

    if (_.transformsEnabled === false) {
      if (_.options.vertical === false) {
        _.$slideTrack.animate({
          left: targetLeft
        }, _.options.speed, _.options.easing, callback);
      } else {
        _.$slideTrack.animate({
          top: targetLeft
        }, _.options.speed, _.options.easing, callback);
      }
    } else {
      if (_.cssTransitions === false) {
        if (_.options.rtl === true) {
          _.currentLeft = -_.currentLeft;
        }

        $({
          animStart: _.currentLeft
        }).animate({
          animStart: targetLeft
        }, {
          duration: _.options.speed,
          easing: _.options.easing,
          step: function step(now) {
            now = Math.ceil(now);

            if (_.options.vertical === false) {
              animProps[_.animType] = 'translate(' + now + 'px, 0px)';

              _.$slideTrack.css(animProps);
            } else {
              animProps[_.animType] = 'translate(0px,' + now + 'px)';

              _.$slideTrack.css(animProps);
            }
          },
          complete: function complete() {
            if (callback) {
              callback.call();
            }
          }
        });
      } else {
        _.applyTransition();

        targetLeft = Math.ceil(targetLeft);

        if (_.options.vertical === false) {
          animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
        } else {
          animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
        }

        _.$slideTrack.css(animProps);

        if (callback) {
          setTimeout(function () {
            _.disableTransition();

            callback.call();
          }, _.options.speed);
        }
      }
    }
  };

  Slick.prototype.getNavTarget = function () {
    var _ = this,
        asNavFor = _.options.asNavFor;

    if (asNavFor && asNavFor !== null) {
      asNavFor = $(asNavFor).not(_.$slider);
    }

    return asNavFor;
  };

  Slick.prototype.asNavFor = function (index) {
    var _ = this,
        asNavFor = _.getNavTarget();

    if (asNavFor !== null && _typeof(asNavFor) === 'object') {
      asNavFor.each(function () {
        var target = $(this).slick('getSlick');

        if (!target.unslicked) {
          target.slideHandler(index, true);
        }
      });
    }
  };

  Slick.prototype.applyTransition = function (slide) {
    var _ = this,
        transition = {};

    if (_.options.fade === false) {
      transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
    } else {
      transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
    }

    if (_.options.fade === false) {
      _.$slideTrack.css(transition);
    } else {
      _.$slides.eq(slide).css(transition);
    }
  };

  Slick.prototype.autoPlay = function () {
    var _ = this;

    _.autoPlayClear();

    if (_.slideCount > _.options.slidesToShow) {
      _.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
    }
  };

  Slick.prototype.autoPlayClear = function () {
    var _ = this;

    if (_.autoPlayTimer) {
      clearInterval(_.autoPlayTimer);
    }
  };

  Slick.prototype.autoPlayIterator = function () {
    var _ = this,
        slideTo = _.currentSlide + _.options.slidesToScroll;

    if (!_.paused && !_.interrupted && !_.focussed) {
      if (_.options.infinite === false) {
        if (_.direction === 1 && _.currentSlide + 1 === _.slideCount - 1) {
          _.direction = 0;
        } else if (_.direction === 0) {
          slideTo = _.currentSlide - _.options.slidesToScroll;

          if (_.currentSlide - 1 === 0) {
            _.direction = 1;
          }
        }
      }

      _.slideHandler(slideTo);
    }
  };

  Slick.prototype.buildArrows = function () {
    var _ = this;

    if (_.options.arrows === true) {
      _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
      _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

      if (_.slideCount > _.options.slidesToShow) {
        _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

        _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

        if (_.htmlExpr.test(_.options.prevArrow)) {
          _.$prevArrow.prependTo(_.options.appendArrows);
        }

        if (_.htmlExpr.test(_.options.nextArrow)) {
          _.$nextArrow.appendTo(_.options.appendArrows);
        }

        if (_.options.infinite !== true) {
          _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
        }
      } else {
        _.$prevArrow.add(_.$nextArrow).addClass('slick-hidden').attr({
          'aria-disabled': 'true',
          'tabindex': '-1'
        });
      }
    }
  };

  Slick.prototype.buildDots = function () {
    var _ = this,
        i,
        dot;

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      _.$slider.addClass('slick-dotted');

      dot = $('<ul />').addClass(_.options.dotsClass);

      for (i = 0; i <= _.getDotCount(); i += 1) {
        dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
      }

      _.$dots = dot.appendTo(_.options.appendDots);

      _.$dots.find('li').first().addClass('slick-active');
    }
  };

  Slick.prototype.buildOut = function () {
    var _ = this;

    _.$slides = _.$slider.children(_.options.slide + ':not(.slick-cloned)').addClass('slick-slide');
    _.slideCount = _.$slides.length;

    _.$slides.each(function (index, element) {
      $(element).attr('data-slick-index', index).data('originalStyling', $(element).attr('style') || '');
    });

    _.$slider.addClass('slick-slider');

    _.$slideTrack = _.slideCount === 0 ? $('<div class="slick-track"/>').appendTo(_.$slider) : _.$slides.wrapAll('<div class="slick-track"/>').parent();
    _.$list = _.$slideTrack.wrap('<div class="slick-list"/>').parent();

    _.$slideTrack.css('opacity', 0);

    if (_.options.centerMode === true || _.options.swipeToSlide === true) {
      _.options.slidesToScroll = 1;
    }

    $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

    _.setupInfinite();

    _.buildArrows();

    _.buildDots();

    _.updateDots();

    _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

    if (_.options.draggable === true) {
      _.$list.addClass('draggable');
    }
  };

  Slick.prototype.buildRows = function () {
    var _ = this,
        a,
        b,
        c,
        newSlides,
        numOfSlides,
        originalSlides,
        slidesPerSection;

    newSlides = document.createDocumentFragment();
    originalSlides = _.$slider.children();

    if (_.options.rows > 0) {
      slidesPerSection = _.options.slidesPerRow * _.options.rows;
      numOfSlides = Math.ceil(originalSlides.length / slidesPerSection);

      for (a = 0; a < numOfSlides; a++) {
        var slide = document.createElement('div');

        for (b = 0; b < _.options.rows; b++) {
          var row = document.createElement('div');

          for (c = 0; c < _.options.slidesPerRow; c++) {
            var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);

            if (originalSlides.get(target)) {
              row.appendChild(originalSlides.get(target));
            }
          }

          slide.appendChild(row);
        }

        newSlides.appendChild(slide);
      }

      _.$slider.empty().append(newSlides);

      _.$slider.children().children().children().css({
        'width': 100 / _.options.slidesPerRow + '%',
        'display': 'inline-block'
      });
    }
  };

  Slick.prototype.checkResponsive = function (initial, forceUpdate) {
    var _ = this,
        breakpoint,
        targetBreakpoint,
        respondToWidth,
        triggerBreakpoint = false;

    var sliderWidth = _.$slider.width();

    var windowWidth = window.innerWidth || $(window).width();

    if (_.respondTo === 'window') {
      respondToWidth = windowWidth;
    } else if (_.respondTo === 'slider') {
      respondToWidth = sliderWidth;
    } else if (_.respondTo === 'min') {
      respondToWidth = Math.min(windowWidth, sliderWidth);
    }

    if (_.options.responsive && _.options.responsive.length && _.options.responsive !== null) {
      targetBreakpoint = null;

      for (breakpoint in _.breakpoints) {
        if (_.breakpoints.hasOwnProperty(breakpoint)) {
          if (_.originalSettings.mobileFirst === false) {
            if (respondToWidth < _.breakpoints[breakpoint]) {
              targetBreakpoint = _.breakpoints[breakpoint];
            }
          } else {
            if (respondToWidth > _.breakpoints[breakpoint]) {
              targetBreakpoint = _.breakpoints[breakpoint];
            }
          }
        }
      }

      if (targetBreakpoint !== null) {
        if (_.activeBreakpoint !== null) {
          if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
            _.activeBreakpoint = targetBreakpoint;

            if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
              _.unslick(targetBreakpoint);
            } else {
              _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);

              if (initial === true) {
                _.currentSlide = _.options.initialSlide;
              }

              _.refresh(initial);
            }

            triggerBreakpoint = targetBreakpoint;
          }
        } else {
          _.activeBreakpoint = targetBreakpoint;

          if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
            _.unslick(targetBreakpoint);
          } else {
            _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);

            if (initial === true) {
              _.currentSlide = _.options.initialSlide;
            }

            _.refresh(initial);
          }

          triggerBreakpoint = targetBreakpoint;
        }
      } else {
        if (_.activeBreakpoint !== null) {
          _.activeBreakpoint = null;
          _.options = _.originalSettings;

          if (initial === true) {
            _.currentSlide = _.options.initialSlide;
          }

          _.refresh(initial);

          triggerBreakpoint = targetBreakpoint;
        }
      } // only trigger breakpoints during an actual break. not on initialize.


      if (!initial && triggerBreakpoint !== false) {
        _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
      }
    }
  };

  Slick.prototype.changeSlide = function (event, dontAnimate) {
    var _ = this,
        $target = $(event.currentTarget),
        indexOffset,
        slideOffset,
        unevenOffset; // If target is a link, prevent default action.


    if ($target.is('a')) {
      event.preventDefault();
    } // If target is not the <li> element (ie: a child), find the <li>.


    if (!$target.is('li')) {
      $target = $target.closest('li');
    }

    unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
    indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

    switch (event.data.message) {
      case 'previous':
        slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;

        if (_.slideCount > _.options.slidesToShow) {
          _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
        }

        break;

      case 'next':
        slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;

        if (_.slideCount > _.options.slidesToShow) {
          _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
        }

        break;

      case 'index':
        var index = event.data.index === 0 ? 0 : event.data.index || $target.index() * _.options.slidesToScroll;

        _.slideHandler(_.checkNavigable(index), false, dontAnimate);

        $target.children().trigger('focus');
        break;

      default:
        return;
    }
  };

  Slick.prototype.checkNavigable = function (index) {
    var _ = this,
        navigables,
        prevNavigable;

    navigables = _.getNavigableIndexes();
    prevNavigable = 0;

    if (index > navigables[navigables.length - 1]) {
      index = navigables[navigables.length - 1];
    } else {
      for (var n in navigables) {
        if (index < navigables[n]) {
          index = prevNavigable;
          break;
        }

        prevNavigable = navigables[n];
      }
    }

    return index;
  };

  Slick.prototype.cleanUpEvents = function () {
    var _ = this;

    if (_.options.dots && _.$dots !== null) {
      $('li', _.$dots).off('click.slick', _.changeSlide).off('mouseenter.slick', $.proxy(_.interrupt, _, true)).off('mouseleave.slick', $.proxy(_.interrupt, _, false));

      if (_.options.accessibility === true) {
        _.$dots.off('keydown.slick', _.keyHandler);
      }
    }

    _.$slider.off('focus.slick blur.slick');

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
      _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

      if (_.options.accessibility === true) {
        _.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
        _.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
      }
    }

    _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);

    _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);

    _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);

    _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

    _.$list.off('click.slick', _.clickHandler);

    $(document).off(_.visibilityChange, _.visibility);

    _.cleanUpSlideEvents();

    if (_.options.accessibility === true) {
      _.$list.off('keydown.slick', _.keyHandler);
    }

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().off('click.slick', _.selectHandler);
    }

    $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);
    $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);
    $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);
    $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
  };

  Slick.prototype.cleanUpSlideEvents = function () {
    var _ = this;

    _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));

    _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));
  };

  Slick.prototype.cleanUpRows = function () {
    var _ = this,
        originalSlides;

    if (_.options.rows > 0) {
      originalSlides = _.$slides.children().children();
      originalSlides.removeAttr('style');

      _.$slider.empty().append(originalSlides);
    }
  };

  Slick.prototype.clickHandler = function (event) {
    var _ = this;

    if (_.shouldClick === false) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
    }
  };

  Slick.prototype.destroy = function (refresh) {
    var _ = this;

    _.autoPlayClear();

    _.touchObject = {};

    _.cleanUpEvents();

    $('.slick-cloned', _.$slider).detach();

    if (_.$dots) {
      _.$dots.remove();
    }

    if (_.$prevArrow && _.$prevArrow.length) {
      _.$prevArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

      if (_.htmlExpr.test(_.options.prevArrow)) {
        _.$prevArrow.remove();
      }
    }

    if (_.$nextArrow && _.$nextArrow.length) {
      _.$nextArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

      if (_.htmlExpr.test(_.options.nextArrow)) {
        _.$nextArrow.remove();
      }
    }

    if (_.$slides) {
      _.$slides.removeClass('slick-slide slick-active slick-center slick-visible slick-current').removeAttr('aria-hidden').removeAttr('data-slick-index').each(function () {
        $(this).attr('style', $(this).data('originalStyling'));
      });

      _.$slideTrack.children(this.options.slide).detach();

      _.$slideTrack.detach();

      _.$list.detach();

      _.$slider.append(_.$slides);
    }

    _.cleanUpRows();

    _.$slider.removeClass('slick-slider');

    _.$slider.removeClass('slick-initialized');

    _.$slider.removeClass('slick-dotted');

    _.unslicked = true;

    if (!refresh) {
      _.$slider.trigger('destroy', [_]);
    }
  };

  Slick.prototype.disableTransition = function (slide) {
    var _ = this,
        transition = {};

    transition[_.transitionType] = '';

    if (_.options.fade === false) {
      _.$slideTrack.css(transition);
    } else {
      _.$slides.eq(slide).css(transition);
    }
  };

  Slick.prototype.fadeSlide = function (slideIndex, callback) {
    var _ = this;

    if (_.cssTransitions === false) {
      _.$slides.eq(slideIndex).css({
        zIndex: _.options.zIndex
      });

      _.$slides.eq(slideIndex).animate({
        opacity: 1
      }, _.options.speed, _.options.easing, callback);
    } else {
      _.applyTransition(slideIndex);

      _.$slides.eq(slideIndex).css({
        opacity: 1,
        zIndex: _.options.zIndex
      });

      if (callback) {
        setTimeout(function () {
          _.disableTransition(slideIndex);

          callback.call();
        }, _.options.speed);
      }
    }
  };

  Slick.prototype.fadeSlideOut = function (slideIndex) {
    var _ = this;

    if (_.cssTransitions === false) {
      _.$slides.eq(slideIndex).animate({
        opacity: 0,
        zIndex: _.options.zIndex - 2
      }, _.options.speed, _.options.easing);
    } else {
      _.applyTransition(slideIndex);

      _.$slides.eq(slideIndex).css({
        opacity: 0,
        zIndex: _.options.zIndex - 2
      });
    }
  };

  Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {
    var _ = this;

    if (filter !== null) {
      _.$slidesCache = _.$slides;

      _.unload();

      _.$slideTrack.children(this.options.slide).detach();

      _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

      _.reinit();
    }
  };

  Slick.prototype.focusHandler = function () {
    var _ = this;

    _.$slider.off('focus.slick blur.slick').on('focus.slick blur.slick', '*', function (event) {
      event.stopImmediatePropagation();
      var $sf = $(this);
      setTimeout(function () {
        if (_.options.pauseOnFocus) {
          _.focussed = $sf.is(':focus');

          _.autoPlay();
        }
      }, 0);
    });
  };

  Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {
    var _ = this;

    return _.currentSlide;
  };

  Slick.prototype.getDotCount = function () {
    var _ = this;

    var breakPoint = 0;
    var counter = 0;
    var pagerQty = 0;

    if (_.options.infinite === true) {
      if (_.slideCount <= _.options.slidesToShow) {
        ++pagerQty;
      } else {
        while (breakPoint < _.slideCount) {
          ++pagerQty;
          breakPoint = counter + _.options.slidesToScroll;
          counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }
      }
    } else if (_.options.centerMode === true) {
      pagerQty = _.slideCount;
    } else if (!_.options.asNavFor) {
      pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
    } else {
      while (breakPoint < _.slideCount) {
        ++pagerQty;
        breakPoint = counter + _.options.slidesToScroll;
        counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
      }
    }

    return pagerQty - 1;
  };

  Slick.prototype.getLeft = function (slideIndex) {
    var _ = this,
        targetLeft,
        verticalHeight,
        verticalOffset = 0,
        targetSlide,
        coef;

    _.slideOffset = 0;
    verticalHeight = _.$slides.first().outerHeight(true);

    if (_.options.infinite === true) {
      if (_.slideCount > _.options.slidesToShow) {
        _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
        coef = -1;

        if (_.options.vertical === true && _.options.centerMode === true) {
          if (_.options.slidesToShow === 2) {
            coef = -1.5;
          } else if (_.options.slidesToShow === 1) {
            coef = -2;
          }
        }

        verticalOffset = verticalHeight * _.options.slidesToShow * coef;
      }

      if (_.slideCount % _.options.slidesToScroll !== 0) {
        if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
          if (slideIndex > _.slideCount) {
            _.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1;
            verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1;
          } else {
            _.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1;
            verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1;
          }
        }
      }
    } else {
      if (slideIndex + _.options.slidesToShow > _.slideCount) {
        _.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
        verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
      }
    }

    if (_.slideCount <= _.options.slidesToShow) {
      _.slideOffset = 0;
      verticalOffset = 0;
    }

    if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
      _.slideOffset = _.slideWidth * Math.floor(_.options.slidesToShow) / 2 - _.slideWidth * _.slideCount / 2;
    } else if (_.options.centerMode === true && _.options.infinite === true) {
      _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
    } else if (_.options.centerMode === true) {
      _.slideOffset = 0;
      _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
    }

    if (_.options.vertical === false) {
      targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
    } else {
      targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
    }

    if (_.options.variableWidth === true) {
      if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
        targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
      } else {
        targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
      }

      if (_.options.rtl === true) {
        if (targetSlide[0]) {
          targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
        } else {
          targetLeft = 0;
        }
      } else {
        targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
      }

      if (_.options.centerMode === true) {
        if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
          targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
        } else {
          targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
        }

        if (_.options.rtl === true) {
          if (targetSlide[0]) {
            targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
          } else {
            targetLeft = 0;
          }
        } else {
          targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
        }

        targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
      }
    }

    return targetLeft;
  };

  Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {
    var _ = this;

    return _.options[option];
  };

  Slick.prototype.getNavigableIndexes = function () {
    var _ = this,
        breakPoint = 0,
        counter = 0,
        indexes = [],
        max;

    if (_.options.infinite === false) {
      max = _.slideCount;
    } else {
      breakPoint = _.options.slidesToScroll * -1;
      counter = _.options.slidesToScroll * -1;
      max = _.slideCount * 2;
    }

    while (breakPoint < max) {
      indexes.push(breakPoint);
      breakPoint = counter + _.options.slidesToScroll;
      counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
    }

    return indexes;
  };

  Slick.prototype.getSlick = function () {
    return this;
  };

  Slick.prototype.getSlideCount = function () {
    var _ = this,
        slidesTraversed,
        swipedSlide,
        centerOffset;

    centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

    if (_.options.swipeToSlide === true) {
      _.$slideTrack.find('.slick-slide').each(function (index, slide) {
        if (slide.offsetLeft - centerOffset + $(slide).outerWidth() / 2 > _.swipeLeft * -1) {
          swipedSlide = slide;
          return false;
        }
      });

      slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;
      return slidesTraversed;
    } else {
      return _.options.slidesToScroll;
    }
  };

  Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {
    var _ = this;

    _.changeSlide({
      data: {
        message: 'index',
        index: parseInt(slide)
      }
    }, dontAnimate);
  };

  Slick.prototype.init = function (creation) {
    var _ = this;

    if (!$(_.$slider).hasClass('slick-initialized')) {
      $(_.$slider).addClass('slick-initialized');

      _.buildRows();

      _.buildOut();

      _.setProps();

      _.startLoad();

      _.loadSlider();

      _.initializeEvents();

      _.updateArrows();

      _.updateDots();

      _.checkResponsive(true);

      _.focusHandler();
    }

    if (creation) {
      _.$slider.trigger('init', [_]);
    }

    if (_.options.accessibility === true) {
      _.initADA();
    }

    if (_.options.autoplay) {
      _.paused = false;

      _.autoPlay();
    }
  };

  Slick.prototype.initADA = function () {
    var _ = this,
        numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
        tabControlIndexes = _.getNavigableIndexes().filter(function (val) {
      return val >= 0 && val < _.slideCount;
    });

    _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
      'aria-hidden': 'true',
      'tabindex': '-1'
    }).find('a, input, button, select').attr({
      'tabindex': '-1'
    });

    if (_.$dots !== null) {
      _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
        var slideControlIndex = tabControlIndexes.indexOf(i);
        $(this).attr({
          'role': 'tabpanel',
          'id': 'slick-slide' + _.instanceUid + i,
          'tabindex': -1
        });

        if (slideControlIndex !== -1) {
          var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex;

          if ($('#' + ariaButtonControl).length) {
            $(this).attr({
              'aria-describedby': ariaButtonControl
            });
          }
        }
      });

      _.$dots.attr('role', 'tablist').find('li').each(function (i) {
        var mappedSlideIndex = tabControlIndexes[i];
        $(this).attr({
          'role': 'presentation'
        });
        $(this).find('button').first().attr({
          'role': 'tab',
          'id': 'slick-slide-control' + _.instanceUid + i,
          'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
          'aria-label': i + 1 + ' of ' + numDotGroups,
          'aria-selected': null,
          'tabindex': '-1'
        });
      }).eq(_.currentSlide).find('button').attr({
        'aria-selected': 'true',
        'tabindex': '0'
      }).end();
    }

    for (var i = _.currentSlide, max = i + _.options.slidesToShow; i < max; i++) {
      if (_.options.focusOnChange) {
        _.$slides.eq(i).attr({
          'tabindex': '0'
        });
      } else {
        _.$slides.eq(i).removeAttr('tabindex');
      }
    }

    _.activateADA();
  };

  Slick.prototype.initArrowEvents = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.off('click.slick').on('click.slick', {
        message: 'previous'
      }, _.changeSlide);

      _.$nextArrow.off('click.slick').on('click.slick', {
        message: 'next'
      }, _.changeSlide);

      if (_.options.accessibility === true) {
        _.$prevArrow.on('keydown.slick', _.keyHandler);

        _.$nextArrow.on('keydown.slick', _.keyHandler);
      }
    }
  };

  Slick.prototype.initDotEvents = function () {
    var _ = this;

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      $('li', _.$dots).on('click.slick', {
        message: 'index'
      }, _.changeSlide);

      if (_.options.accessibility === true) {
        _.$dots.on('keydown.slick', _.keyHandler);
      }
    }

    if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {
      $('li', _.$dots).on('mouseenter.slick', $.proxy(_.interrupt, _, true)).on('mouseleave.slick', $.proxy(_.interrupt, _, false));
    }
  };

  Slick.prototype.initSlideEvents = function () {
    var _ = this;

    if (_.options.pauseOnHover) {
      _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));

      _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));
    }
  };

  Slick.prototype.initializeEvents = function () {
    var _ = this;

    _.initArrowEvents();

    _.initDotEvents();

    _.initSlideEvents();

    _.$list.on('touchstart.slick mousedown.slick', {
      action: 'start'
    }, _.swipeHandler);

    _.$list.on('touchmove.slick mousemove.slick', {
      action: 'move'
    }, _.swipeHandler);

    _.$list.on('touchend.slick mouseup.slick', {
      action: 'end'
    }, _.swipeHandler);

    _.$list.on('touchcancel.slick mouseleave.slick', {
      action: 'end'
    }, _.swipeHandler);

    _.$list.on('click.slick', _.clickHandler);

    $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

    if (_.options.accessibility === true) {
      _.$list.on('keydown.slick', _.keyHandler);
    }

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().on('click.slick', _.selectHandler);
    }

    $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));
    $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));
    $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);
    $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
    $(_.setPosition);
  };

  Slick.prototype.initUI = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.show();

      _.$nextArrow.show();
    }

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      _.$dots.show();
    }
  };

  Slick.prototype.keyHandler = function (event) {
    var _ = this; //Dont slide if the cursor is inside the form fields and arrow keys are pressed


    if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
      if (event.keyCode === 37 && _.options.accessibility === true) {
        _.changeSlide({
          data: {
            message: _.options.rtl === true ? 'next' : 'previous'
          }
        });
      } else if (event.keyCode === 39 && _.options.accessibility === true) {
        _.changeSlide({
          data: {
            message: _.options.rtl === true ? 'previous' : 'next'
          }
        });
      }
    }
  };

  Slick.prototype.lazyLoad = function () {
    var _ = this,
        loadRange,
        cloneRange,
        rangeStart,
        rangeEnd;

    function loadImages(imagesScope) {
      $('img[data-lazy]', imagesScope).each(function () {
        var image = $(this),
            imageSource = $(this).attr('data-lazy'),
            imageSrcSet = $(this).attr('data-srcset'),
            imageSizes = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
            imageToLoad = document.createElement('img');

        imageToLoad.onload = function () {
          image.animate({
            opacity: 0
          }, 100, function () {
            if (imageSrcSet) {
              image.attr('srcset', imageSrcSet);

              if (imageSizes) {
                image.attr('sizes', imageSizes);
              }
            }

            image.attr('src', imageSource).animate({
              opacity: 1
            }, 200, function () {
              image.removeAttr('data-lazy data-srcset data-sizes').removeClass('slick-loading');
            });

            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
          });
        };

        imageToLoad.onerror = function () {
          image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

          _.$slider.trigger('lazyLoadError', [_, image, imageSource]);
        };

        imageToLoad.src = imageSource;
      });
    }

    if (_.options.centerMode === true) {
      if (_.options.infinite === true) {
        rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
        rangeEnd = rangeStart + _.options.slidesToShow + 2;
      } else {
        rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
        rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
      }
    } else {
      rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
      rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);

      if (_.options.fade === true) {
        if (rangeStart > 0) rangeStart--;
        if (rangeEnd <= _.slideCount) rangeEnd++;
      }
    }

    loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

    if (_.options.lazyLoad === 'anticipated') {
      var prevSlide = rangeStart - 1,
          nextSlide = rangeEnd,
          $slides = _.$slider.find('.slick-slide');

      for (var i = 0; i < _.options.slidesToScroll; i++) {
        if (prevSlide < 0) prevSlide = _.slideCount - 1;
        loadRange = loadRange.add($slides.eq(prevSlide));
        loadRange = loadRange.add($slides.eq(nextSlide));
        prevSlide--;
        nextSlide++;
      }
    }

    loadImages(loadRange);

    if (_.slideCount <= _.options.slidesToShow) {
      cloneRange = _.$slider.find('.slick-slide');
      loadImages(cloneRange);
    } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
      cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
      loadImages(cloneRange);
    } else if (_.currentSlide === 0) {
      cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
      loadImages(cloneRange);
    }
  };

  Slick.prototype.loadSlider = function () {
    var _ = this;

    _.setPosition();

    _.$slideTrack.css({
      opacity: 1
    });

    _.$slider.removeClass('slick-loading');

    _.initUI();

    if (_.options.lazyLoad === 'progressive') {
      _.progressiveLazyLoad();
    }
  };

  Slick.prototype.next = Slick.prototype.slickNext = function () {
    var _ = this;

    _.changeSlide({
      data: {
        message: 'next'
      }
    });
  };

  Slick.prototype.orientationChange = function () {
    var _ = this;

    _.checkResponsive();

    _.setPosition();
  };

  Slick.prototype.pause = Slick.prototype.slickPause = function () {
    var _ = this;

    _.autoPlayClear();

    _.paused = true;
  };

  Slick.prototype.play = Slick.prototype.slickPlay = function () {
    var _ = this;

    _.autoPlay();

    _.options.autoplay = true;
    _.paused = false;
    _.focussed = false;
    _.interrupted = false;
  };

  Slick.prototype.postSlide = function (index) {
    var _ = this;

    if (!_.unslicked) {
      _.$slider.trigger('afterChange', [_, index]);

      _.animating = false;

      if (_.slideCount > _.options.slidesToShow) {
        _.setPosition();
      }

      _.swipeLeft = null;

      if (_.options.autoplay) {
        _.autoPlay();
      }

      if (_.options.accessibility === true) {
        _.initADA();

        if (_.options.focusOnChange) {
          var $currentSlide = $(_.$slides.get(_.currentSlide));
          $currentSlide.attr('tabindex', 0).focus();
        }
      }
    }
  };

  Slick.prototype.prev = Slick.prototype.slickPrev = function () {
    var _ = this;

    _.changeSlide({
      data: {
        message: 'previous'
      }
    });
  };

  Slick.prototype.preventDefault = function (event) {
    event.preventDefault();
  };

  Slick.prototype.progressiveLazyLoad = function (tryCount) {
    tryCount = tryCount || 1;

    var _ = this,
        $imgsToLoad = $('img[data-lazy]', _.$slider),
        image,
        imageSource,
        imageSrcSet,
        imageSizes,
        imageToLoad;

    if ($imgsToLoad.length) {
      image = $imgsToLoad.first();
      imageSource = image.attr('data-lazy');
      imageSrcSet = image.attr('data-srcset');
      imageSizes = image.attr('data-sizes') || _.$slider.attr('data-sizes');
      imageToLoad = document.createElement('img');

      imageToLoad.onload = function () {
        if (imageSrcSet) {
          image.attr('srcset', imageSrcSet);

          if (imageSizes) {
            image.attr('sizes', imageSizes);
          }
        }

        image.attr('src', imageSource).removeAttr('data-lazy data-srcset data-sizes').removeClass('slick-loading');

        if (_.options.adaptiveHeight === true) {
          _.setPosition();
        }

        _.$slider.trigger('lazyLoaded', [_, image, imageSource]);

        _.progressiveLazyLoad();
      };

      imageToLoad.onerror = function () {
        if (tryCount < 3) {
          /**
           * try to load the image 3 times,
           * leave a slight delay so we don't get
           * servers blocking the request.
           */
          setTimeout(function () {
            _.progressiveLazyLoad(tryCount + 1);
          }, 500);
        } else {
          image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

          _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

          _.progressiveLazyLoad();
        }
      };

      imageToLoad.src = imageSource;
    } else {
      _.$slider.trigger('allImagesLoaded', [_]);
    }
  };

  Slick.prototype.refresh = function (initializing) {
    var _ = this,
        currentSlide,
        lastVisibleIndex;

    lastVisibleIndex = _.slideCount - _.options.slidesToShow; // in non-infinite sliders, we don't want to go past the
    // last visible index.

    if (!_.options.infinite && _.currentSlide > lastVisibleIndex) {
      _.currentSlide = lastVisibleIndex;
    } // if less slides than to show, go to start.


    if (_.slideCount <= _.options.slidesToShow) {
      _.currentSlide = 0;
    }

    currentSlide = _.currentSlide;

    _.destroy(true);

    $.extend(_, _.initials, {
      currentSlide: currentSlide
    });

    _.init();

    if (!initializing) {
      _.changeSlide({
        data: {
          message: 'index',
          index: currentSlide
        }
      }, false);
    }
  };

  Slick.prototype.registerBreakpoints = function () {
    var _ = this,
        breakpoint,
        currentBreakpoint,
        l,
        responsiveSettings = _.options.responsive || null;

    if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {
      _.respondTo = _.options.respondTo || 'window';

      for (breakpoint in responsiveSettings) {
        l = _.breakpoints.length - 1;

        if (responsiveSettings.hasOwnProperty(breakpoint)) {
          currentBreakpoint = responsiveSettings[breakpoint].breakpoint; // loop through the breakpoints and cut out any existing
          // ones with the same breakpoint number, we don't want dupes.

          while (l >= 0) {
            if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
              _.breakpoints.splice(l, 1);
            }

            l--;
          }

          _.breakpoints.push(currentBreakpoint);

          _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;
        }
      }

      _.breakpoints.sort(function (a, b) {
        return _.options.mobileFirst ? a - b : b - a;
      });
    }
  };

  Slick.prototype.reinit = function () {
    var _ = this;

    _.$slides = _.$slideTrack.children(_.options.slide).addClass('slick-slide');
    _.slideCount = _.$slides.length;

    if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
      _.currentSlide = _.currentSlide - _.options.slidesToScroll;
    }

    if (_.slideCount <= _.options.slidesToShow) {
      _.currentSlide = 0;
    }

    _.registerBreakpoints();

    _.setProps();

    _.setupInfinite();

    _.buildArrows();

    _.updateArrows();

    _.initArrowEvents();

    _.buildDots();

    _.updateDots();

    _.initDotEvents();

    _.cleanUpSlideEvents();

    _.initSlideEvents();

    _.checkResponsive(false, true);

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().on('click.slick', _.selectHandler);
    }

    _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

    _.setPosition();

    _.focusHandler();

    _.paused = !_.options.autoplay;

    _.autoPlay();

    _.$slider.trigger('reInit', [_]);
  };

  Slick.prototype.resize = function () {
    var _ = this;

    if ($(window).width() !== _.windowWidth) {
      clearTimeout(_.windowDelay);
      _.windowDelay = window.setTimeout(function () {
        _.windowWidth = $(window).width();

        _.checkResponsive();

        if (!_.unslicked) {
          _.setPosition();
        }
      }, 50);
    }
  };

  Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {
    var _ = this;

    if (typeof index === 'boolean') {
      removeBefore = index;
      index = removeBefore === true ? 0 : _.slideCount - 1;
    } else {
      index = removeBefore === true ? --index : index;
    }

    if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
      return false;
    }

    _.unload();

    if (removeAll === true) {
      _.$slideTrack.children().remove();
    } else {
      _.$slideTrack.children(this.options.slide).eq(index).remove();
    }

    _.$slides = _.$slideTrack.children(this.options.slide);

    _.$slideTrack.children(this.options.slide).detach();

    _.$slideTrack.append(_.$slides);

    _.$slidesCache = _.$slides;

    _.reinit();
  };

  Slick.prototype.setCSS = function (position) {
    var _ = this,
        positionProps = {},
        x,
        y;

    if (_.options.rtl === true) {
      position = -position;
    }

    x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
    y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';
    positionProps[_.positionProp] = position;

    if (_.transformsEnabled === false) {
      _.$slideTrack.css(positionProps);
    } else {
      positionProps = {};

      if (_.cssTransitions === false) {
        positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';

        _.$slideTrack.css(positionProps);
      } else {
        positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';

        _.$slideTrack.css(positionProps);
      }
    }
  };

  Slick.prototype.setDimensions = function () {
    var _ = this;

    if (_.options.vertical === false) {
      if (_.options.centerMode === true) {
        _.$list.css({
          padding: '0px ' + _.options.centerPadding
        });
      }
    } else {
      _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);

      if (_.options.centerMode === true) {
        _.$list.css({
          padding: _.options.centerPadding + ' 0px'
        });
      }
    }

    _.listWidth = _.$list.width();
    _.listHeight = _.$list.height();

    if (_.options.vertical === false && _.options.variableWidth === false) {
      _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);

      _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children('.slick-slide').length));
    } else if (_.options.variableWidth === true) {
      _.$slideTrack.width(5000 * _.slideCount);
    } else {
      _.slideWidth = Math.ceil(_.listWidth);

      _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length));
    }

    var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();

    if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);
  };

  Slick.prototype.setFade = function () {
    var _ = this,
        targetLeft;

    _.$slides.each(function (index, element) {
      targetLeft = _.slideWidth * index * -1;

      if (_.options.rtl === true) {
        $(element).css({
          position: 'relative',
          right: targetLeft,
          top: 0,
          zIndex: _.options.zIndex - 2,
          opacity: 0
        });
      } else {
        $(element).css({
          position: 'relative',
          left: targetLeft,
          top: 0,
          zIndex: _.options.zIndex - 2,
          opacity: 0
        });
      }
    });

    _.$slides.eq(_.currentSlide).css({
      zIndex: _.options.zIndex - 1,
      opacity: 1
    });
  };

  Slick.prototype.setHeight = function () {
    var _ = this;

    if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
      var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);

      _.$list.css('height', targetHeight);
    }
  };

  Slick.prototype.setOption = Slick.prototype.slickSetOption = function () {
    /**
     * accepts arguments in format of:
     *
     *  - for changing a single option's value:
     *     .slick("setOption", option, value, refresh )
     *
     *  - for changing a set of responsive options:
     *     .slick("setOption", 'responsive', [{}, ...], refresh )
     *
     *  - for updating multiple values at once (not responsive)
     *     .slick("setOption", { 'option': value, ... }, refresh )
     */
    var _ = this,
        l,
        item,
        option,
        value,
        refresh = false,
        type;

    if ($.type(arguments[0]) === 'object') {
      option = arguments[0];
      refresh = arguments[1];
      type = 'multiple';
    } else if ($.type(arguments[0]) === 'string') {
      option = arguments[0];
      value = arguments[1];
      refresh = arguments[2];

      if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {
        type = 'responsive';
      } else if (typeof arguments[1] !== 'undefined') {
        type = 'single';
      }
    }

    if (type === 'single') {
      _.options[option] = value;
    } else if (type === 'multiple') {
      $.each(option, function (opt, val) {
        _.options[opt] = val;
      });
    } else if (type === 'responsive') {
      for (item in value) {
        if ($.type(_.options.responsive) !== 'array') {
          _.options.responsive = [value[item]];
        } else {
          l = _.options.responsive.length - 1; // loop through the responsive object and splice out duplicates.

          while (l >= 0) {
            if (_.options.responsive[l].breakpoint === value[item].breakpoint) {
              _.options.responsive.splice(l, 1);
            }

            l--;
          }

          _.options.responsive.push(value[item]);
        }
      }
    }

    if (refresh) {
      _.unload();

      _.reinit();
    }
  };

  Slick.prototype.setPosition = function () {
    var _ = this;

    _.setDimensions();

    _.setHeight();

    if (_.options.fade === false) {
      _.setCSS(_.getLeft(_.currentSlide));
    } else {
      _.setFade();
    }

    _.$slider.trigger('setPosition', [_]);
  };

  Slick.prototype.setProps = function () {
    var _ = this,
        bodyStyle = document.body.style;

    _.positionProp = _.options.vertical === true ? 'top' : 'left';

    if (_.positionProp === 'top') {
      _.$slider.addClass('slick-vertical');
    } else {
      _.$slider.removeClass('slick-vertical');
    }

    if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined) {
      if (_.options.useCSS === true) {
        _.cssTransitions = true;
      }
    }

    if (_.options.fade) {
      if (typeof _.options.zIndex === 'number') {
        if (_.options.zIndex < 3) {
          _.options.zIndex = 3;
        }
      } else {
        _.options.zIndex = _.defaults.zIndex;
      }
    }

    if (bodyStyle.OTransform !== undefined) {
      _.animType = 'OTransform';
      _.transformType = '-o-transform';
      _.transitionType = 'OTransition';
      if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
    }

    if (bodyStyle.MozTransform !== undefined) {
      _.animType = 'MozTransform';
      _.transformType = '-moz-transform';
      _.transitionType = 'MozTransition';
      if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
    }

    if (bodyStyle.webkitTransform !== undefined) {
      _.animType = 'webkitTransform';
      _.transformType = '-webkit-transform';
      _.transitionType = 'webkitTransition';
      if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
    }

    if (bodyStyle.msTransform !== undefined) {
      _.animType = 'msTransform';
      _.transformType = '-ms-transform';
      _.transitionType = 'msTransition';
      if (bodyStyle.msTransform === undefined) _.animType = false;
    }

    if (bodyStyle.transform !== undefined && _.animType !== false) {
      _.animType = 'transform';
      _.transformType = 'transform';
      _.transitionType = 'transition';
    }

    _.transformsEnabled = _.options.useTransform && _.animType !== null && _.animType !== false;
  };

  Slick.prototype.setSlideClasses = function (index) {
    var _ = this,
        centerOffset,
        allSlides,
        indexOffset,
        remainder;

    allSlides = _.$slider.find('.slick-slide').removeClass('slick-active slick-center slick-current').attr('aria-hidden', 'true');

    _.$slides.eq(index).addClass('slick-current');

    if (_.options.centerMode === true) {
      var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;
      centerOffset = Math.floor(_.options.slidesToShow / 2);

      if (_.options.infinite === true) {
        if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
          _.$slides.slice(index - centerOffset + evenCoef, index + centerOffset + 1).addClass('slick-active').attr('aria-hidden', 'false');
        } else {
          indexOffset = _.options.slidesToShow + index;
          allSlides.slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2).addClass('slick-active').attr('aria-hidden', 'false');
        }

        if (index === 0) {
          allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
        } else if (index === _.slideCount - 1) {
          allSlides.eq(_.options.slidesToShow).addClass('slick-center');
        }
      }

      _.$slides.eq(index).addClass('slick-center');
    } else {
      if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {
        _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
      } else if (allSlides.length <= _.options.slidesToShow) {
        allSlides.addClass('slick-active').attr('aria-hidden', 'false');
      } else {
        remainder = _.slideCount % _.options.slidesToShow;
        indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

        if (_.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow) {
          allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass('slick-active').attr('aria-hidden', 'false');
        } else {
          allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
        }
      }
    }

    if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
      _.lazyLoad();
    }
  };

  Slick.prototype.setupInfinite = function () {
    var _ = this,
        i,
        slideIndex,
        infiniteCount;

    if (_.options.fade === true) {
      _.options.centerMode = false;
    }

    if (_.options.infinite === true && _.options.fade === false) {
      slideIndex = null;

      if (_.slideCount > _.options.slidesToShow) {
        if (_.options.centerMode === true) {
          infiniteCount = _.options.slidesToShow + 1;
        } else {
          infiniteCount = _.options.slidesToShow;
        }

        for (i = _.slideCount; i > _.slideCount - infiniteCount; i -= 1) {
          slideIndex = i - 1;
          $(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex - _.slideCount).prependTo(_.$slideTrack).addClass('slick-cloned');
        }

        for (i = 0; i < infiniteCount + _.slideCount; i += 1) {
          slideIndex = i;
          $(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex + _.slideCount).appendTo(_.$slideTrack).addClass('slick-cloned');
        }

        _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
          $(this).attr('id', '');
        });
      }
    }
  };

  Slick.prototype.interrupt = function (toggle) {
    var _ = this;

    if (!toggle) {
      _.autoPlay();
    }

    _.interrupted = toggle;
  };

  Slick.prototype.selectHandler = function (event) {
    var _ = this;

    var targetElement = $(event.target).is('.slick-slide') ? $(event.target) : $(event.target).parents('.slick-slide');
    var index = parseInt(targetElement.attr('data-slick-index'));
    if (!index) index = 0;

    if (_.slideCount <= _.options.slidesToShow) {
      _.slideHandler(index, false, true);

      return;
    }

    _.slideHandler(index);
  };

  Slick.prototype.slideHandler = function (index, sync, dontAnimate) {
    var targetSlide,
        animSlide,
        oldSlide,
        slideLeft,
        targetLeft = null,
        _ = this,
        navTarget;

    sync = sync || false;

    if (_.animating === true && _.options.waitForAnimate === true) {
      return;
    }

    if (_.options.fade === true && _.currentSlide === index) {
      return;
    }

    if (sync === false) {
      _.asNavFor(index);
    }

    targetSlide = index;
    targetLeft = _.getLeft(targetSlide);
    slideLeft = _.getLeft(_.currentSlide);
    _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

    if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
      if (_.options.fade === false) {
        targetSlide = _.currentSlide;

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
          _.animateSlide(slideLeft, function () {
            _.postSlide(targetSlide);
          });
        } else {
          _.postSlide(targetSlide);
        }
      }

      return;
    } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > _.slideCount - _.options.slidesToScroll)) {
      if (_.options.fade === false) {
        targetSlide = _.currentSlide;

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
          _.animateSlide(slideLeft, function () {
            _.postSlide(targetSlide);
          });
        } else {
          _.postSlide(targetSlide);
        }
      }

      return;
    }

    if (_.options.autoplay) {
      clearInterval(_.autoPlayTimer);
    }

    if (targetSlide < 0) {
      if (_.slideCount % _.options.slidesToScroll !== 0) {
        animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
      } else {
        animSlide = _.slideCount + targetSlide;
      }
    } else if (targetSlide >= _.slideCount) {
      if (_.slideCount % _.options.slidesToScroll !== 0) {
        animSlide = 0;
      } else {
        animSlide = targetSlide - _.slideCount;
      }
    } else {
      animSlide = targetSlide;
    }

    _.animating = true;

    _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

    oldSlide = _.currentSlide;
    _.currentSlide = animSlide;

    _.setSlideClasses(_.currentSlide);

    if (_.options.asNavFor) {
      navTarget = _.getNavTarget();
      navTarget = navTarget.slick('getSlick');

      if (navTarget.slideCount <= navTarget.options.slidesToShow) {
        navTarget.setSlideClasses(_.currentSlide);
      }
    }

    _.updateDots();

    _.updateArrows();

    if (_.options.fade === true) {
      if (dontAnimate !== true) {
        _.fadeSlideOut(oldSlide);

        _.fadeSlide(animSlide, function () {
          _.postSlide(animSlide);
        });
      } else {
        _.postSlide(animSlide);
      }

      _.animateHeight();

      return;
    }

    if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
      _.animateSlide(targetLeft, function () {
        _.postSlide(animSlide);
      });
    } else {
      _.postSlide(animSlide);
    }
  };

  Slick.prototype.startLoad = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.hide();

      _.$nextArrow.hide();
    }

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      _.$dots.hide();
    }

    _.$slider.addClass('slick-loading');
  };

  Slick.prototype.swipeDirection = function () {
    var xDist,
        yDist,
        r,
        swipeAngle,
        _ = this;

    xDist = _.touchObject.startX - _.touchObject.curX;
    yDist = _.touchObject.startY - _.touchObject.curY;
    r = Math.atan2(yDist, xDist);
    swipeAngle = Math.round(r * 180 / Math.PI);

    if (swipeAngle < 0) {
      swipeAngle = 360 - Math.abs(swipeAngle);
    }

    if (swipeAngle <= 45 && swipeAngle >= 0) {
      return _.options.rtl === false ? 'left' : 'right';
    }

    if (swipeAngle <= 360 && swipeAngle >= 315) {
      return _.options.rtl === false ? 'left' : 'right';
    }

    if (swipeAngle >= 135 && swipeAngle <= 225) {
      return _.options.rtl === false ? 'right' : 'left';
    }

    if (_.options.verticalSwiping === true) {
      if (swipeAngle >= 35 && swipeAngle <= 135) {
        return 'down';
      } else {
        return 'up';
      }
    }

    return 'vertical';
  };

  Slick.prototype.swipeEnd = function (event) {
    var _ = this,
        slideCount,
        direction;

    _.dragging = false;
    _.swiping = false;

    if (_.scrolling) {
      _.scrolling = false;
      return false;
    }

    _.interrupted = false;
    _.shouldClick = _.touchObject.swipeLength > 10 ? false : true;

    if (_.touchObject.curX === undefined) {
      return false;
    }

    if (_.touchObject.edgeHit === true) {
      _.$slider.trigger('edge', [_, _.swipeDirection()]);
    }

    if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {
      direction = _.swipeDirection();

      switch (direction) {
        case 'left':
        case 'down':
          slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();
          _.currentDirection = 0;
          break;

        case 'right':
        case 'up':
          slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();
          _.currentDirection = 1;
          break;

        default:
      }

      if (direction != 'vertical') {
        _.slideHandler(slideCount);

        _.touchObject = {};

        _.$slider.trigger('swipe', [_, direction]);
      }
    } else {
      if (_.touchObject.startX !== _.touchObject.curX) {
        _.slideHandler(_.currentSlide);

        _.touchObject = {};
      }
    }
  };

  Slick.prototype.swipeHandler = function (event) {
    var _ = this;

    if (_.options.swipe === false || 'ontouchend' in document && _.options.swipe === false) {
      return;
    } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
      return;
    }

    _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ? event.originalEvent.touches.length : 1;
    _.touchObject.minSwipe = _.listWidth / _.options.touchThreshold;

    if (_.options.verticalSwiping === true) {
      _.touchObject.minSwipe = _.listHeight / _.options.touchThreshold;
    }

    switch (event.data.action) {
      case 'start':
        _.swipeStart(event);

        break;

      case 'move':
        _.swipeMove(event);

        break;

      case 'end':
        _.swipeEnd(event);

        break;
    }
  };

  Slick.prototype.swipeMove = function (event) {
    var _ = this,
        edgeWasHit = false,
        curLeft,
        swipeDirection,
        swipeLength,
        positionOffset,
        touches,
        verticalSwipeLength;

    touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

    if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
      return false;
    }

    curLeft = _.getLeft(_.currentSlide);
    _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
    _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;
    _.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));
    verticalSwipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

    if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
      _.scrolling = true;
      return false;
    }

    if (_.options.verticalSwiping === true) {
      _.touchObject.swipeLength = verticalSwipeLength;
    }

    swipeDirection = _.swipeDirection();

    if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
      _.swiping = true;
      event.preventDefault();
    }

    positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);

    if (_.options.verticalSwiping === true) {
      positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
    }

    swipeLength = _.touchObject.swipeLength;
    _.touchObject.edgeHit = false;

    if (_.options.infinite === false) {
      if (_.currentSlide === 0 && swipeDirection === 'right' || _.currentSlide >= _.getDotCount() && swipeDirection === 'left') {
        swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
        _.touchObject.edgeHit = true;
      }
    }

    if (_.options.vertical === false) {
      _.swipeLeft = curLeft + swipeLength * positionOffset;
    } else {
      _.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
    }

    if (_.options.verticalSwiping === true) {
      _.swipeLeft = curLeft + swipeLength * positionOffset;
    }

    if (_.options.fade === true || _.options.touchMove === false) {
      return false;
    }

    if (_.animating === true) {
      _.swipeLeft = null;
      return false;
    }

    _.setCSS(_.swipeLeft);
  };

  Slick.prototype.swipeStart = function (event) {
    var _ = this,
        touches;

    _.interrupted = true;

    if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
      _.touchObject = {};
      return false;
    }

    if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
      touches = event.originalEvent.touches[0];
    }

    _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
    _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;
    _.dragging = true;
  };

  Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {
    var _ = this;

    if (_.$slidesCache !== null) {
      _.unload();

      _.$slideTrack.children(this.options.slide).detach();

      _.$slidesCache.appendTo(_.$slideTrack);

      _.reinit();
    }
  };

  Slick.prototype.unload = function () {
    var _ = this;

    $('.slick-cloned', _.$slider).remove();

    if (_.$dots) {
      _.$dots.remove();
    }

    if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
      _.$prevArrow.remove();
    }

    if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
      _.$nextArrow.remove();
    }

    _.$slides.removeClass('slick-slide slick-active slick-visible slick-current').attr('aria-hidden', 'true').css('width', '');
  };

  Slick.prototype.unslick = function (fromBreakpoint) {
    var _ = this;

    _.$slider.trigger('unslick', [_, fromBreakpoint]);

    _.destroy();
  };

  Slick.prototype.updateArrows = function () {
    var _ = this,
        centerOffset;

    centerOffset = Math.floor(_.options.slidesToShow / 2);

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow && !_.options.infinite) {
      _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

      _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

      if (_.currentSlide === 0) {
        _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');

        _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
      } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {
        _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');

        _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
      } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {
        _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');

        _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
      }
    }
  };

  Slick.prototype.updateDots = function () {
    var _ = this;

    if (_.$dots !== null) {
      _.$dots.find('li').removeClass('slick-active').end();

      _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active');
    }
  };

  Slick.prototype.visibility = function () {
    var _ = this;

    if (_.options.autoplay) {
      if (document[_.hidden]) {
        _.interrupted = true;
      } else {
        _.interrupted = false;
      }
    }
  };

  $.fn.slick = function () {
    var _ = this,
        opt = arguments[0],
        args = Array.prototype.slice.call(arguments, 1),
        l = _.length,
        i,
        ret;

    for (i = 0; i < l; i++) {
      if (_typeof(opt) == 'object' || typeof opt == 'undefined') _[i].slick = new Slick(_[i], opt);else ret = _[i].slick[opt].apply(_[i].slick, args);
      if (typeof ret != 'undefined') return ret;
    }

    return _;
  };
}); //@codekit-prepend silent './vendor/waypoints/lib/jquery.waypoints.js';

/*!
Waypoints - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/


(function () {
  'use strict';

  var keyCounter = 0;
  var allWaypoints = {};
  /* http://imakewebthings.com/waypoints/api/waypoint */

  function Waypoint(options) {
    if (!options) {
      throw new Error('No options passed to Waypoint constructor');
    }

    if (!options.element) {
      throw new Error('No element option passed to Waypoint constructor');
    }

    if (!options.handler) {
      throw new Error('No handler option passed to Waypoint constructor');
    }

    this.key = 'waypoint-' + keyCounter;
    this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options);
    this.element = this.options.element;
    this.adapter = new Waypoint.Adapter(this.element);
    this.callback = options.handler;
    this.axis = this.options.horizontal ? 'horizontal' : 'vertical';
    this.enabled = this.options.enabled;
    this.triggerPoint = null;
    this.group = Waypoint.Group.findOrCreate({
      name: this.options.group,
      axis: this.axis
    });
    this.context = Waypoint.Context.findOrCreateByElement(this.options.context);

    if (Waypoint.offsetAliases[this.options.offset]) {
      this.options.offset = Waypoint.offsetAliases[this.options.offset];
    }

    this.group.add(this);
    this.context.add(this);
    allWaypoints[this.key] = this;
    keyCounter += 1;
  }
  /* Private */


  Waypoint.prototype.queueTrigger = function (direction) {
    this.group.queueTrigger(this, direction);
  };
  /* Private */


  Waypoint.prototype.trigger = function (args) {
    if (!this.enabled) {
      return;
    }

    if (this.callback) {
      this.callback.apply(this, args);
    }
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/destroy */


  Waypoint.prototype.destroy = function () {
    this.context.remove(this);
    this.group.remove(this);
    delete allWaypoints[this.key];
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/disable */


  Waypoint.prototype.disable = function () {
    this.enabled = false;
    return this;
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/enable */


  Waypoint.prototype.enable = function () {
    this.context.refresh();
    this.enabled = true;
    return this;
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/next */


  Waypoint.prototype.next = function () {
    return this.group.next(this);
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/previous */


  Waypoint.prototype.previous = function () {
    return this.group.previous(this);
  };
  /* Private */


  Waypoint.invokeAll = function (method) {
    var allWaypointsArray = [];

    for (var waypointKey in allWaypoints) {
      allWaypointsArray.push(allWaypoints[waypointKey]);
    }

    for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
      allWaypointsArray[i][method]();
    }
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/destroy-all */


  Waypoint.destroyAll = function () {
    Waypoint.invokeAll('destroy');
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/disable-all */


  Waypoint.disableAll = function () {
    Waypoint.invokeAll('disable');
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/enable-all */


  Waypoint.enableAll = function () {
    Waypoint.Context.refreshAll();

    for (var waypointKey in allWaypoints) {
      allWaypoints[waypointKey].enabled = true;
    }

    return this;
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/refresh-all */


  Waypoint.refreshAll = function () {
    Waypoint.Context.refreshAll();
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/viewport-height */


  Waypoint.viewportHeight = function () {
    return window.innerHeight || document.documentElement.clientHeight;
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/viewport-width */


  Waypoint.viewportWidth = function () {
    return document.documentElement.clientWidth;
  };

  Waypoint.adapters = [];
  Waypoint.defaults = {
    context: window,
    continuous: true,
    enabled: true,
    group: 'default',
    horizontal: false,
    offset: 0
  };
  Waypoint.offsetAliases = {
    'bottom-in-view': function bottomInView() {
      return this.context.innerHeight() - this.adapter.outerHeight();
    },
    'right-in-view': function rightInView() {
      return this.context.innerWidth() - this.adapter.outerWidth();
    }
  };
  window.Waypoint = Waypoint;
})();

(function () {
  'use strict';

  function requestAnimationFrameShim(callback) {
    window.setTimeout(callback, 1000 / 60);
  }

  var keyCounter = 0;
  var contexts = {};
  var Waypoint = window.Waypoint;
  var oldWindowLoad = window.onload;
  /* http://imakewebthings.com/waypoints/api/context */

  function Context(element) {
    this.element = element;
    this.Adapter = Waypoint.Adapter;
    this.adapter = new this.Adapter(element);
    this.key = 'waypoint-context-' + keyCounter;
    this.didScroll = false;
    this.didResize = false;
    this.oldScroll = {
      x: this.adapter.scrollLeft(),
      y: this.adapter.scrollTop()
    };
    this.waypoints = {
      vertical: {},
      horizontal: {}
    };
    element.waypointContextKey = this.key;
    contexts[element.waypointContextKey] = this;
    keyCounter += 1;

    if (!Waypoint.windowContext) {
      Waypoint.windowContext = true;
      Waypoint.windowContext = new Context(window);
    }

    this.createThrottledScrollHandler();
    this.createThrottledResizeHandler();
  }
  /* Private */


  Context.prototype.add = function (waypoint) {
    var axis = waypoint.options.horizontal ? 'horizontal' : 'vertical';
    this.waypoints[axis][waypoint.key] = waypoint;
    this.refresh();
  };
  /* Private */


  Context.prototype.checkEmpty = function () {
    var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal);
    var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical);
    var isWindow = this.element == this.element.window;

    if (horizontalEmpty && verticalEmpty && !isWindow) {
      this.adapter.off('.waypoints');
      delete contexts[this.key];
    }
  };
  /* Private */


  Context.prototype.createThrottledResizeHandler = function () {
    var self = this;

    function resizeHandler() {
      self.handleResize();
      self.didResize = false;
    }

    this.adapter.on('resize.waypoints', function () {
      if (!self.didResize) {
        self.didResize = true;
        Waypoint.requestAnimationFrame(resizeHandler);
      }
    });
  };
  /* Private */


  Context.prototype.createThrottledScrollHandler = function () {
    var self = this;

    function scrollHandler() {
      self.handleScroll();
      self.didScroll = false;
    }

    this.adapter.on('scroll.waypoints', function () {
      if (!self.didScroll || Waypoint.isTouch) {
        self.didScroll = true;
        Waypoint.requestAnimationFrame(scrollHandler);
      }
    });
  };
  /* Private */


  Context.prototype.handleResize = function () {
    Waypoint.Context.refreshAll();
  };
  /* Private */


  Context.prototype.handleScroll = function () {
    var triggeredGroups = {};
    var axes = {
      horizontal: {
        newScroll: this.adapter.scrollLeft(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left'
      },
      vertical: {
        newScroll: this.adapter.scrollTop(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up'
      }
    };

    for (var axisKey in axes) {
      var axis = axes[axisKey];
      var isForward = axis.newScroll > axis.oldScroll;
      var direction = isForward ? axis.forward : axis.backward;

      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey];

        if (waypoint.triggerPoint === null) {
          continue;
        }

        var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint;
        var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint;
        var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint;
        var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint;

        if (crossedForward || crossedBackward) {
          waypoint.queueTrigger(direction);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        }
      }
    }

    for (var groupKey in triggeredGroups) {
      triggeredGroups[groupKey].flushTriggers();
    }

    this.oldScroll = {
      x: axes.horizontal.newScroll,
      y: axes.vertical.newScroll
    };
  };
  /* Private */


  Context.prototype.innerHeight = function () {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportHeight();
    }
    /*eslint-enable eqeqeq */


    return this.adapter.innerHeight();
  };
  /* Private */


  Context.prototype.remove = function (waypoint) {
    delete this.waypoints[waypoint.axis][waypoint.key];
    this.checkEmpty();
  };
  /* Private */


  Context.prototype.innerWidth = function () {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportWidth();
    }
    /*eslint-enable eqeqeq */


    return this.adapter.innerWidth();
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/context-destroy */


  Context.prototype.destroy = function () {
    var allWaypoints = [];

    for (var axis in this.waypoints) {
      for (var waypointKey in this.waypoints[axis]) {
        allWaypoints.push(this.waypoints[axis][waypointKey]);
      }
    }

    for (var i = 0, end = allWaypoints.length; i < end; i++) {
      allWaypoints[i].destroy();
    }
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/context-refresh */


  Context.prototype.refresh = function () {
    /*eslint-disable eqeqeq */
    var isWindow = this.element == this.element.window;
    /*eslint-enable eqeqeq */

    var contextOffset = isWindow ? undefined : this.adapter.offset();
    var triggeredGroups = {};
    var axes;
    this.handleScroll();
    axes = {
      horizontal: {
        contextOffset: isWindow ? 0 : contextOffset.left,
        contextScroll: isWindow ? 0 : this.oldScroll.x,
        contextDimension: this.innerWidth(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left',
        offsetProp: 'left'
      },
      vertical: {
        contextOffset: isWindow ? 0 : contextOffset.top,
        contextScroll: isWindow ? 0 : this.oldScroll.y,
        contextDimension: this.innerHeight(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up',
        offsetProp: 'top'
      }
    };

    for (var axisKey in axes) {
      var axis = axes[axisKey];

      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey];
        var adjustment = waypoint.options.offset;
        var oldTriggerPoint = waypoint.triggerPoint;
        var elementOffset = 0;
        var freshWaypoint = oldTriggerPoint == null;
        var contextModifier, wasBeforeScroll, nowAfterScroll;
        var triggeredBackward, triggeredForward;

        if (waypoint.element !== waypoint.element.window) {
          elementOffset = waypoint.adapter.offset()[axis.offsetProp];
        }

        if (typeof adjustment === 'function') {
          adjustment = adjustment.apply(waypoint);
        } else if (typeof adjustment === 'string') {
          adjustment = parseFloat(adjustment);

          if (waypoint.options.offset.indexOf('%') > -1) {
            adjustment = Math.ceil(axis.contextDimension * adjustment / 100);
          }
        }

        contextModifier = axis.contextScroll - axis.contextOffset;
        waypoint.triggerPoint = Math.floor(elementOffset + contextModifier - adjustment);
        wasBeforeScroll = oldTriggerPoint < axis.oldScroll;
        nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll;
        triggeredBackward = wasBeforeScroll && nowAfterScroll;
        triggeredForward = !wasBeforeScroll && !nowAfterScroll;

        if (!freshWaypoint && triggeredBackward) {
          waypoint.queueTrigger(axis.backward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        } else if (!freshWaypoint && triggeredForward) {
          waypoint.queueTrigger(axis.forward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        } else if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
          waypoint.queueTrigger(axis.forward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        }
      }
    }

    Waypoint.requestAnimationFrame(function () {
      for (var groupKey in triggeredGroups) {
        triggeredGroups[groupKey].flushTriggers();
      }
    });
    return this;
  };
  /* Private */


  Context.findOrCreateByElement = function (element) {
    return Context.findByElement(element) || new Context(element);
  };
  /* Private */


  Context.refreshAll = function () {
    for (var contextId in contexts) {
      contexts[contextId].refresh();
    }
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/context-find-by-element */


  Context.findByElement = function (element) {
    return contexts[element.waypointContextKey];
  };

  window.onload = function () {
    if (oldWindowLoad) {
      oldWindowLoad();
    }

    Context.refreshAll();
  };

  Waypoint.requestAnimationFrame = function (callback) {
    var requestFn = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || requestAnimationFrameShim;
    requestFn.call(window, callback);
  };

  Waypoint.Context = Context;
})();

(function () {
  'use strict';

  function byTriggerPoint(a, b) {
    return a.triggerPoint - b.triggerPoint;
  }

  function byReverseTriggerPoint(a, b) {
    return b.triggerPoint - a.triggerPoint;
  }

  var groups = {
    vertical: {},
    horizontal: {}
  };
  var Waypoint = window.Waypoint;
  /* http://imakewebthings.com/waypoints/api/group */

  function Group(options) {
    this.name = options.name;
    this.axis = options.axis;
    this.id = this.name + '-' + this.axis;
    this.waypoints = [];
    this.clearTriggerQueues();
    groups[this.axis][this.name] = this;
  }
  /* Private */


  Group.prototype.add = function (waypoint) {
    this.waypoints.push(waypoint);
  };
  /* Private */


  Group.prototype.clearTriggerQueues = function () {
    this.triggerQueues = {
      up: [],
      down: [],
      left: [],
      right: []
    };
  };
  /* Private */


  Group.prototype.flushTriggers = function () {
    for (var direction in this.triggerQueues) {
      var waypoints = this.triggerQueues[direction];
      var reverse = direction === 'up' || direction === 'left';
      waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint);

      for (var i = 0, end = waypoints.length; i < end; i += 1) {
        var waypoint = waypoints[i];

        if (waypoint.options.continuous || i === waypoints.length - 1) {
          waypoint.trigger([direction]);
        }
      }
    }

    this.clearTriggerQueues();
  };
  /* Private */


  Group.prototype.next = function (waypoint) {
    this.waypoints.sort(byTriggerPoint);
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
    var isLast = index === this.waypoints.length - 1;
    return isLast ? null : this.waypoints[index + 1];
  };
  /* Private */


  Group.prototype.previous = function (waypoint) {
    this.waypoints.sort(byTriggerPoint);
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
    return index ? this.waypoints[index - 1] : null;
  };
  /* Private */


  Group.prototype.queueTrigger = function (waypoint, direction) {
    this.triggerQueues[direction].push(waypoint);
  };
  /* Private */


  Group.prototype.remove = function (waypoint) {
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);

    if (index > -1) {
      this.waypoints.splice(index, 1);
    }
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/first */


  Group.prototype.first = function () {
    return this.waypoints[0];
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/last */


  Group.prototype.last = function () {
    return this.waypoints[this.waypoints.length - 1];
  };
  /* Private */


  Group.findOrCreate = function (options) {
    return groups[options.axis][options.name] || new Group(options);
  };

  Waypoint.Group = Group;
})();

(function () {
  'use strict';

  var $ = window.jQuery;
  var Waypoint = window.Waypoint;

  function JQueryAdapter(element) {
    this.$element = $(element);
  }

  $.each(['innerHeight', 'innerWidth', 'off', 'offset', 'on', 'outerHeight', 'outerWidth', 'scrollLeft', 'scrollTop'], function (i, method) {
    JQueryAdapter.prototype[method] = function () {
      var args = Array.prototype.slice.call(arguments);
      return this.$element[method].apply(this.$element, args);
    };
  });
  $.each(['extend', 'inArray', 'isEmptyObject'], function (i, method) {
    JQueryAdapter[method] = $[method];
  });
  Waypoint.adapters.push({
    name: 'jquery',
    Adapter: JQueryAdapter
  });
  Waypoint.Adapter = JQueryAdapter;
})();

(function () {
  'use strict';

  var Waypoint = window.Waypoint;

  function createExtension(framework) {
    return function () {
      var waypoints = [];
      var overrides = arguments[0];

      if (framework.isFunction(arguments[0])) {
        overrides = framework.extend({}, arguments[1]);
        overrides.handler = arguments[0];
      }

      this.each(function () {
        var options = framework.extend({}, overrides, {
          element: this
        });

        if (typeof options.context === 'string') {
          options.context = framework(this).closest(options.context)[0];
        }

        waypoints.push(new Waypoint(options));
      });
      return waypoints;
    };
  }

  if (window.jQuery) {
    window.jQuery.fn.waypoint = createExtension(window.jQuery);
  }

  if (window.Zepto) {
    window.Zepto.fn.waypoint = createExtension(window.Zepto);
  }
})(); //@codekit-prepend silent './vendor/jquery-ui.js';

/*! jQuery UI - v1.12.1 - 2020-10-16
* http://jqueryui.com
* Includes: widget.js, position.js, keycode.js, unique-id.js, widgets/autocomplete.js, widgets/menu.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */


(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery"], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
  $.ui = $.ui || {};
  var version = $.ui.version = "1.12.1";
  /*!
   * jQuery UI Widget 1.12.1
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   */
  //>>label: Widget
  //>>group: Core
  //>>description: Provides a factory for creating stateful widgets with a common API.
  //>>docs: http://api.jqueryui.com/jQuery.widget/
  //>>demos: http://jqueryui.com/widget/

  var widgetUuid = 0;
  var widgetSlice = Array.prototype.slice;

  $.cleanData = function (orig) {
    return function (elems) {
      var events, elem, i;

      for (i = 0; (elem = elems[i]) != null; i++) {
        try {
          // Only trigger remove when necessary to save time
          events = $._data(elem, "events");

          if (events && events.remove) {
            $(elem).triggerHandler("remove");
          } // Http://bugs.jquery.com/ticket/8235

        } catch (e) {}
      }

      orig(elems);
    };
  }($.cleanData);

  $.widget = function (name, base, prototype) {
    var existingConstructor, constructor, basePrototype; // ProxiedPrototype allows the provided prototype to remain unmodified
    // so that it can be used as a mixin for multiple widgets (#8876)

    var proxiedPrototype = {};
    var namespace = name.split(".")[0];
    name = name.split(".")[1];
    var fullName = namespace + "-" + name;

    if (!prototype) {
      prototype = base;
      base = $.Widget;
    }

    if ($.isArray(prototype)) {
      prototype = $.extend.apply(null, [{}].concat(prototype));
    } // Create selector for plugin


    $.expr[":"][fullName.toLowerCase()] = function (elem) {
      return !!$.data(elem, fullName);
    };

    $[namespace] = $[namespace] || {};
    existingConstructor = $[namespace][name];

    constructor = $[namespace][name] = function (options, element) {
      // Allow instantiation without "new" keyword
      if (!this._createWidget) {
        return new constructor(options, element);
      } // Allow instantiation without initializing for simple inheritance
      // must use "new" keyword (the code above always passes args)


      if (arguments.length) {
        this._createWidget(options, element);
      }
    }; // Extend with the existing constructor to carry over any static properties


    $.extend(constructor, existingConstructor, {
      version: prototype.version,
      // Copy the object used to create the prototype in case we need to
      // redefine the widget later
      _proto: $.extend({}, prototype),
      // Track widgets that inherit from this widget in case this widget is
      // redefined after a widget inherits from it
      _childConstructors: []
    });
    basePrototype = new base(); // We need to make the options hash a property directly on the new instance
    // otherwise we'll modify the options hash on the prototype that we're
    // inheriting from

    basePrototype.options = $.widget.extend({}, basePrototype.options);
    $.each(prototype, function (prop, value) {
      if (!$.isFunction(value)) {
        proxiedPrototype[prop] = value;
        return;
      }

      proxiedPrototype[prop] = function () {
        function _super() {
          return base.prototype[prop].apply(this, arguments);
        }

        function _superApply(args) {
          return base.prototype[prop].apply(this, args);
        }

        return function () {
          var __super = this._super;
          var __superApply = this._superApply;
          var returnValue;
          this._super = _super;
          this._superApply = _superApply;
          returnValue = value.apply(this, arguments);
          this._super = __super;
          this._superApply = __superApply;
          return returnValue;
        };
      }();
    });
    constructor.prototype = $.widget.extend(basePrototype, {
      // TODO: remove support for widgetEventPrefix
      // always use the name + a colon as the prefix, e.g., draggable:start
      // don't prefix for widgets that aren't DOM-based
      widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix || name : name
    }, proxiedPrototype, {
      constructor: constructor,
      namespace: namespace,
      widgetName: name,
      widgetFullName: fullName
    }); // If this widget is being redefined then we need to find all widgets that
    // are inheriting from it and redefine all of them so that they inherit from
    // the new version of this widget. We're essentially trying to replace one
    // level in the prototype chain.

    if (existingConstructor) {
      $.each(existingConstructor._childConstructors, function (i, child) {
        var childPrototype = child.prototype; // Redefine the child widget using the same prototype that was
        // originally used, but inherit from the new version of the base

        $.widget(childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto);
      }); // Remove the list of existing child constructors from the old constructor
      // so the old child constructors can be garbage collected

      delete existingConstructor._childConstructors;
    } else {
      base._childConstructors.push(constructor);
    }

    $.widget.bridge(name, constructor);
    return constructor;
  };

  $.widget.extend = function (target) {
    var input = widgetSlice.call(arguments, 1);
    var inputIndex = 0;
    var inputLength = input.length;
    var key;
    var value;

    for (; inputIndex < inputLength; inputIndex++) {
      for (key in input[inputIndex]) {
        value = input[inputIndex][key];

        if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
          // Clone objects
          if ($.isPlainObject(value)) {
            target[key] = $.isPlainObject(target[key]) ? $.widget.extend({}, target[key], value) : // Don't extend strings, arrays, etc. with objects
            $.widget.extend({}, value); // Copy everything else by reference
          } else {
            target[key] = value;
          }
        }
      }
    }

    return target;
  };

  $.widget.bridge = function (name, object) {
    var fullName = object.prototype.widgetFullName || name;

    $.fn[name] = function (options) {
      var isMethodCall = typeof options === "string";
      var args = widgetSlice.call(arguments, 1);
      var returnValue = this;

      if (isMethodCall) {
        // If this is an empty collection, we need to have the instance method
        // return undefined instead of the jQuery instance
        if (!this.length && options === "instance") {
          returnValue = undefined;
        } else {
          this.each(function () {
            var methodValue;
            var instance = $.data(this, fullName);

            if (options === "instance") {
              returnValue = instance;
              return false;
            }

            if (!instance) {
              return $.error("cannot call methods on " + name + " prior to initialization; " + "attempted to call method '" + options + "'");
            }

            if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
              return $.error("no such method '" + options + "' for " + name + " widget instance");
            }

            methodValue = instance[options].apply(instance, args);

            if (methodValue !== instance && methodValue !== undefined) {
              returnValue = methodValue && methodValue.jquery ? returnValue.pushStack(methodValue.get()) : methodValue;
              return false;
            }
          });
        }
      } else {
        // Allow multiple hashes to be passed on init
        if (args.length) {
          options = $.widget.extend.apply(null, [options].concat(args));
        }

        this.each(function () {
          var instance = $.data(this, fullName);

          if (instance) {
            instance.option(options || {});

            if (instance._init) {
              instance._init();
            }
          } else {
            $.data(this, fullName, new object(options, this));
          }
        });
      }

      return returnValue;
    };
  };

  $.Widget = function
    /* options, element */
  () {};

  $.Widget._childConstructors = [];
  $.Widget.prototype = {
    widgetName: "widget",
    widgetEventPrefix: "",
    defaultElement: "<div>",
    options: {
      classes: {},
      disabled: false,
      // Callbacks
      create: null
    },
    _createWidget: function _createWidget(options, element) {
      element = $(element || this.defaultElement || this)[0];
      this.element = $(element);
      this.uuid = widgetUuid++;
      this.eventNamespace = "." + this.widgetName + this.uuid;
      this.bindings = $();
      this.hoverable = $();
      this.focusable = $();
      this.classesElementLookup = {};

      if (element !== this) {
        $.data(element, this.widgetFullName, this);

        this._on(true, this.element, {
          remove: function remove(event) {
            if (event.target === element) {
              this.destroy();
            }
          }
        });

        this.document = $(element.style ? // Element within the document
        element.ownerDocument : // Element is window or document
        element.document || element);
        this.window = $(this.document[0].defaultView || this.document[0].parentWindow);
      }

      this.options = $.widget.extend({}, this.options, this._getCreateOptions(), options);

      this._create();

      if (this.options.disabled) {
        this._setOptionDisabled(this.options.disabled);
      }

      this._trigger("create", null, this._getCreateEventData());

      this._init();
    },
    _getCreateOptions: function _getCreateOptions() {
      return {};
    },
    _getCreateEventData: $.noop,
    _create: $.noop,
    _init: $.noop,
    destroy: function destroy() {
      var that = this;

      this._destroy();

      $.each(this.classesElementLookup, function (key, value) {
        that._removeClass(value, key);
      }); // We can probably remove the unbind calls in 2.0
      // all event bindings should go through this._on()

      this.element.off(this.eventNamespace).removeData(this.widgetFullName);
      this.widget().off(this.eventNamespace).removeAttr("aria-disabled"); // Clean up events and states

      this.bindings.off(this.eventNamespace);
    },
    _destroy: $.noop,
    widget: function widget() {
      return this.element;
    },
    option: function option(key, value) {
      var options = key;
      var parts;
      var curOption;
      var i;

      if (arguments.length === 0) {
        // Don't return a reference to the internal hash
        return $.widget.extend({}, this.options);
      }

      if (typeof key === "string") {
        // Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
        options = {};
        parts = key.split(".");
        key = parts.shift();

        if (parts.length) {
          curOption = options[key] = $.widget.extend({}, this.options[key]);

          for (i = 0; i < parts.length - 1; i++) {
            curOption[parts[i]] = curOption[parts[i]] || {};
            curOption = curOption[parts[i]];
          }

          key = parts.pop();

          if (arguments.length === 1) {
            return curOption[key] === undefined ? null : curOption[key];
          }

          curOption[key] = value;
        } else {
          if (arguments.length === 1) {
            return this.options[key] === undefined ? null : this.options[key];
          }

          options[key] = value;
        }
      }

      this._setOptions(options);

      return this;
    },
    _setOptions: function _setOptions(options) {
      var key;

      for (key in options) {
        this._setOption(key, options[key]);
      }

      return this;
    },
    _setOption: function _setOption(key, value) {
      if (key === "classes") {
        this._setOptionClasses(value);
      }

      this.options[key] = value;

      if (key === "disabled") {
        this._setOptionDisabled(value);
      }

      return this;
    },
    _setOptionClasses: function _setOptionClasses(value) {
      var classKey, elements, currentElements;

      for (classKey in value) {
        currentElements = this.classesElementLookup[classKey];

        if (value[classKey] === this.options.classes[classKey] || !currentElements || !currentElements.length) {
          continue;
        } // We are doing this to create a new jQuery object because the _removeClass() call
        // on the next line is going to destroy the reference to the current elements being
        // tracked. We need to save a copy of this collection so that we can add the new classes
        // below.


        elements = $(currentElements.get());

        this._removeClass(currentElements, classKey); // We don't use _addClass() here, because that uses this.options.classes
        // for generating the string of classes. We want to use the value passed in from
        // _setOption(), this is the new value of the classes option which was passed to
        // _setOption(). We pass this value directly to _classes().


        elements.addClass(this._classes({
          element: elements,
          keys: classKey,
          classes: value,
          add: true
        }));
      }
    },
    _setOptionDisabled: function _setOptionDisabled(value) {
      this._toggleClass(this.widget(), this.widgetFullName + "-disabled", null, !!value); // If the widget is becoming disabled, then nothing is interactive


      if (value) {
        this._removeClass(this.hoverable, null, "ui-state-hover");

        this._removeClass(this.focusable, null, "ui-state-focus");
      }
    },
    enable: function enable() {
      return this._setOptions({
        disabled: false
      });
    },
    disable: function disable() {
      return this._setOptions({
        disabled: true
      });
    },
    _classes: function _classes(options) {
      var full = [];
      var that = this;
      options = $.extend({
        element: this.element,
        classes: this.options.classes || {}
      }, options);

      function processClassString(classes, checkOption) {
        var current, i;

        for (i = 0; i < classes.length; i++) {
          current = that.classesElementLookup[classes[i]] || $();

          if (options.add) {
            current = $($.unique(current.get().concat(options.element.get())));
          } else {
            current = $(current.not(options.element).get());
          }

          that.classesElementLookup[classes[i]] = current;
          full.push(classes[i]);

          if (checkOption && options.classes[classes[i]]) {
            full.push(options.classes[classes[i]]);
          }
        }
      }

      this._on(options.element, {
        "remove": "_untrackClassesElement"
      });

      if (options.keys) {
        processClassString(options.keys.match(/\S+/g) || [], true);
      }

      if (options.extra) {
        processClassString(options.extra.match(/\S+/g) || []);
      }

      return full.join(" ");
    },
    _untrackClassesElement: function _untrackClassesElement(event) {
      var that = this;
      $.each(that.classesElementLookup, function (key, value) {
        if ($.inArray(event.target, value) !== -1) {
          that.classesElementLookup[key] = $(value.not(event.target).get());
        }
      });
    },
    _removeClass: function _removeClass(element, keys, extra) {
      return this._toggleClass(element, keys, extra, false);
    },
    _addClass: function _addClass(element, keys, extra) {
      return this._toggleClass(element, keys, extra, true);
    },
    _toggleClass: function _toggleClass(element, keys, extra, add) {
      add = typeof add === "boolean" ? add : extra;
      var shift = typeof element === "string" || element === null,
          options = {
        extra: shift ? keys : extra,
        keys: shift ? element : keys,
        element: shift ? this.element : element,
        add: add
      };
      options.element.toggleClass(this._classes(options), add);
      return this;
    },
    _on: function _on(suppressDisabledCheck, element, handlers) {
      var delegateElement;
      var instance = this; // No suppressDisabledCheck flag, shuffle arguments

      if (typeof suppressDisabledCheck !== "boolean") {
        handlers = element;
        element = suppressDisabledCheck;
        suppressDisabledCheck = false;
      } // No element argument, shuffle and use this.element


      if (!handlers) {
        handlers = element;
        element = this.element;
        delegateElement = this.widget();
      } else {
        element = delegateElement = $(element);
        this.bindings = this.bindings.add(element);
      }

      $.each(handlers, function (event, handler) {
        function handlerProxy() {
          // Allow widgets to customize the disabled handling
          // - disabled as an array instead of boolean
          // - disabled class as method for disabling individual parts
          if (!suppressDisabledCheck && (instance.options.disabled === true || $(this).hasClass("ui-state-disabled"))) {
            return;
          }

          return (typeof handler === "string" ? instance[handler] : handler).apply(instance, arguments);
        } // Copy the guid so direct unbinding works


        if (typeof handler !== "string") {
          handlerProxy.guid = handler.guid = handler.guid || handlerProxy.guid || $.guid++;
        }

        var match = event.match(/^([\w:-]*)\s*(.*)$/);
        var eventName = match[1] + instance.eventNamespace;
        var selector = match[2];

        if (selector) {
          delegateElement.on(eventName, selector, handlerProxy);
        } else {
          element.on(eventName, handlerProxy);
        }
      });
    },
    _off: function _off(element, eventName) {
      eventName = (eventName || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace;
      element.off(eventName).off(eventName); // Clear the stack to avoid memory leaks (#10056)

      this.bindings = $(this.bindings.not(element).get());
      this.focusable = $(this.focusable.not(element).get());
      this.hoverable = $(this.hoverable.not(element).get());
    },
    _delay: function _delay(handler, delay) {
      function handlerProxy() {
        return (typeof handler === "string" ? instance[handler] : handler).apply(instance, arguments);
      }

      var instance = this;
      return setTimeout(handlerProxy, delay || 0);
    },
    _hoverable: function _hoverable(element) {
      this.hoverable = this.hoverable.add(element);

      this._on(element, {
        mouseenter: function mouseenter(event) {
          this._addClass($(event.currentTarget), null, "ui-state-hover");
        },
        mouseleave: function mouseleave(event) {
          this._removeClass($(event.currentTarget), null, "ui-state-hover");
        }
      });
    },
    _focusable: function _focusable(element) {
      this.focusable = this.focusable.add(element);

      this._on(element, {
        focusin: function focusin(event) {
          this._addClass($(event.currentTarget), null, "ui-state-focus");
        },
        focusout: function focusout(event) {
          this._removeClass($(event.currentTarget), null, "ui-state-focus");
        }
      });
    },
    _trigger: function _trigger(type, event, data) {
      var prop, orig;
      var callback = this.options[type];
      data = data || {};
      event = $.Event(event);
      event.type = (type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type).toLowerCase(); // The original event may come from any element
      // so we need to reset the target on the new event

      event.target = this.element[0]; // Copy original event properties over to the new event

      orig = event.originalEvent;

      if (orig) {
        for (prop in orig) {
          if (!(prop in event)) {
            event[prop] = orig[prop];
          }
        }
      }

      this.element.trigger(event, data);
      return !($.isFunction(callback) && callback.apply(this.element[0], [event].concat(data)) === false || event.isDefaultPrevented());
    }
  };
  $.each({
    show: "fadeIn",
    hide: "fadeOut"
  }, function (method, defaultEffect) {
    $.Widget.prototype["_" + method] = function (element, options, callback) {
      if (typeof options === "string") {
        options = {
          effect: options
        };
      }

      var hasOptions;
      var effectName = !options ? method : options === true || typeof options === "number" ? defaultEffect : options.effect || defaultEffect;
      options = options || {};

      if (typeof options === "number") {
        options = {
          duration: options
        };
      }

      hasOptions = !$.isEmptyObject(options);
      options.complete = callback;

      if (options.delay) {
        element.delay(options.delay);
      }

      if (hasOptions && $.effects && $.effects.effect[effectName]) {
        element[method](options);
      } else if (effectName !== method && element[effectName]) {
        element[effectName](options.duration, options.easing, callback);
      } else {
        element.queue(function (next) {
          $(this)[method]();

          if (callback) {
            callback.call(element[0]);
          }

          next();
        });
      }
    };
  });
  var widget = $.widget;
  /*!
   * jQuery UI Position 1.12.1
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * http://api.jqueryui.com/position/
   */
  //>>label: Position
  //>>group: Core
  //>>description: Positions elements relative to other elements.
  //>>docs: http://api.jqueryui.com/position/
  //>>demos: http://jqueryui.com/position/

  (function () {
    var cachedScrollbarWidth,
        max = Math.max,
        abs = Math.abs,
        rhorizontal = /left|center|right/,
        rvertical = /top|center|bottom/,
        roffset = /[\+\-]\d+(\.[\d]+)?%?/,
        rposition = /^\w+/,
        rpercent = /%$/,
        _position = $.fn.position;

    function getOffsets(offsets, width, height) {
      return [parseFloat(offsets[0]) * (rpercent.test(offsets[0]) ? width / 100 : 1), parseFloat(offsets[1]) * (rpercent.test(offsets[1]) ? height / 100 : 1)];
    }

    function parseCss(element, property) {
      return parseInt($.css(element, property), 10) || 0;
    }

    function getDimensions(elem) {
      var raw = elem[0];

      if (raw.nodeType === 9) {
        return {
          width: elem.width(),
          height: elem.height(),
          offset: {
            top: 0,
            left: 0
          }
        };
      }

      if ($.isWindow(raw)) {
        return {
          width: elem.width(),
          height: elem.height(),
          offset: {
            top: elem.scrollTop(),
            left: elem.scrollLeft()
          }
        };
      }

      if (raw.preventDefault) {
        return {
          width: 0,
          height: 0,
          offset: {
            top: raw.pageY,
            left: raw.pageX
          }
        };
      }

      return {
        width: elem.outerWidth(),
        height: elem.outerHeight(),
        offset: elem.offset()
      };
    }

    $.position = {
      scrollbarWidth: function scrollbarWidth() {
        if (cachedScrollbarWidth !== undefined) {
          return cachedScrollbarWidth;
        }

        var w1,
            w2,
            div = $("<div " + "style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" + "<div style='height:100px;width:auto;'></div></div>"),
            innerDiv = div.children()[0];
        $("body").append(div);
        w1 = innerDiv.offsetWidth;
        div.css("overflow", "scroll");
        w2 = innerDiv.offsetWidth;

        if (w1 === w2) {
          w2 = div[0].clientWidth;
        }

        div.remove();
        return cachedScrollbarWidth = w1 - w2;
      },
      getScrollInfo: function getScrollInfo(within) {
        var overflowX = within.isWindow || within.isDocument ? "" : within.element.css("overflow-x"),
            overflowY = within.isWindow || within.isDocument ? "" : within.element.css("overflow-y"),
            hasOverflowX = overflowX === "scroll" || overflowX === "auto" && within.width < within.element[0].scrollWidth,
            hasOverflowY = overflowY === "scroll" || overflowY === "auto" && within.height < within.element[0].scrollHeight;
        return {
          width: hasOverflowY ? $.position.scrollbarWidth() : 0,
          height: hasOverflowX ? $.position.scrollbarWidth() : 0
        };
      },
      getWithinInfo: function getWithinInfo(element) {
        var withinElement = $(element || window),
            isWindow = $.isWindow(withinElement[0]),
            isDocument = !!withinElement[0] && withinElement[0].nodeType === 9,
            hasOffset = !isWindow && !isDocument;
        return {
          element: withinElement,
          isWindow: isWindow,
          isDocument: isDocument,
          offset: hasOffset ? $(element).offset() : {
            left: 0,
            top: 0
          },
          scrollLeft: withinElement.scrollLeft(),
          scrollTop: withinElement.scrollTop(),
          width: withinElement.outerWidth(),
          height: withinElement.outerHeight()
        };
      }
    };

    $.fn.position = function (options) {
      if (!options || !options.of) {
        return _position.apply(this, arguments);
      } // Make a copy, we don't want to modify arguments


      options = $.extend({}, options);
      var atOffset,
          targetWidth,
          targetHeight,
          targetOffset,
          basePosition,
          dimensions,
          target = $(options.of),
          within = $.position.getWithinInfo(options.within),
          scrollInfo = $.position.getScrollInfo(within),
          collision = (options.collision || "flip").split(" "),
          offsets = {};
      dimensions = getDimensions(target);

      if (target[0].preventDefault) {
        // Force left top to allow flipping
        options.at = "left top";
      }

      targetWidth = dimensions.width;
      targetHeight = dimensions.height;
      targetOffset = dimensions.offset; // Clone to reuse original targetOffset later

      basePosition = $.extend({}, targetOffset); // Force my and at to have valid horizontal and vertical positions
      // if a value is missing or invalid, it will be converted to center

      $.each(["my", "at"], function () {
        var pos = (options[this] || "").split(" "),
            horizontalOffset,
            verticalOffset;

        if (pos.length === 1) {
          pos = rhorizontal.test(pos[0]) ? pos.concat(["center"]) : rvertical.test(pos[0]) ? ["center"].concat(pos) : ["center", "center"];
        }

        pos[0] = rhorizontal.test(pos[0]) ? pos[0] : "center";
        pos[1] = rvertical.test(pos[1]) ? pos[1] : "center"; // Calculate offsets

        horizontalOffset = roffset.exec(pos[0]);
        verticalOffset = roffset.exec(pos[1]);
        offsets[this] = [horizontalOffset ? horizontalOffset[0] : 0, verticalOffset ? verticalOffset[0] : 0]; // Reduce to just the positions without the offsets

        options[this] = [rposition.exec(pos[0])[0], rposition.exec(pos[1])[0]];
      }); // Normalize collision option

      if (collision.length === 1) {
        collision[1] = collision[0];
      }

      if (options.at[0] === "right") {
        basePosition.left += targetWidth;
      } else if (options.at[0] === "center") {
        basePosition.left += targetWidth / 2;
      }

      if (options.at[1] === "bottom") {
        basePosition.top += targetHeight;
      } else if (options.at[1] === "center") {
        basePosition.top += targetHeight / 2;
      }

      atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
      basePosition.left += atOffset[0];
      basePosition.top += atOffset[1];
      return this.each(function () {
        var collisionPosition,
            using,
            elem = $(this),
            elemWidth = elem.outerWidth(),
            elemHeight = elem.outerHeight(),
            marginLeft = parseCss(this, "marginLeft"),
            marginTop = parseCss(this, "marginTop"),
            collisionWidth = elemWidth + marginLeft + parseCss(this, "marginRight") + scrollInfo.width,
            collisionHeight = elemHeight + marginTop + parseCss(this, "marginBottom") + scrollInfo.height,
            position = $.extend({}, basePosition),
            myOffset = getOffsets(offsets.my, elem.outerWidth(), elem.outerHeight());

        if (options.my[0] === "right") {
          position.left -= elemWidth;
        } else if (options.my[0] === "center") {
          position.left -= elemWidth / 2;
        }

        if (options.my[1] === "bottom") {
          position.top -= elemHeight;
        } else if (options.my[1] === "center") {
          position.top -= elemHeight / 2;
        }

        position.left += myOffset[0];
        position.top += myOffset[1];
        collisionPosition = {
          marginLeft: marginLeft,
          marginTop: marginTop
        };
        $.each(["left", "top"], function (i, dir) {
          if ($.ui.position[collision[i]]) {
            $.ui.position[collision[i]][dir](position, {
              targetWidth: targetWidth,
              targetHeight: targetHeight,
              elemWidth: elemWidth,
              elemHeight: elemHeight,
              collisionPosition: collisionPosition,
              collisionWidth: collisionWidth,
              collisionHeight: collisionHeight,
              offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
              my: options.my,
              at: options.at,
              within: within,
              elem: elem
            });
          }
        });

        if (options.using) {
          // Adds feedback as second argument to using callback, if present
          using = function using(props) {
            var left = targetOffset.left - position.left,
                right = left + targetWidth - elemWidth,
                top = targetOffset.top - position.top,
                bottom = top + targetHeight - elemHeight,
                feedback = {
              target: {
                element: target,
                left: targetOffset.left,
                top: targetOffset.top,
                width: targetWidth,
                height: targetHeight
              },
              element: {
                element: elem,
                left: position.left,
                top: position.top,
                width: elemWidth,
                height: elemHeight
              },
              horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
              vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
            };

            if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
              feedback.horizontal = "center";
            }

            if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
              feedback.vertical = "middle";
            }

            if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
              feedback.important = "horizontal";
            } else {
              feedback.important = "vertical";
            }

            options.using.call(this, props, feedback);
          };
        }

        elem.offset($.extend(position, {
          using: using
        }));
      });
    };

    $.ui.position = {
      fit: {
        left: function left(position, data) {
          var within = data.within,
              withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
              outerWidth = within.width,
              collisionPosLeft = position.left - data.collisionPosition.marginLeft,
              overLeft = withinOffset - collisionPosLeft,
              overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
              newOverRight; // Element is wider than within

          if (data.collisionWidth > outerWidth) {
            // Element is initially over the left side of within
            if (overLeft > 0 && overRight <= 0) {
              newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
              position.left += overLeft - newOverRight; // Element is initially over right side of within
            } else if (overRight > 0 && overLeft <= 0) {
              position.left = withinOffset; // Element is initially over both left and right sides of within
            } else {
              if (overLeft > overRight) {
                position.left = withinOffset + outerWidth - data.collisionWidth;
              } else {
                position.left = withinOffset;
              }
            } // Too far left -> align with left edge

          } else if (overLeft > 0) {
            position.left += overLeft; // Too far right -> align with right edge
          } else if (overRight > 0) {
            position.left -= overRight; // Adjust based on position and margin
          } else {
            position.left = max(position.left - collisionPosLeft, position.left);
          }
        },
        top: function top(position, data) {
          var within = data.within,
              withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
              outerHeight = data.within.height,
              collisionPosTop = position.top - data.collisionPosition.marginTop,
              overTop = withinOffset - collisionPosTop,
              overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
              newOverBottom; // Element is taller than within

          if (data.collisionHeight > outerHeight) {
            // Element is initially over the top of within
            if (overTop > 0 && overBottom <= 0) {
              newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
              position.top += overTop - newOverBottom; // Element is initially over bottom of within
            } else if (overBottom > 0 && overTop <= 0) {
              position.top = withinOffset; // Element is initially over both top and bottom of within
            } else {
              if (overTop > overBottom) {
                position.top = withinOffset + outerHeight - data.collisionHeight;
              } else {
                position.top = withinOffset;
              }
            } // Too far up -> align with top

          } else if (overTop > 0) {
            position.top += overTop; // Too far down -> align with bottom edge
          } else if (overBottom > 0) {
            position.top -= overBottom; // Adjust based on position and margin
          } else {
            position.top = max(position.top - collisionPosTop, position.top);
          }
        }
      },
      flip: {
        left: function left(position, data) {
          var within = data.within,
              withinOffset = within.offset.left + within.scrollLeft,
              outerWidth = within.width,
              offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
              collisionPosLeft = position.left - data.collisionPosition.marginLeft,
              overLeft = collisionPosLeft - offsetLeft,
              overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
              myOffset = data.my[0] === "left" ? -data.elemWidth : data.my[0] === "right" ? data.elemWidth : 0,
              atOffset = data.at[0] === "left" ? data.targetWidth : data.at[0] === "right" ? -data.targetWidth : 0,
              offset = -2 * data.offset[0],
              newOverRight,
              newOverLeft;

          if (overLeft < 0) {
            newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;

            if (newOverRight < 0 || newOverRight < abs(overLeft)) {
              position.left += myOffset + atOffset + offset;
            }
          } else if (overRight > 0) {
            newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;

            if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
              position.left += myOffset + atOffset + offset;
            }
          }
        },
        top: function top(position, data) {
          var within = data.within,
              withinOffset = within.offset.top + within.scrollTop,
              outerHeight = within.height,
              offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
              collisionPosTop = position.top - data.collisionPosition.marginTop,
              overTop = collisionPosTop - offsetTop,
              overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
              top = data.my[1] === "top",
              myOffset = top ? -data.elemHeight : data.my[1] === "bottom" ? data.elemHeight : 0,
              atOffset = data.at[1] === "top" ? data.targetHeight : data.at[1] === "bottom" ? -data.targetHeight : 0,
              offset = -2 * data.offset[1],
              newOverTop,
              newOverBottom;

          if (overTop < 0) {
            newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;

            if (newOverBottom < 0 || newOverBottom < abs(overTop)) {
              position.top += myOffset + atOffset + offset;
            }
          } else if (overBottom > 0) {
            newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;

            if (newOverTop > 0 || abs(newOverTop) < overBottom) {
              position.top += myOffset + atOffset + offset;
            }
          }
        }
      },
      flipfit: {
        left: function left() {
          $.ui.position.flip.left.apply(this, arguments);
          $.ui.position.fit.left.apply(this, arguments);
        },
        top: function top() {
          $.ui.position.flip.top.apply(this, arguments);
          $.ui.position.fit.top.apply(this, arguments);
        }
      }
    };
  })();

  var position = $.ui.position;
  /*!
   * jQuery UI Keycode 1.12.1
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   */
  //>>label: Keycode
  //>>group: Core
  //>>description: Provide keycodes as keynames
  //>>docs: http://api.jqueryui.com/jQuery.ui.keyCode/

  var keycode = $.ui.keyCode = {
    BACKSPACE: 8,
    COMMA: 188,
    DELETE: 46,
    DOWN: 40,
    END: 35,
    ENTER: 13,
    ESCAPE: 27,
    HOME: 36,
    LEFT: 37,
    PAGE_DOWN: 34,
    PAGE_UP: 33,
    PERIOD: 190,
    RIGHT: 39,
    SPACE: 32,
    TAB: 9,
    UP: 38
  };
  /*!
   * jQuery UI Unique ID 1.12.1
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   */
  //>>label: uniqueId
  //>>group: Core
  //>>description: Functions to generate and remove uniqueId's
  //>>docs: http://api.jqueryui.com/uniqueId/

  var uniqueId = $.fn.extend({
    uniqueId: function () {
      var uuid = 0;
      return function () {
        return this.each(function () {
          if (!this.id) {
            this.id = "ui-id-" + ++uuid;
          }
        });
      };
    }(),
    removeUniqueId: function removeUniqueId() {
      return this.each(function () {
        if (/^ui-id-\d+$/.test(this.id)) {
          $(this).removeAttr("id");
        }
      });
    }
  });

  var safeActiveElement = $.ui.safeActiveElement = function (document) {
    var activeElement; // Support: IE 9 only
    // IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>

    try {
      activeElement = document.activeElement;
    } catch (error) {
      activeElement = document.body;
    } // Support: IE 9 - 11 only
    // IE may return null instead of an element
    // Interestingly, this only seems to occur when NOT in an iframe


    if (!activeElement) {
      activeElement = document.body;
    } // Support: IE 11 only
    // IE11 returns a seemingly empty object in some cases when accessing
    // document.activeElement from an <iframe>


    if (!activeElement.nodeName) {
      activeElement = document.body;
    }

    return activeElement;
  };
  /*!
   * jQuery UI Menu 1.12.1
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   */
  //>>label: Menu
  //>>group: Widgets
  //>>description: Creates nestable menus.
  //>>docs: http://api.jqueryui.com/menu/
  //>>demos: http://jqueryui.com/menu/
  //>>css.structure: ../../themes/base/core.css
  //>>css.structure: ../../themes/base/menu.css
  //>>css.theme: ../../themes/base/theme.css


  var widgetsMenu = $.widget("ui.menu", {
    version: "1.12.1",
    defaultElement: "<ul>",
    delay: 300,
    options: {
      icons: {
        submenu: "ui-icon-caret-1-e"
      },
      items: "> *",
      menus: "ul",
      position: {
        my: "left top",
        at: "right top"
      },
      role: "menu",
      // Callbacks
      blur: null,
      focus: null,
      select: null
    },
    _create: function _create() {
      this.activeMenu = this.element; // Flag used to prevent firing of the click handler
      // as the event bubbles up through nested menus

      this.mouseHandled = false;
      this.element.uniqueId().attr({
        role: this.options.role,
        tabIndex: 0
      });

      this._addClass("ui-menu", "ui-widget ui-widget-content");

      this._on({
        // Prevent focus from sticking to links inside menu after clicking
        // them (focus should always stay on UL during navigation).
        "mousedown .ui-menu-item": function mousedownUiMenuItem(event) {
          event.preventDefault();
        },
        "click .ui-menu-item": function clickUiMenuItem(event) {
          var target = $(event.target);
          var active = $($.ui.safeActiveElement(this.document[0]));

          if (!this.mouseHandled && target.not(".ui-state-disabled").length) {
            this.select(event); // Only set the mouseHandled flag if the event will bubble, see #9469.

            if (!event.isPropagationStopped()) {
              this.mouseHandled = true;
            } // Open submenu on click


            if (target.has(".ui-menu").length) {
              this.expand(event);
            } else if (!this.element.is(":focus") && active.closest(".ui-menu").length) {
              // Redirect focus to the menu
              this.element.trigger("focus", [true]); // If the active item is on the top level, let it stay active.
              // Otherwise, blur the active item since it is no longer visible.

              if (this.active && this.active.parents(".ui-menu").length === 1) {
                clearTimeout(this.timer);
              }
            }
          }
        },
        "mouseenter .ui-menu-item": function mouseenterUiMenuItem(event) {
          // Ignore mouse events while typeahead is active, see #10458.
          // Prevents focusing the wrong item when typeahead causes a scroll while the mouse
          // is over an item in the menu
          if (this.previousFilter) {
            return;
          }

          var actualTarget = $(event.target).closest(".ui-menu-item"),
              target = $(event.currentTarget); // Ignore bubbled events on parent items, see #11641

          if (actualTarget[0] !== target[0]) {
            return;
          } // Remove ui-state-active class from siblings of the newly focused menu item
          // to avoid a jump caused by adjacent elements both having a class with a border


          this._removeClass(target.siblings().children(".ui-state-active"), null, "ui-state-active");

          this.focus(event, target);
        },
        mouseleave: "collapseAll",
        "mouseleave .ui-menu": "collapseAll",
        focus: function focus(event, keepActiveItem) {
          // If there's already an active item, keep it active
          // If not, activate the first item
          var item = this.active || this.element.find(this.options.items).eq(0);

          if (!keepActiveItem) {
            this.focus(event, item);
          }
        },
        blur: function blur(event) {
          this._delay(function () {
            var notContained = !$.contains(this.element[0], $.ui.safeActiveElement(this.document[0]));

            if (notContained) {
              this.collapseAll(event);
            }
          });
        },
        keydown: "_keydown"
      });

      this.refresh(); // Clicks outside of a menu collapse any open menus

      this._on(this.document, {
        click: function click(event) {
          if (this._closeOnDocumentClick(event)) {
            this.collapseAll(event);
          } // Reset the mouseHandled flag


          this.mouseHandled = false;
        }
      });
    },
    _destroy: function _destroy() {
      var items = this.element.find(".ui-menu-item").removeAttr("role aria-disabled"),
          submenus = items.children(".ui-menu-item-wrapper").removeUniqueId().removeAttr("tabIndex role aria-haspopup"); // Destroy (sub)menus

      this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeAttr("role aria-labelledby aria-expanded aria-hidden aria-disabled " + "tabIndex").removeUniqueId().show();
      submenus.children().each(function () {
        var elem = $(this);

        if (elem.data("ui-menu-submenu-caret")) {
          elem.remove();
        }
      });
    },
    _keydown: function _keydown(event) {
      var match,
          prev,
          character,
          skip,
          preventDefault = true;

      switch (event.keyCode) {
        case $.ui.keyCode.PAGE_UP:
          this.previousPage(event);
          break;

        case $.ui.keyCode.PAGE_DOWN:
          this.nextPage(event);
          break;

        case $.ui.keyCode.HOME:
          this._move("first", "first", event);

          break;

        case $.ui.keyCode.END:
          this._move("last", "last", event);

          break;

        case $.ui.keyCode.UP:
          this.previous(event);
          break;

        case $.ui.keyCode.DOWN:
          this.next(event);
          break;

        case $.ui.keyCode.LEFT:
          this.collapse(event);
          break;

        case $.ui.keyCode.RIGHT:
          if (this.active && !this.active.is(".ui-state-disabled")) {
            this.expand(event);
          }

          break;

        case $.ui.keyCode.ENTER:
        case $.ui.keyCode.SPACE:
          this._activate(event);

          break;

        case $.ui.keyCode.ESCAPE:
          this.collapse(event);
          break;

        default:
          preventDefault = false;
          prev = this.previousFilter || "";
          skip = false; // Support number pad values

          character = event.keyCode >= 96 && event.keyCode <= 105 ? (event.keyCode - 96).toString() : String.fromCharCode(event.keyCode);
          clearTimeout(this.filterTimer);

          if (character === prev) {
            skip = true;
          } else {
            character = prev + character;
          }

          match = this._filterMenuItems(character);
          match = skip && match.index(this.active.next()) !== -1 ? this.active.nextAll(".ui-menu-item") : match; // If no matches on the current filter, reset to the last character pressed
          // to move down the menu to the first item that starts with that character

          if (!match.length) {
            character = String.fromCharCode(event.keyCode);
            match = this._filterMenuItems(character);
          }

          if (match.length) {
            this.focus(event, match);
            this.previousFilter = character;
            this.filterTimer = this._delay(function () {
              delete this.previousFilter;
            }, 1000);
          } else {
            delete this.previousFilter;
          }

      }

      if (preventDefault) {
        event.preventDefault();
      }
    },
    _activate: function _activate(event) {
      if (this.active && !this.active.is(".ui-state-disabled")) {
        if (this.active.children("[aria-haspopup='true']").length) {
          this.expand(event);
        } else {
          this.select(event);
        }
      }
    },
    refresh: function refresh() {
      var menus,
          items,
          newSubmenus,
          newItems,
          newWrappers,
          that = this,
          icon = this.options.icons.submenu,
          submenus = this.element.find(this.options.menus);

      this._toggleClass("ui-menu-icons", null, !!this.element.find(".ui-icon").length); // Initialize nested menus


      newSubmenus = submenus.filter(":not(.ui-menu)").hide().attr({
        role: this.options.role,
        "aria-hidden": "true",
        "aria-expanded": "false"
      }).each(function () {
        var menu = $(this),
            item = menu.prev(),
            submenuCaret = $("<span>").data("ui-menu-submenu-caret", true);

        that._addClass(submenuCaret, "ui-menu-icon", "ui-icon " + icon);

        item.attr("aria-haspopup", "true").prepend(submenuCaret);
        menu.attr("aria-labelledby", item.attr("id"));
      });

      this._addClass(newSubmenus, "ui-menu", "ui-widget ui-widget-content ui-front");

      menus = submenus.add(this.element);
      items = menus.find(this.options.items); // Initialize menu-items containing spaces and/or dashes only as dividers

      items.not(".ui-menu-item").each(function () {
        var item = $(this);

        if (that._isDivider(item)) {
          that._addClass(item, "ui-menu-divider", "ui-widget-content");
        }
      }); // Don't refresh list items that are already adapted

      newItems = items.not(".ui-menu-item, .ui-menu-divider");
      newWrappers = newItems.children().not(".ui-menu").uniqueId().attr({
        tabIndex: -1,
        role: this._itemRole()
      });

      this._addClass(newItems, "ui-menu-item")._addClass(newWrappers, "ui-menu-item-wrapper"); // Add aria-disabled attribute to any disabled menu item


      items.filter(".ui-state-disabled").attr("aria-disabled", "true"); // If the active item has been removed, blur the menu

      if (this.active && !$.contains(this.element[0], this.active[0])) {
        this.blur();
      }
    },
    _itemRole: function _itemRole() {
      return {
        menu: "menuitem",
        listbox: "option"
      }[this.options.role];
    },
    _setOption: function _setOption(key, value) {
      if (key === "icons") {
        var icons = this.element.find(".ui-menu-icon");

        this._removeClass(icons, null, this.options.icons.submenu)._addClass(icons, null, value.submenu);
      }

      this._super(key, value);
    },
    _setOptionDisabled: function _setOptionDisabled(value) {
      this._super(value);

      this.element.attr("aria-disabled", String(value));

      this._toggleClass(null, "ui-state-disabled", !!value);
    },
    focus: function focus(event, item) {
      var nested, focused, activeParent;
      this.blur(event, event && event.type === "focus");

      this._scrollIntoView(item);

      this.active = item.first();
      focused = this.active.children(".ui-menu-item-wrapper");

      this._addClass(focused, null, "ui-state-active"); // Only update aria-activedescendant if there's a role
      // otherwise we assume focus is managed elsewhere


      if (this.options.role) {
        this.element.attr("aria-activedescendant", focused.attr("id"));
      } // Highlight active parent menu item, if any


      activeParent = this.active.parent().closest(".ui-menu-item").children(".ui-menu-item-wrapper");

      this._addClass(activeParent, null, "ui-state-active");

      if (event && event.type === "keydown") {
        this._close();
      } else {
        this.timer = this._delay(function () {
          this._close();
        }, this.delay);
      }

      nested = item.children(".ui-menu");

      if (nested.length && event && /^mouse/.test(event.type)) {
        this._startOpening(nested);
      }

      this.activeMenu = item.parent();

      this._trigger("focus", event, {
        item: item
      });
    },
    _scrollIntoView: function _scrollIntoView(item) {
      var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;

      if (this._hasScroll()) {
        borderTop = parseFloat($.css(this.activeMenu[0], "borderTopWidth")) || 0;
        paddingTop = parseFloat($.css(this.activeMenu[0], "paddingTop")) || 0;
        offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
        scroll = this.activeMenu.scrollTop();
        elementHeight = this.activeMenu.height();
        itemHeight = item.outerHeight();

        if (offset < 0) {
          this.activeMenu.scrollTop(scroll + offset);
        } else if (offset + itemHeight > elementHeight) {
          this.activeMenu.scrollTop(scroll + offset - elementHeight + itemHeight);
        }
      }
    },
    blur: function blur(event, fromFocus) {
      if (!fromFocus) {
        clearTimeout(this.timer);
      }

      if (!this.active) {
        return;
      }

      this._removeClass(this.active.children(".ui-menu-item-wrapper"), null, "ui-state-active");

      this._trigger("blur", event, {
        item: this.active
      });

      this.active = null;
    },
    _startOpening: function _startOpening(submenu) {
      clearTimeout(this.timer); // Don't open if already open fixes a Firefox bug that caused a .5 pixel
      // shift in the submenu position when mousing over the caret icon

      if (submenu.attr("aria-hidden") !== "true") {
        return;
      }

      this.timer = this._delay(function () {
        this._close();

        this._open(submenu);
      }, this.delay);
    },
    _open: function _open(submenu) {
      var position = $.extend({
        of: this.active
      }, this.options.position);
      clearTimeout(this.timer);
      this.element.find(".ui-menu").not(submenu.parents(".ui-menu")).hide().attr("aria-hidden", "true");
      submenu.show().removeAttr("aria-hidden").attr("aria-expanded", "true").position(position);
    },
    collapseAll: function collapseAll(event, all) {
      clearTimeout(this.timer);
      this.timer = this._delay(function () {
        // If we were passed an event, look for the submenu that contains the event
        var currentMenu = all ? this.element : $(event && event.target).closest(this.element.find(".ui-menu")); // If we found no valid submenu ancestor, use the main menu to close all
        // sub menus anyway

        if (!currentMenu.length) {
          currentMenu = this.element;
        }

        this._close(currentMenu);

        this.blur(event); // Work around active item staying active after menu is blurred

        this._removeClass(currentMenu.find(".ui-state-active"), null, "ui-state-active");

        this.activeMenu = currentMenu;
      }, this.delay);
    },
    // With no arguments, closes the currently active menu - if nothing is active
    // it closes all menus.  If passed an argument, it will search for menus BELOW
    _close: function _close(startMenu) {
      if (!startMenu) {
        startMenu = this.active ? this.active.parent() : this.element;
      }

      startMenu.find(".ui-menu").hide().attr("aria-hidden", "true").attr("aria-expanded", "false");
    },
    _closeOnDocumentClick: function _closeOnDocumentClick(event) {
      return !$(event.target).closest(".ui-menu").length;
    },
    _isDivider: function _isDivider(item) {
      // Match hyphen, em dash, en dash
      return !/[^\-\u2014\u2013\s]/.test(item.text());
    },
    collapse: function collapse(event) {
      var newItem = this.active && this.active.parent().closest(".ui-menu-item", this.element);

      if (newItem && newItem.length) {
        this._close();

        this.focus(event, newItem);
      }
    },
    expand: function expand(event) {
      var newItem = this.active && this.active.children(".ui-menu ").find(this.options.items).first();

      if (newItem && newItem.length) {
        this._open(newItem.parent()); // Delay so Firefox will not hide activedescendant change in expanding submenu from AT


        this._delay(function () {
          this.focus(event, newItem);
        });
      }
    },
    next: function next(event) {
      this._move("next", "first", event);
    },
    previous: function previous(event) {
      this._move("prev", "last", event);
    },
    isFirstItem: function isFirstItem() {
      return this.active && !this.active.prevAll(".ui-menu-item").length;
    },
    isLastItem: function isLastItem() {
      return this.active && !this.active.nextAll(".ui-menu-item").length;
    },
    _move: function _move(direction, filter, event) {
      var next;

      if (this.active) {
        if (direction === "first" || direction === "last") {
          next = this.active[direction === "first" ? "prevAll" : "nextAll"](".ui-menu-item").eq(-1);
        } else {
          next = this.active[direction + "All"](".ui-menu-item").eq(0);
        }
      }

      if (!next || !next.length || !this.active) {
        next = this.activeMenu.find(this.options.items)[filter]();
      }

      this.focus(event, next);
    },
    nextPage: function nextPage(event) {
      var item, base, height;

      if (!this.active) {
        this.next(event);
        return;
      }

      if (this.isLastItem()) {
        return;
      }

      if (this._hasScroll()) {
        base = this.active.offset().top;
        height = this.element.height();
        this.active.nextAll(".ui-menu-item").each(function () {
          item = $(this);
          return item.offset().top - base - height < 0;
        });
        this.focus(event, item);
      } else {
        this.focus(event, this.activeMenu.find(this.options.items)[!this.active ? "first" : "last"]());
      }
    },
    previousPage: function previousPage(event) {
      var item, base, height;

      if (!this.active) {
        this.next(event);
        return;
      }

      if (this.isFirstItem()) {
        return;
      }

      if (this._hasScroll()) {
        base = this.active.offset().top;
        height = this.element.height();
        this.active.prevAll(".ui-menu-item").each(function () {
          item = $(this);
          return item.offset().top - base + height > 0;
        });
        this.focus(event, item);
      } else {
        this.focus(event, this.activeMenu.find(this.options.items).first());
      }
    },
    _hasScroll: function _hasScroll() {
      return this.element.outerHeight() < this.element.prop("scrollHeight");
    },
    select: function select(event) {
      // TODO: It should never be possible to not have an active item at this
      // point, but the tests don't trigger mouseenter before click.
      this.active = this.active || $(event.target).closest(".ui-menu-item");
      var ui = {
        item: this.active
      };

      if (!this.active.has(".ui-menu").length) {
        this.collapseAll(event, true);
      }

      this._trigger("select", event, ui);
    },
    _filterMenuItems: function _filterMenuItems(character) {
      var escapedCharacter = character.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"),
          regex = new RegExp("^" + escapedCharacter, "i");
      return this.activeMenu.find(this.options.items) // Only match on items, not dividers or other content (#10571)
      .filter(".ui-menu-item").filter(function () {
        return regex.test($.trim($(this).children(".ui-menu-item-wrapper").text()));
      });
    }
  });
  /*!
   * jQuery UI Autocomplete 1.12.1
   * http://jqueryui.com
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   */
  //>>label: Autocomplete
  //>>group: Widgets
  //>>description: Lists suggested words as the user is typing.
  //>>docs: http://api.jqueryui.com/autocomplete/
  //>>demos: http://jqueryui.com/autocomplete/
  //>>css.structure: ../../themes/base/core.css
  //>>css.structure: ../../themes/base/autocomplete.css
  //>>css.theme: ../../themes/base/theme.css

  $.widget("ui.autocomplete", {
    version: "1.12.1",
    defaultElement: "<input>",
    options: {
      appendTo: null,
      autoFocus: false,
      delay: 300,
      minLength: 1,
      position: {
        my: "left top",
        at: "left bottom",
        collision: "none"
      },
      source: null,
      // Callbacks
      change: null,
      close: null,
      focus: null,
      open: null,
      response: null,
      search: null,
      select: null
    },
    requestIndex: 0,
    pending: 0,
    _create: function _create() {
      // Some browsers only repeat keydown events, not keypress events,
      // so we use the suppressKeyPress flag to determine if we've already
      // handled the keydown event. #7269
      // Unfortunately the code for & in keypress is the same as the up arrow,
      // so we use the suppressKeyPressRepeat flag to avoid handling keypress
      // events when we know the keydown event was used to modify the
      // search term. #7799
      var suppressKeyPress,
          suppressKeyPressRepeat,
          suppressInput,
          nodeName = this.element[0].nodeName.toLowerCase(),
          isTextarea = nodeName === "textarea",
          isInput = nodeName === "input"; // Textareas are always multi-line
      // Inputs are always single-line, even if inside a contentEditable element
      // IE also treats inputs as contentEditable
      // All other element types are determined by whether or not they're contentEditable

      this.isMultiLine = isTextarea || !isInput && this._isContentEditable(this.element);
      this.valueMethod = this.element[isTextarea || isInput ? "val" : "text"];
      this.isNewMenu = true;

      this._addClass("ui-autocomplete-input");

      this.element.attr("autocomplete", "off");

      this._on(this.element, {
        keydown: function keydown(event) {
          if (this.element.prop("readOnly")) {
            suppressKeyPress = true;
            suppressInput = true;
            suppressKeyPressRepeat = true;
            return;
          }

          suppressKeyPress = false;
          suppressInput = false;
          suppressKeyPressRepeat = false;
          var keyCode = $.ui.keyCode;

          switch (event.keyCode) {
            case keyCode.PAGE_UP:
              suppressKeyPress = true;

              this._move("previousPage", event);

              break;

            case keyCode.PAGE_DOWN:
              suppressKeyPress = true;

              this._move("nextPage", event);

              break;

            case keyCode.UP:
              suppressKeyPress = true;

              this._keyEvent("previous", event);

              break;

            case keyCode.DOWN:
              suppressKeyPress = true;

              this._keyEvent("next", event);

              break;

            case keyCode.ENTER:
              // when menu is open and has focus
              if (this.menu.active) {
                // #6055 - Opera still allows the keypress to occur
                // which causes forms to submit
                suppressKeyPress = true;
                event.preventDefault();
                this.menu.select(event);
              }

              break;

            case keyCode.TAB:
              if (this.menu.active) {
                this.menu.select(event);
              }

              break;

            case keyCode.ESCAPE:
              if (this.menu.element.is(":visible")) {
                if (!this.isMultiLine) {
                  this._value(this.term);
                }

                this.close(event); // Different browsers have different default behavior for escape
                // Single press can mean undo or clear
                // Double press in IE means clear the whole form

                event.preventDefault();
              }

              break;

            default:
              suppressKeyPressRepeat = true; // search timeout should be triggered before the input value is changed

              this._searchTimeout(event);

              break;
          }
        },
        keypress: function keypress(event) {
          if (suppressKeyPress) {
            suppressKeyPress = false;

            if (!this.isMultiLine || this.menu.element.is(":visible")) {
              event.preventDefault();
            }

            return;
          }

          if (suppressKeyPressRepeat) {
            return;
          } // Replicate some key handlers to allow them to repeat in Firefox and Opera


          var keyCode = $.ui.keyCode;

          switch (event.keyCode) {
            case keyCode.PAGE_UP:
              this._move("previousPage", event);

              break;

            case keyCode.PAGE_DOWN:
              this._move("nextPage", event);

              break;

            case keyCode.UP:
              this._keyEvent("previous", event);

              break;

            case keyCode.DOWN:
              this._keyEvent("next", event);

              break;
          }
        },
        input: function input(event) {
          if (suppressInput) {
            suppressInput = false;
            event.preventDefault();
            return;
          }

          this._searchTimeout(event);
        },
        focus: function focus() {
          this.selectedItem = null;
          this.previous = this._value();
        },
        blur: function blur(event) {
          if (this.cancelBlur) {
            delete this.cancelBlur;
            return;
          }

          clearTimeout(this.searching);
          this.close(event);

          this._change(event);
        }
      });

      this._initSource();

      this.menu = $("<ul>").appendTo(this._appendTo()).menu({
        // disable ARIA support, the live region takes care of that
        role: null
      }).hide().menu("instance");

      this._addClass(this.menu.element, "ui-autocomplete", "ui-front");

      this._on(this.menu.element, {
        mousedown: function mousedown(event) {
          // prevent moving focus out of the text field
          event.preventDefault(); // IE doesn't prevent moving focus even with event.preventDefault()
          // so we set a flag to know when we should ignore the blur event

          this.cancelBlur = true;

          this._delay(function () {
            delete this.cancelBlur; // Support: IE 8 only
            // Right clicking a menu item or selecting text from the menu items will
            // result in focus moving out of the input. However, we've already received
            // and ignored the blur event because of the cancelBlur flag set above. So
            // we restore focus to ensure that the menu closes properly based on the user's
            // next actions.

            if (this.element[0] !== $.ui.safeActiveElement(this.document[0])) {
              this.element.trigger("focus");
            }
          });
        },
        menufocus: function menufocus(event, ui) {
          var label, item; // support: Firefox
          // Prevent accidental activation of menu items in Firefox (#7024 #9118)

          if (this.isNewMenu) {
            this.isNewMenu = false;

            if (event.originalEvent && /^mouse/.test(event.originalEvent.type)) {
              this.menu.blur();
              this.document.one("mousemove", function () {
                $(event.target).trigger(event.originalEvent);
              });
              return;
            }
          }

          item = ui.item.data("ui-autocomplete-item");

          if (false !== this._trigger("focus", event, {
            item: item
          })) {
            // use value to match what will end up in the input, if it was a key event
            if (event.originalEvent && /^key/.test(event.originalEvent.type)) {
              this._value(item.value);
            }
          } // Announce the value in the liveRegion


          label = ui.item.attr("aria-label") || item.value;

          if (label && $.trim(label).length) {
            this.liveRegion.children().hide();
            $("<div>").text(label).appendTo(this.liveRegion);
          }
        },
        menuselect: function menuselect(event, ui) {
          var item = ui.item.data("ui-autocomplete-item"),
              previous = this.previous; // Only trigger when focus was lost (click on menu)

          if (this.element[0] !== $.ui.safeActiveElement(this.document[0])) {
            this.element.trigger("focus");
            this.previous = previous; // #6109 - IE triggers two focus events and the second
            // is asynchronous, so we need to reset the previous
            // term synchronously and asynchronously :-(

            this._delay(function () {
              this.previous = previous;
              this.selectedItem = item;
            });
          }

          if (false !== this._trigger("select", event, {
            item: item
          })) {
            this._value(item.value);
          } // reset the term after the select event
          // this allows custom select handling to work properly


          this.term = this._value();
          this.close(event);
          this.selectedItem = item;
        }
      });

      this.liveRegion = $("<div>", {
        role: "status",
        "aria-live": "assertive",
        "aria-relevant": "additions"
      }).appendTo(this.document[0].body);

      this._addClass(this.liveRegion, null, "ui-helper-hidden-accessible"); // Turning off autocomplete prevents the browser from remembering the
      // value when navigating through history, so we re-enable autocomplete
      // if the page is unloaded before the widget is destroyed. #7790


      this._on(this.window, {
        beforeunload: function beforeunload() {
          this.element.removeAttr("autocomplete");
        }
      });
    },
    _destroy: function _destroy() {
      clearTimeout(this.searching);
      this.element.removeAttr("autocomplete");
      this.menu.element.remove();
      this.liveRegion.remove();
    },
    _setOption: function _setOption(key, value) {
      this._super(key, value);

      if (key === "source") {
        this._initSource();
      }

      if (key === "appendTo") {
        this.menu.element.appendTo(this._appendTo());
      }

      if (key === "disabled" && value && this.xhr) {
        this.xhr.abort();
      }
    },
    _isEventTargetInWidget: function _isEventTargetInWidget(event) {
      var menuElement = this.menu.element[0];
      return event.target === this.element[0] || event.target === menuElement || $.contains(menuElement, event.target);
    },
    _closeOnClickOutside: function _closeOnClickOutside(event) {
      if (!this._isEventTargetInWidget(event)) {
        this.close();
      }
    },
    _appendTo: function _appendTo() {
      var element = this.options.appendTo;

      if (element) {
        element = element.jquery || element.nodeType ? $(element) : this.document.find(element).eq(0);
      }

      if (!element || !element[0]) {
        element = this.element.closest(".ui-front, dialog");
      }

      if (!element.length) {
        element = this.document[0].body;
      }

      return element;
    },
    _initSource: function _initSource() {
      var array,
          url,
          that = this;

      if ($.isArray(this.options.source)) {
        array = this.options.source;

        this.source = function (request, response) {
          response($.ui.autocomplete.filter(array, request.term));
        };
      } else if (typeof this.options.source === "string") {
        url = this.options.source;

        this.source = function (request, response) {
          if (that.xhr) {
            that.xhr.abort();
          }

          that.xhr = $.ajax({
            url: url,
            data: request,
            dataType: "json",
            success: function success(data) {
              response(data);
            },
            error: function error() {
              response([]);
            }
          });
        };
      } else {
        this.source = this.options.source;
      }
    },
    _searchTimeout: function _searchTimeout(event) {
      clearTimeout(this.searching);
      this.searching = this._delay(function () {
        // Search if the value has changed, or if the user retypes the same value (see #7434)
        var equalValues = this.term === this._value(),
            menuVisible = this.menu.element.is(":visible"),
            modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

        if (!equalValues || equalValues && !menuVisible && !modifierKey) {
          this.selectedItem = null;
          this.search(null, event);
        }
      }, this.options.delay);
    },
    search: function search(value, event) {
      value = value != null ? value : this._value(); // Always save the actual value, not the one passed as an argument

      this.term = this._value();

      if (value.length < this.options.minLength) {
        return this.close(event);
      }

      if (this._trigger("search", event) === false) {
        return;
      }

      return this._search(value);
    },
    _search: function _search(value) {
      this.pending++;

      this._addClass("ui-autocomplete-loading");

      this.cancelSearch = false;
      this.source({
        term: value
      }, this._response());
    },
    _response: function _response() {
      var index = ++this.requestIndex;
      return $.proxy(function (content) {
        if (index === this.requestIndex) {
          this.__response(content);
        }

        this.pending--;

        if (!this.pending) {
          this._removeClass("ui-autocomplete-loading");
        }
      }, this);
    },
    __response: function __response(content) {
      if (content) {
        content = this._normalize(content);
      }

      this._trigger("response", null, {
        content: content
      });

      if (!this.options.disabled && content && content.length && !this.cancelSearch) {
        this._suggest(content);

        this._trigger("open");
      } else {
        // use ._close() instead of .close() so we don't cancel future searches
        this._close();
      }
    },
    close: function close(event) {
      this.cancelSearch = true;

      this._close(event);
    },
    _close: function _close(event) {
      // Remove the handler that closes the menu on outside clicks
      this._off(this.document, "mousedown");

      if (this.menu.element.is(":visible")) {
        this.menu.element.hide();
        this.menu.blur();
        this.isNewMenu = true;

        this._trigger("close", event);
      }
    },
    _change: function _change(event) {
      if (this.previous !== this._value()) {
        this._trigger("change", event, {
          item: this.selectedItem
        });
      }
    },
    _normalize: function _normalize(items) {
      // assume all items have the right format when the first item is complete
      if (items.length && items[0].label && items[0].value) {
        return items;
      }

      return $.map(items, function (item) {
        if (typeof item === "string") {
          return {
            label: item,
            value: item
          };
        }

        return $.extend({}, item, {
          label: item.label || item.value,
          value: item.value || item.label
        });
      });
    },
    _suggest: function _suggest(items) {
      var ul = this.menu.element.empty();

      this._renderMenu(ul, items);

      this.isNewMenu = true;
      this.menu.refresh(); // Size and position menu

      ul.show();

      this._resizeMenu();

      ul.position($.extend({
        of: this.element
      }, this.options.position));

      if (this.options.autoFocus) {
        this.menu.next();
      } // Listen for interactions outside of the widget (#6642)


      this._on(this.document, {
        mousedown: "_closeOnClickOutside"
      });
    },
    _resizeMenu: function _resizeMenu() {
      var ul = this.menu.element;
      ul.outerWidth(Math.max( // Firefox wraps long text (possibly a rounding bug)
      // so we add 1px to avoid the wrapping (#7513)
      ul.width("").outerWidth() + 1, this.element.outerWidth()));
    },
    _renderMenu: function _renderMenu(ul, items) {
      var that = this;
      $.each(items, function (index, item) {
        that._renderItemData(ul, item);
      });
    },
    _renderItemData: function _renderItemData(ul, item) {
      return this._renderItem(ul, item).data("ui-autocomplete-item", item);
    },
    _renderItem: function _renderItem(ul, item) {
      return $("<li>").append($("<div>").text(item.label)).appendTo(ul);
    },
    _move: function _move(direction, event) {
      if (!this.menu.element.is(":visible")) {
        this.search(null, event);
        return;
      }

      if (this.menu.isFirstItem() && /^previous/.test(direction) || this.menu.isLastItem() && /^next/.test(direction)) {
        if (!this.isMultiLine) {
          this._value(this.term);
        }

        this.menu.blur();
        return;
      }

      this.menu[direction](event);
    },
    widget: function widget() {
      return this.menu.element;
    },
    _value: function _value() {
      return this.valueMethod.apply(this.element, arguments);
    },
    _keyEvent: function _keyEvent(keyEvent, event) {
      if (!this.isMultiLine || this.menu.element.is(":visible")) {
        this._move(keyEvent, event); // Prevents moving cursor to beginning/end of the text field in some browsers


        event.preventDefault();
      }
    },
    // Support: Chrome <=50
    // We should be able to just use this.element.prop( "isContentEditable" )
    // but hidden elements always report false in Chrome.
    // https://code.google.com/p/chromium/issues/detail?id=313082
    _isContentEditable: function _isContentEditable(element) {
      if (!element.length) {
        return false;
      }

      var editable = element.prop("contentEditable");

      if (editable === "inherit") {
        return this._isContentEditable(element.parent());
      }

      return editable === "true";
    }
  });
  $.extend($.ui.autocomplete, {
    escapeRegex: function escapeRegex(value) {
      return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    },
    filter: function filter(array, term) {
      var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
      return $.grep(array, function (value) {
        return matcher.test(value.label || value.value || value);
      });
    }
  }); // Live region extension, adding a `messages` option
  // NOTE: This is an experimental API. We are still investigating
  // a full solution for string manipulation and internationalization.

  $.widget("ui.autocomplete", $.ui.autocomplete, {
    options: {
      messages: {
        noResults: "No search results.",
        results: function results(amount) {
          return amount + (amount > 1 ? " results are" : " result is") + " available, use up and down arrow keys to navigate.";
        }
      }
    },
    __response: function __response(content) {
      var message;

      this._superApply(arguments);

      if (this.options.disabled || this.cancelSearch) {
        return;
      }

      if (content && content.length) {
        message = this.options.messages.results(content.length);
      } else {
        message = this.options.messages.noResults;
      }

      this.liveRegion.children().hide();
      $("<div>").text(message).appendTo(this.liveRegion);
    }
  });
  var widgetsAutocomplete = $.ui.autocomplete;
});

function readCookie(name) {
  var regex = new RegExp("[; ]" + name + "=([^\\s;]*)");
  var match = (" " + document.cookie).match(regex);

  if (name && match) {
    return unescape(match[1]);
  } else {
    return "";
  }
}

function setCookie(name, value, days) {
  var expires = "";

  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }

  document.cookie = name + "=" + (value || "") + expires + "; path=/";
} // CG: Functionality for use with the cookie banner, March 2021 onwards


function getOptanonCategoryFromClass(string) {
  var re = /optanon-category-([cC]\d{4})/gm;
  var matches = re.exec(string);

  if (!matches) {
    return false;
  } else {
    return matches[1];
  }
}

function relevantCookiesAccepted(category) {
  // CG: Checks if the specific category (such as "C0002") is present in the Optanon "accepted" categories in the cookie
  var optanonCookieString = readCookie('OptanonConsent');

  if (optanonCookieString.indexOf(category + ":1") != -1) {
    return true;
  }

  return false;
}

function checkForInvalidFields() {
  // CG: Count the invalid fields, then enable / disable the "submit" button as appropriate
  var invalidFieldCount = 0;
  var radioButtonNames = [];
  $(".crm-form input:visible[data-required='true']:not([type='radio']), .crm-form select:visible[data-required='true'], .crm-form textarea:visible[data-required='true']").each(function () {
    if (!isValid($(this))) {
      invalidFieldCount++; //console.log($(this).attr("id") + " is invalid");
    }
  }); // CG: Check radio buttons separately:
  // CG: ================================

  $(".crm-form input[data-required='true'][type=radio]").each(function () {
    // CG: Get the names of all radio buttons that are required
    radioButtonNames.push($(this).attr("name"));
  }); // CG: Reduce to only the unique names

  radioButtonNames = radioButtonNames.filter(onlyUnique);

  for (var i = 0; i < radioButtonNames.length; i++) {
    // CG: Check that at least one radio button with that name has been selected 
    if (!$(".crm-form input[name='" + radioButtonNames[i] + "']:checked").val()) {
      invalidFieldCount++; //console.log("Missing radio button " + radioButtonNames[i]);
    }
  }

  console.log(invalidFieldCount + " fields are invalid");

  if (invalidFieldCount > 0) {
    $("#submit-btn").attr("disabled", "disabled");
  } else {
    $("#submit-btn").removeAttr("disabled");
  }
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function isValidEmailAddress(address) {
  var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(address);
}

function isValidPhoneNo(no) {
  // CG: Validates a UK telephone no.
  var regex = /^\s*(([+]\s?\d[-\s]?\d|0)?\s?\d([-\s]?\d){9}|[(]\s?\d([-\s]?\d)+\s*[)]([-\s]?\d)+)\s*$/;
  return regex.test(no);
}

function isValidPostcode(postcode) {
  var regex = /^[a-zA-Z]{1,2}\d[a-zA-Z\d]? ?\d[a-zA-Z]{2}$/;
  return regex.test(postcode);
} // CG: Validate a single field


function isValid($obj) {
  var valueToCheck = ""; // CG: Handle <select> elements differently

  if ($obj.prop("tagName") == "SELECT") {
    valueToCheck = $obj.find(":selected").val();
  } else {
    valueToCheck = $obj.val();
  } // CG: Specific check for email fields


  if ($obj.attr("type") == "email") {
    // CG: Apply regex for email address
    if (!isValidEmailAddress($obj.val())) {
      return false;
    }
  } // CG: Check all other types of fields


  if (valueToCheck == "") {
    //console.log($obj.prop("id") + " is invalid");
    return false;
  } else {
    return true;
  }
} // CG: Only allow the user to change "pages", or submit, if the required fields are completed


function requiredFieldsCompleted(fields) {
  var errorsFound = false;
  $(".crm-form__error-msg").remove();
  $.each(fields, function (i, field) {
    if (!fieldIsValid(field)) {
      errorsFound = true; // CG: Reveal the address fields if the postcode is missing, otherwise the user won't see what's causing the problem

      if (field.name == "ADD1") {
        $("#address-confirmation").slideDown();
      }
    }
  });

  if (errorsFound) {
    // CG: Scroll to the first invalid field
    $("html, body").animate({
      scrollTop: $(".form--invalid:first").offset().top - 30
    }, 500);
  }

  return !errorsFound;
}

function fieldIsValid(field) {
  // CG: Get the field DOM object based on the name
  var $field = $("[name='" + field.name + "']");
  var $label = $("label[for='" + field.id + "']");
  $field.removeClass("form--invalid");
  $label.removeClass("form--invalid"); // CG: Validate checkboxes / radio buttons
  // Get all the inputs with the same name, and check if at least one of them is checked

  if ($field.attr("type") == "checkbox" || $field.attr("type") == "radio") {
    var $fieldset = $field.closest("fieldset");

    if ($("[name='" + field.name + "']:checked").length == 0) {
      // CG: Add error message to the <fieldset>, if there isn't one already
      if ($fieldset.find(".crm-form__error-msg").length == 0) {
        $fieldset.append("<p class=crm-form__error-msg>Please select an option</p>");
      }

      console.log(field.name + " is invalid");
      return false;
    }
  } // CG: Validate email fields


  if ($field.attr("type") == "email") {
    // CG: Apply regex for email address
    var $container = $field.parent();

    if (!isValidEmailAddress($field.val())) {
      $field.addClass("form--invalid");
      $container.append("<p class=crm-form__error-msg>Please enter a valid email address</p>"); //$field.attr("placeholder","Please enter a valid email address");

      return false;
    } else {
      $container.remove(".crm-form__error-msg");
    }
  }

  if ($field.val() == "") {
    $field.addClass("form--invalid");

    if ($field.prop("tagName") != "SELECT") {
      // CG: Check for an existing placeholder, and use that if it's present
      var placeHolderText = $field.attr("data-invalid-message");

      if (placeHolderText != "") {
        $field.attr("placeholder", placeHolderText);
      } else {
        $field.attr("placeholder", "Please complete this field");
      }
    }

    return false;
  }

  return true;
}

var crmFormsInit = function crmFormsInit() {
  // CG: Validation: check each field in turn when the user clicks off it
  $(".crm-form input, .crm-form select, .crm-form textarea").on("blur change", function () {
    if ($(this).attr("data-required") == "true") {
      var fieldId = $(this).attr("id");
      var $label = $("label[for='" + fieldId + "']");

      if (!isValid($(this))) {
        $(this).addClass("form--invalid");

        if (fieldId == "ENQUIRY") {
          $(this).attr("placeholder", "Please enter your enquiry");
        } else {
          $(this).attr("placeholder", "Please complete this field");
        }
      } else {
        $(this).removeClass("form--invalid");
        $(this).removeAttr("placeholder");
      } // CG: Activate the "submit" button only if all required fields have been completed


      checkForInvalidFields();
    }
  }); // CG: Strip all non-numeric spaces from Phone no

  $('#MOBILENO').on("blur change", function () {
    $(this).val($(this).val().replace(/\D/g, ''));
  });
  $("#consent-to-all-btn").on("click", function (e) {
    e.preventDefault(); // CG: Set all buttons to "yes"

    $("#pref-sms-yes, #pref-email-yes, #pref-mail-yes, #pref-tel-yes").prop("checked", true);
  });
};

var leadGenInit = function leadGenInit() {
  var leadGenActive = readCookie("HideLeadGen") == "1" ? false : true; //var leadGenActive = $("#lead-gen").length > 0 ? true : false; // CG: Only if lead gen is present on the page. In the back end, it is not written to the page is the cookie "HideLeadGen" is present.

  if (leadGenActive && $("#hide-for-lead-gen").length > 0) {
    // CG: Hide the content we don't want the user to scroll past
    $("#hide-for-lead-gen, #accolade-slider, #footer-site").addClass("visually-hidden");
  } else {
    $("#lead-gen").remove();
  }

  $(document).on("scroll", function (e) {
    if (leadGenActive && $("#hide-for-lead-gen").length > 0) {
      // CG: Activate the lead gen banner when the user reaches the top of the "hidden" content
      var scrollBottom = $(window).scrollTop() + $(window).height();
      var targetDivPos = $("#hide-for-lead-gen").position().top - 100;

      if (scrollBottom >= targetDivPos && leadGenActive) {
        $("#lead-gen").slideDown("slow");
      } else {
        $("#lead-gen").slideUp("slow");
      }
    }
  });
  $("#lead-gen__submit-btn").on("click", function (e) {
    e.preventDefault();
    var fields = $("#lead-gen__form").find("input[data-required='true'], select[data-required='true']:visible, textarea[data-required='true']");

    if (requiredFieldsCompleted(fields)) {
      $("#loading-spinner--lead-gen").show();
      $.post("/api/CrmLeadGen/HandleProspectusRequest", {
        "ADD1": $("#address-1").val(),
        "ADD2": $("#address-2").val(),
        "CITYORTOWN": $("#city-or-town").val(),
        "COURSE_OF_SUBJECT": $("#COURSE_OF_SUBJECT").val(),
        "EMAIL": $("#email").val(),
        "FIRSTNAME": $("#firstname").val(),
        "LANDINGPAGE": $("#LANDINGPAGE").val(),
        "LASTNAME": $("#lastname").val(),
        "MARKETING_CAMPAIGN": $("#MARKETING_CAMPAIGN").val(),
        "MARKETING_MEDIUM": $("#MARKETING_MEDIUM").val(),
        "MARKETING_SOURCE": $("#MARKETING_SOURCE").val(),
        "MOBILENO": $("#mobileno").val(),
        "POSTCODE": $("#postcode").val(),
        "PREF_EMAIL": $("[name='PREF_EMAIL']:checked").val(),
        "PREF_MAIL": $("[name='PREF_MAIL']:checked").val(),
        "PREF_SMS": $("[name='PREF_SMS']:checked").val(),
        "PREF_TELEPHONE": $("[name='PREF_TELEPHONE']:checked").val(),
        "SUBJECT": $("#SUBJECT").val(),
        "YEAR_OF_ENTRY": $("[name='YEAR_OF_ENTRY']:checked").val()
      }).done(function (data) {
        $("#loading-spinner--lead-gen").hide(); // CG: Replace the form fields with the success message

        $("#lead-gen__form").html("<h2>Thank you!</h2><p class='font-3xl'>Your request has been sent.</p>");
        setCookie("HideLeadGen", 1, 30);
        setTimeout(function () {
          $("#lead-gen-modal .modal__close").trigger("click");
          $("#lead-gen__no-btn").trigger("click");
        }, 5000);
      }).fail(function () {
        $("#loading-spinner--lead-gen").hide();
        $("#lead-gen__form").html("<h2>An error occurred</h2><p class'font-3xl'>Sorry - there was a problem submitting your request. Please try again later.</p>");
      });
    } else {// CG: Invalid
    }
  });
  $("#lead-gen__no-btn").on("click", function (e) {
    e.preventDefault();
    $(".lead-gen").slideUp("slow");
    setCookie("HideLeadGen", 1, 30);
    leadGenActive = false;
    $("#hide-for-lead-gen, #accolade-slider, #footer-site").removeClass("visually-hidden");
    $('.slick-slider').slick('refresh');
  });
};

var defaultPageSize = 12;
var defaultPageIndex = 0;
var pageIndex = 0;
var month;
var year;
var category;
var searchText;
var timer;
var curEntryCount = 0;
var url;

function News(loadMore, redirectPage) {
  url = "/news/";
  var searchText = document.getElementById('news_search').value;
  category = document.getElementById('news_category') !== null ? document.getElementById('news_category').value : "";
  month = document.getElementById('news_month').value;
  year = document.getElementById('news_year').value;

  if (loadMore) {
    LoadMore('news', searchText, category, month, year, 'newsPage');
  } else if (!redirectPage) {
    window.location = UrlRedirect(url, year, month, category, searchText);
  } else {
    if (year > 0) {
      window.history.pushState("newsPageYear", "news", "/news/" + year);
    }

    if (year > 0 && month > 0) {
      window.history.pushState("newsPageYearMonth", "news", "/news/" + year + "/" + month);
    }

    Search('news', searchText, category, month, year, 'newsPage');
  }

  return false;
}

function Events(loadMore, redirectPage) {
  url = "/events/";
  searchText = document.getElementById('news_search').value;
  category = document.getElementById('news_category').value;
  month = document.getElementById('news_month').value;
  year = document.getElementById('news_year').value;

  if (loadMore) {
    LoadMore('events', searchText, category, month, year, 'eventsPage');
  } else if (!redirectPage) {
    window.location = UrlRedirect(url, year, month, category, searchText);
  } else {
    if (year > 0) {
      window.history.pushState("eventPageYear", "event", "/events/" + year);
    }

    if (year > 0 && month > 0) {
      window.history.pushState("eventPageYearMonth", "event", "/events/" + year + "/" + month);
    }

    Search('events', searchText, category, month, year, 'eventsPage');
  }

  return false;
}

function UrlRedirect(path, year, month, cat, text) {
  if (year > 0 && month == 0) {
    path = path + year;
  }

  if (year > 0 && month > 0) {
    path = path + year + "/" + month;
  }

  if (cat != "" && cat != "all" && text != "") {
    path = path + "?q=" + text + "&category=" + cat;
  } else if (cat == "" && text != "") {
    path = path + "?q=" + text;
  } else if (cat != "" && cat != "all" && text == "") {
    path = path + "?category=" + cat;
  }

  return path;
}

function Search(contentTypeId, searchText, category, month, year, elementId) {
  pageIndex = defaultPageIndex;
  curEntryCount = 0;
  var querystring = QueryString(contentTypeId, searchText, category, month, year, pageIndex, defaultPageSize);
  AjaxSearch(querystring, elementId, false);
}

function LoadMore(contentTypeId, searchText, category, month, year, elementId) {
  pageIndex++;
  var querystring = QueryString(contentTypeId, searchText, category, month, year, pageIndex, defaultPageSize);
  AjaxSearch(querystring, elementId, true);
}

function QueryString(contentTypeId, searchText, category, month, year, pageIndex, pageSize, level) {
  var querystring = '';

  if (level != "" || level != null) {
    level = "";
  }

  if (Array.isArray(contentTypeId)) {
    querystring = "/api/SU/Search" + "?contentTypeId=" + contentTypeId + "&searchText=" + searchText + "&category=" + category + "&month=" + month + "&year=" + year + "&pageIndex=" + pageIndex + "&pageSize=" + pageSize + "&level=" + level;
  } else {
    querystring = "/api/SU/Search/" + contentTypeId + "?searchText=" + searchText + "&category=" + category + "&month=" + month + "&year=" + year + "&pageIndex=" + pageIndex + "&pageSize=" + pageSize + "&level=" + level;
  }

  return querystring;
}

function AjaxSearch(querystring, elementId, doAppend) {
  var xhttp = new XMLHttpRequest();
  var div = document.getElementById(elementId);
  console.log("ElementId = " + elementId + "; div = " + div);

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      $("#loading").remove();

      if (doAppend) {
        var json = this.response;

        if (json.entries === undefined) {
          json = JSON.parse(json);
        }

        div.insertAdjacentHTML('beforeend', json.entries);
      } else {
        var json = this.response;

        if (json.entries === undefined) {
          json = JSON.parse(json);
        }

        div.innerHTML = json.entries;
      }

      if (json.entryCount == 0) {
        div.insertAdjacentHTML('beforeend', "<p class='msg msg--noresults large-12 column'>Sorry, no results found. </p>");
        $('.load-more').addClass('visually-hidden');
      }

      curEntryCount = json.entryCount + curEntryCount;

      if (curEntryCount >= json.totalCount) {
        $('.load-more').addClass('visually-hidden');
      } else {//$('.load-more').removeClass('visually-hidden');
      }
    }
  };

  $(div).append("<div id='loading' class='bg loading--bg'><svg id='loadingIcon' style='margin:10px 47%' width='80px' height='80px' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid' class='uil-default'><rect x='0' y='0' width='100%' height='120' fill='none' class='bk'></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(0 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(30 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.08333333333333333s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(60 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.16666666666666666s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(90 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.25s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(120 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.3333333333333333s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(150 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.4166666666666667s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(180 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.5s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(210 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.5833333333333334s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(240 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.6666666666666666s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(270 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.75s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(300 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.8333333333333334s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(330 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.9166666666666666s' repeatCount='indefinite'/></rect></svg></div>");
  xhttp.open("POST", querystring, true);
  xhttp.responseType = "json";
  xhttp.send();
}

var newsAndEventsSearchInit = function newsAndEventsSearchInit() {
  $('.js-load-more').on('click', function (e) {
    var $this = $(this);
    var url = $this.data('src');
    var target = $this.data('target');
    var btnHtml = $this.html();
    e.preventDefault(); // If the button is not disabled and it has a url

    if (!$this.attr('disabled') && url && target) {
      // Set the button to loading
      $this.attr('disabled', true).addClass('loading').text('Loading...');
      $.ajax({
        type: 'GET',
        url: url
      }).success(function (data) {
        var $target = $(target);
        var $lastItem = $target.children('div:last-child'); // Add the data to the target

        $target.append(data); // TODO: when in contensis check if this is the last page to load, if it is remove the button
        // $this.remove();
        // Set the load more button back to normal

        $this.attr('disabled', false).removeClass('loading').html(btnHtml); // Focus on the first new element

        $lastItem.next().find('a').focus();
      }).error(function () {
        $this.removeClass('loading').html('Sorry, no results found.');
      });
    }
  });
  $('#news_search').on('keydown', function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  });
}; // @TODO: at some point, it'd probably be nice if functions sat in
// 'eachIndividualComponentName.js' in each component folder and were imported
// rather than being here, like their Sass files


(function ($) {
  function megaNavMobile() {
    $('#megaNav li.has-children > a').each(function () {
      var link = $(this);
      var levelheader = $('+ .megaNav__level > .megaNav__levelHeader', this);
      var newlink = link.clone();
      newlink.insertAfter(levelheader).wrap('<h3 class="meganav-mobile-section-link"></h3>');
    });
  }

  var megaNavInit = function megaNavInit() {
    var megaNav = $('#megaNav');
    var megaNavToggle = $('#toggle-megaNav');
    var megaNavClose = $('#megaNav__close');
    var megaNavFullBreakpoint = window.matchMedia('(min-width: 70rem)');
    megaNavToggle.on('click', function () {
      var navIsOpen = megaNav.hasClass('is-open');

      if (navIsOpen) {
        $(this).removeClass('is-toggled');
        megaNav.removeClass('is-open');
        $('body').removeClass('has-expanded-smallscreen-nav');
      } else {
        $(this).addClass('is-toggled');
        megaNav.addClass('is-open');
        $('body').addClass('has-expanded-smallscreen-nav');
      }
    });
    megaNavClose.on('click', function () {
      megaNavToggle.removeClass('is-toggled');
      megaNav.removeClass('is-open');
      $('body').removeClass('has-expanded-smallscreen-nav');
    });
    var keyMap = {
      BACKSPACE: 8,
      COMMA: 188,
      DELETE: 46,
      DOWN: 40,
      END: 35,
      ENTER: 13,
      ESCAPE: 27,
      HOME: 36,
      LEFT: 37,
      PAGE_DOWN: 34,
      PAGE_UP: 33,
      PERIOD: 190,
      RIGHT: 39,
      SPACE: 32,
      TAB: 9,
      UP: 38
    };

    function updateMegaNavBreakpointClass() {
      if (megaNavFullBreakpoint.matches) {
        megaNav.addClass('is-largescreen');
        megaNav.removeClass('is-smallscreen');
        $('#megaNav.is-largescreen, .megaNav__topLevel-item.has-children, .megaNav__secondLevel-item.has-children, #megaNav.is-smallscreen .has-children > a').unbind();
        $('#megaNav.is-largescreen').hoverIntent({
          over: function over() {
            var item = $(this);
            expandChildren(item);
            var secondLevelItem = $('.megaNav__secondLevel-item.has-children', item).eq(0);
            expandChildren(secondLevelItem);
            var thirdLevelItem = $('.megaNav__thirdLevel-item.has-children', item).eq(0);
            expandChildren(thirdLevelItem);
          },
          out: function out() {
            $(this).closest('.is-expanded').removeClass('is-expanded');
          },
          selector: '.megaNav__topLevel-item.has-children',
          sensitivity: 25,
          timeout: 200
        });
        $('#megaNav.is-largescreen').hoverIntent({
          over: function over() {
            var item = $(this);
            expandChildren(item);
            var thirdLevelItem = $('.megaNav__thirdLevel-item.has-children', item).eq(0);
            expandChildren(thirdLevelItem);
          },
          out: function out() {// $(this).closest('.is-expanded').removeClass('is-expanded');
          },
          selector: '.megaNav__secondLevel-item.has-children',
          sensitivity: 75
        });
        $('#megaNav.is-largescreen').hoverIntent({
          over: function over() {
            var item = $(this);
            expandChildren(item);
            var thirdLevelItem = $('.megaNav__thirdLevel-item.has-children', item).eq(0);
            expandChildren(thirdLevelItem);
          },
          out: function out() {// $(this).closest('.is-expanded').removeClass('is-expanded');
          },
          selector: '.megaNav__thirdLevel-item.has-children',
          sensitivity: 75
        });
        $('#megaNav.is-largescreen').hoverIntent({
          over: function over() {
            $('body').addClass('has-expanded-nav');
          },
          out: function out() {
            $('.is-expanded', megaNav).removeClass('is-expanded');
            $('body').removeClass('has-expanded-nav');
          },
          timeout: 200
        });
        $('.has-expanded-nav').on('click', function () {
          $('.is-expanded', megaNav).removeClass('is-expanded');
          $('body').removeClass('has-expanded-nav');
        });
        $('.megaNav__topLevel-item > a').on('keydown', function (e) {
          var item = $(this).parent();

          switch (e.keyCode) {
            case keyMap.RIGHT:
              e.preventDefault();

              if (item.hasClass('is-expanded')) {
                collapseChildren(item);
              }

              focusNextSibling(item);
              break;

            case keyMap.LEFT:
              e.preventDefault();

              if (item.hasClass('is-expanded')) {
                collapseChildren(item);
              }

              focusPrevSibling(item);
              break;
          }
        });
        $('.megaNav__topLevel-item.has-children > a').on('keydown', function (e) {
          var item = $(this).parent();

          switch (e.keyCode) {
            case keyMap.SPACE:
              e.preventDefault();

              if (item.hasClass('is-expanded')) {
                collapseChildren(item);
              } else {
                expandChildren(item);
              }

              break;

            case keyMap.ENTER:
              if (!item.hasClass('is-expanded')) {
                e.preventDefault();
                expandChildren(item);
              }

              break;

            case keyMap.DOWN:
              e.preventDefault();

              if (item.hasClass('is-expanded')) {
                focusFirstChildItem(item);
              } else {
                expandChildren(item);
              }

              break;

            case keyMap.UP:
              e.preventDefault();
              collapseChildren(item);
              break;
          }
        });
        $('.megaNav__secondLevel-item > a').on('keydown', function (e) {
          var item = $(this).parent();

          switch (e.keyCode) {
            case keyMap.ESCAPE:
              focusParentItem(item);
              collapseParent(item);
              break;

            case keyMap.UP:
              e.preventDefault();

              if (item.hasClass('is-expanded')) {
                collapseChildren(item);
              }

              if ($(item).is(':first-child')) {
                focusParentItem(item);
                collapseParent(item);
              } else if ($(item).not(':last-child')) {
                focusPrevSibling(item);
              }

              break;

            case keyMap.DOWN:
              e.preventDefault();

              if ($(item).not(':first-child')) {
                focusNextSibling(item);
              }

              break;
          }
        });
        $('.megaNav__secondLevel-item.has-children > a').on('keydown', function (e) {
          var item = $(this).parent();

          switch (e.keyCode) {
            case keyMap.SPACE:
              e.preventDefault();

              if (item.hasClass('is-expanded')) {
                collapseChildren(item);
              } else {
                expandChildren(item);
              }

              break;

            case keyMap.ENTER:
              if (!item.hasClass('is-expanded')) {
                e.preventDefault();
                expandChildren(item);
              }

              break;

            case keyMap.RIGHT:
              e.preventDefault();

              if (item.hasClass('is-expanded')) {
                focusFirstChildItem(item);
              } else {
                expandChildren(item);
              }

              break;

            case keyMap.LEFT:
              e.preventDefault();
              collapseChildren(item);
              break;
          }
        });
        $('.megaNav__thirdLevel-item > a').on('keydown', function (e) {
          var item = $(this).parent();

          switch (e.keyCode) {
            case keyMap.ESCAPE:
            case keyMap.LEFT:
              e.stopPropagation();
              e.preventDefault();
              focusParentItem(item);
              collapseParent(item);
              break;

            case keyMap.UP:
              e.preventDefault();

              if (item.hasClass('is-expanded')) {
                collapseChildren(item);
              }

              if ($(item).is(':first-child')) {
                focusParentItem(item);
                collapseParent(item);
              } else if ($(item).not(':last-child')) {
                focusPrevSibling(item);
              }

              break;

            case keyMap.DOWN:
              e.preventDefault();

              if ($(item).not(':first-child')) {
                focusNextSibling(item);
              }

              break;
          }
        });
        $(document).on('keydown', function (e) {
          if (e.keyCode == keyMap.ESCAPE) {
            $('.is-expanded', megaNav).removeClass('is-expanded');
            $('body').removeClass('has-expanded-nav');
          }
        });
      } else {
        $('body, #megaNav.is-largescreen, .megaNav__topLevel-item.has-children, .megaNav__secondLevel-item.has-children, #megaNav.is-smallscreen .has-children > a').unbind();
        megaNav.removeClass('is-largescreen');
        megaNav.addClass('is-smallscreen');
        $(document).on('click', '#megaNav.is-smallscreen .has-children > a', function (e) {
          e.preventDefault();
          expandChildren($(this).parent());
        });
        $('.megaNav__closeLevel', megaNav).on('click', function (e) {
          e.preventDefault();
          $(this).closest('.is-expanded').removeClass('is-expanded');
          $('.megaNav__topLevel').scrollTop(0);
        });
        $(document).on("keyup", function (e) {
          if (e.keyCode == keyMap.ESCAPE) {
            $(megaNav).removeClass('is-open');
            $('body').removeClass('has-expanded-smallscreen-nav');
            $('#toggle-megaNav').removeClass('is-toggled');
          }
        });
      }
    }

    updateMegaNavBreakpointClass();
    $(window).smartResize(function () {
      megaNavFullBreakpoint = window.matchMedia('(min-width: 70rem)');
      updateMegaNavBreakpointClass();
    });

    function expandChildren(item) {
      var siblings = item.siblings();
      $('.is-expanded', siblings).removeClass('is-expanded');
      $(siblings).removeClass('is-expanded');
      $('.megaNav__topLevel').scrollTop(0);
      $(item).addClass('is-expanded');
    }

    function collapseChildren(item) {
      $('.megaNav__topLevel').scrollTop(0);
      $(item).removeClass('is-expanded');
    }

    function collapseParent(item) {
      var target = $(item).closest('.is-expanded');
      collapseChildren(target);
    }

    function focusFirstChildItem(item) {
      var target = $(item).find('> .megaNav__level .megaNav__levelList > li:first-child > a').eq(0);
      target.focus();
    }

    function focusNextSibling(item) {
      var target = $(item).next('li').children('a');
      target.focus();
    }

    function focusPrevSibling(item) {
      var target = $(item).prev('li').children('a');
      target.focus();
    }

    function focusParentItem(item) {
      var target = $(item).closest('.megaNav__level').siblings('a').eq(0);
      target.focus();
    }
  };

  var siteSearchInit = function siteSearchInit() {
    var megaNav = $('#megaNav');
    var searchField = $('#search-site');
    searchField.on('focus focusout', function (e) {
      var searchIsOpen = $('#site-search').hasClass('is-open');

      if (searchIsOpen) {
        $('#site-search').removeClass('is-open');
        setTimeout(function () {
          megaNav.fadeIn(500);
        }, 200);
      } else {
        megaNav.fadeOut(500, function () {
          $('#site-search').addClass('is-open');
        });
      }
    });
    $('#site-search__collection--courses', '#site-search__collection--main').on('click change', function () {
      searchField.focus().select();
      alert('Clicked!');
    });
    $(searchField).on('keyup', function (e) {
      var keycode = e.keyCode ? e.keyCode : e.which;

      if (keycode == '13') {
        $('#form1').on('submit', function (e) {
          e.preventDefault();
        });
        e.stopImmediatePropagation();
        var targetUrl = 'https://search.staffs.ac.uk/s/search.html?collection=staffordshire-main&query=' + searchField.val();

        if (window.location != window.parent.location) {
          window.parent.location = targetUrl;
        } else {
          window.location = targetUrl;
        }
      }

      e.preventDefault();
    });
  };

  var courseSearchInit = function courseSearchInit() {
    $('#course-search__submit--ug').on('click', function () {
      var targetUrl = 'https://search.staffs.ac.uk/s/search.html?collection=staffordshire-coursetitles&f.Level%7CV=undergraduate&query=' + $('#course-search__keywords').val();

      if (window.location != window.parent.location) {
        window.parent.location = targetUrl;
      } else {
        window.location = targetUrl;
      }
    });
    $('#course-search__submit--pg').on('click', function () {
      var targetUrl = 'https://search.staffs.ac.uk/s/search.html?collection=staffordshire-coursetitles&f.Level%7CV=postgraduate+%28research%29&f.Level%7CV=postgraduate+%28taught%29&query=' + $('#course-search__keywords').val();

      if (window.location != window.parent.location) {
        window.parent.location = targetUrl;
      } else {
        window.location = targetUrl;
      }
    });
  };

  var tabsInit = function tabsInit() {
    // @TODO: check accessibility - add AIRA/keyboard if needed
    // @TODO: consider using history.pushState?
    // @TODO: perhaps add something to handle switching to a tab when its ID is the URL hash?
    var tabCount = 1;
    $('.js-tabs').each(function () {
      var tabs = $(this);
      var tabId = 'tabs-' + tabCount;
      tabs.attr('id', tabId);
      tabCount++;
      var links = $('.tabs__link', tabs);
      var sections = $('.tabs__section', tabs);
      var defaultTab = $('.tabs__link.is-selected', tabs).attr('href');
      sections.hide();

      if (defaultTab) {
        $(defaultTab).show();
      } else {
        $(links[0]).addClass('is-selected');
        $(sections[0]).show().addClass('is-expanded');
      }

      links.on('click', function (e) {
        e.preventDefault();
        var targetHref = '#' + tabId + ' ' + $(this).attr('href');
        sections.hide().removeClass('is-expanded');
        $(targetHref).show().addClass('is-expanded');
        links.removeClass('is-selected');
        $(this).addClass('is-selected');
        $('.js-slider--variable').slick("setPosition", 0); // how did we end up
        // with tabs of
        // sliders?

        Waypoint.refreshAll(); // height is liable to change, so we need to refresh these

        var sliders = $(targetHref).find('.js-slider--generic');

        if (sliders && sliders.length != 0) {
          $(sliders).each(function () {
            var sliderElm = this;
            sliderReInit(sliderElm, $(targetHref).get(0));
          });
        }
      });
      Waypoint.refreshAll(); // tabs' content may change the height of the page, thus these need to be recalculated
      // CG: Check if we need to switch to a tab via a URL fragment

      if (anchorTarget == "#courses__postgraduate") {
        $('.tabs__link[href="#courses__postgraduate"]', tabs).trigger('click');
        window.scrollTo(0, 0);
      }
    });
  };

  var sliderInit = function sliderInit() {
    // CG: On tablet and larger, only show two slides if the page has side nav
    var noOfSlides = $(".page-body__side-nav")[0] ? 2.1 : 3.1;
    $('.js-slider--tiles').slick({
      slidesToShow: noOfSlides,
      slidesToScroll: 3,
      infinite: false,
      swipeToSlide: true,
      waitForAnimate: false,
      responsive: [{
        breakpoint: 1000,
        settings: {
          slidesToShow: 2.1,
          slidesToScroll: 2
        }
      }, {
        breakpoint: 700,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '0%'
        }
      }]
    });
    $('.js-slider--event-cards').slick({
      slidesToShow: 3.1,
      slidesToScroll: 3,
      infinite: false,
      responsive: [{
        breakpoint: 1000,
        settings: {
          slidesToShow: 2.5,
          slidesToScroll: 2
        }
      }, {
        breakpoint: 600,
        settings: {
          slidesToShow: 1.25,
          slidesToScroll: 1
        }
      }, {
        breakpoint: 360,
        settings: {
          slidesToShow: 1.1,
          slidesToScroll: 1
        }
      }]
    }); // CG: Calculate how many slides to show by default, so that they are always centred. Stop at 5

    var accoladeSlidesToShow = $(".js-slider--accolades > div").length;
    accoladeSlidesToShow = accoladeSlidesToShow > 5 ? 5 : accoladeSlidesToShow;
    $('.js-slider--accolades').slick({
      slidesToShow: accoladeSlidesToShow,
      slidesToScroll: accoladeSlidesToShow,
      infinite: false,
      responsive: [{
        breakpoint: 900,
        settings: {
          slidesToShow: 3.25,
          slidesToScroll: 3
        }
      }, {
        breakpoint: 500,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      }, {
        breakpoint: 360,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '5%'
        }
      }]
    });
    $('.js-slider--responsive').slick({
      infinite: false,
      responsive: [{
        breakpoint: 99999,
        settings: 'unslick'
      }, {
        breakpoint: 600,
        settings: {
          slidesToShow: 1.2,
          slidesToScroll: 1
        }
      }]
    });
    $('.js-slider--generic').slick({
      slidesToShow: 3.1,
      slidesToScroll: 3,
      infinite: false,
      responsive: [{
        breakpoint: 1000,
        settings: {
          slidesToShow: 2.5,
          slidesToScroll: 2
        }
      }, {
        breakpoint: 600,
        settings: {
          slidesToShow: 1.25,
          slidesToScroll: 1
        }
      }, {
        breakpoint: 360,
        settings: {
          slidesToShow: 1.1,
          slidesToScroll: 1
        }
      }]
    });
    $('.js-slider--variable').each(function () {
      $(this).slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        centerMode: true,
        centerPadding: '10%',
        adaptiveHeight: true,
        variableWidth: true,
        swipeToSlide: true,
        responsive: [{
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }]
      }).on('afterChange', function () {
        Waypoint.refreshAll(); // height is liable to change, so we need to refresh these
      });
    });
    $('.js-slider--gallery').each(function () {
      $(this).slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        adaptiveHeight: true,
        asNavFor: '.js-slider--gallery__nav',
        waitForAnimate: false
      }).on('afterChange', function () {
        Waypoint.refreshAll(); // height is liable to change, so we need to refresh these
      });
    });
    $('.js-slider--gallery__nav').each(function () {
      $(this).slick({
        slidesToShow: 6.5,
        infinite: false,
        asNavFor: '.js-slider--gallery',
        centerMode: false,
        varableWidth: true,
        focusOnSelect: true,
        waitForAnimate: false,
        swipeToSlide: true,
        arrows: false
      });
    });
    $('.js-slider--logos').slick({
      slidesToShow: 4,
      slidesToScroll: 4,
      infinite: false,
      responsive: [{
        breakpoint: 1000,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      }, {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }, {
        breakpoint: 360,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }]
    });
    Waypoint.refreshAll(); // sliders' content may change the height of the page, thus these need to be recalculated
  };

  var sliderReInit = function sliderReInit(sliderElm, elmWithRefreshId) {
    var isReset = false;
    var hasAttribute = false;

    if (!elmWithRefreshId.hasAttribute("data-slider-isrefreshed")) {
      isReset = true;
    } else {
      var isSliderRefreshed = parseInt(elmWithRefreshId.dataset.sliderIsrefreshed);
      isReset = isSliderRefreshed === 0;
      hasAttribute = true;
    }

    if (isReset) {
      var slider = $(sliderElm);

      if (slider) {
        slider.slick('reinit');

        if (hasAttribute) {
          elmWithRefreshId.setAttribute("data-slider-isrefreshed", 1);
        }
      }
    }
  };

  var waypointsInit = function waypointsInit() {
    // Potential Refactor: in an ideal world, using Intersection Observer might be better for this
    $('.js-waypoint').each(function () {
      var el = $(this);
      el.waypoint(function (direction) {
        if (direction === 'down') {
          el.addClass('is-waypoint-reached');
        } else {
          el.removeClass('is-waypoint-reached');
        }
      }, {
        offset: Waypoint.viewportHeight() - window.innerHeight / 50
      });
    });
  };

  var pageNavWaypointsInit = function pageNavWaypointsInit() {
    // Potential Refactor: in an ideal world, using Intersection Observer might be better for this
    function getRelatedNavigation(targetid) {
      return $('.js-page-nav .page-nav__link[href="#' + targetid + '"]');
    }

    function centerActiveItem(item) {
      var list = $('.page-nav__list')[0];

      function isOverflowing(element) {
        return element.scrollWidth > element.offsetWidth;
      }

      if (isOverflowing(list)) {
        var inner = $('.page-nav__inner')[0];
        var leftPos = item.position().left;
        var centeredPos = leftPos - $(inner).width() / 2 + $(item).width() / 2;
        $(inner).stop().animate({
          scrollLeft: centeredPos
        }, 250);
      }
    }

    $('.js-waypoint-page-section').each(function () {
      var el = $(this);
      el.waypoint(function (direction) {
        var activeItem = getRelatedNavigation(el.attr('id'));
        activeItem.toggleClass('is-active', direction === 'down');

        if (activeItem.hasClass('is-active')) {
          centerActiveItem(activeItem);
        }
      }, {
        offset: window.innerHeight / 5
      });
      el.waypoint(function (direction) {
        var activeItem = getRelatedNavigation(el.attr('id'));
        activeItem.toggleClass('is-active', direction === 'up');

        if (activeItem.hasClass('is-active')) {
          centerActiveItem(activeItem);
        }
      }, {
        offset: function offset() {
          return -$(el).height() + window.innerHeight / 5;
        }
      });
    });
    $('.page-nav__link').on('click', function () {
      var target = $($(this).attr('href'));
      $('html, body').stop().animate({
        scrollTop: target.offset().top - window.innerHeight / 10
      }, 250);
    });
    $('#apply-scroll-btn').on('click', function () {
      var target = $($(this).attr('href'));
      $('html, body').stop().animate({
        scrollTop: target.offset().top - window.innerHeight / 10
      }, 750);
    });
    $('#js-page-nav').each(function () {
      var el = $(this);
      el.waypoint(function (direction) {
        if (direction === 'down') {
          el.addClass('is-waypoint-reached');
        } else {
          el.removeClass('is-waypoint-reached');
        }
      }, {
        offset: 0
      });
    });
  };

  var autocompleteInit = function autocompleteInit() {
    $.widget("custom.courseautocomplete", $.ui.autocomplete, {
      _create: function _create() {
        this._super();

        this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
      },
      _renderMenu: function _renderMenu(ul, items) {
        var that = this,
            currentCategory = "";
        $.each(items, function (index, item) {
          var li;

          if (item.cat != currentCategory) {
            ul.append("<li class='course-search__category ui-autocomplete-category'>" + item.cat + "</li>");
            currentCategory = item.cat;
          }

          li = that._renderItemData(ul, item);

          if (item.cat) {
            li.attr("aria-label", item.cat + " : " + item.disp);
          }
        });
      },
      _renderItemData: function _renderItemData(ul, item) {
        var label = item.disp.replace(new RegExp('(' + $("#course-search__keywords").val() + ')', 'i'), '<strong>$1</strong>');
        ul.data('ui-autocomplete-item', item);
        return $("<li>").data('ui-autocomplete-item', item).append("<div>" + label + "</div>").addClass('ui-menu-item ui-menu-item__course').appendTo(ul);
      }
    });
    $("#course-search__keywords").courseautocomplete({
      source: function source(request, response) {
        $.ajax({
          url: "https://search.staffs.ac.uk/s/search.html",
          dataType: "json",
          data: {
            meta_t_trunc: request.term.toLowerCase(),
            // CG: Accounts for mobile devices using sentence caps when doing autocorrect
            collection: 'staffordshire-coursetitles',
            profile: 'auto-completion',
            form: 'qc',
            meta_V_and: $("#course-search__level").find(":selected").val() != null ? $("#course-search__level").find(":selected").val() : $("#course-search__level").val(),
            sort: 'dmetaV' // CG: Sorts by level of study, with UG first

          },
          success: function success(data) {
            response(data);
          }
        });
      },
      minLength: 3,
      delay: 300,
      select: function select(event, ui) {
        // CG: Redirect to the relevant course page
        window.location = ui.item.action;
        return false;
      }
    });
    $("#global-search__keywords--courses").courseautocomplete({
      source: function source(request, response) {
        $.ajax({
          url: "https://search.staffs.ac.uk/s/search.html",
          dataType: "json",
          data: {
            meta_t_trunc: request.term.toLowerCase(),
            // CG: Accounts for mobile devices using sentence caps when doing autocorrect
            collection: 'staffordshire-coursetitles',
            profile: 'auto-completion',
            form: 'qc',
            sort: 'dmetaV' // CG: Sorts by level of study, with UG first

          },
          success: function success(data) {
            response(data);
          }
        });
      },
      minLength: 3,
      delay: 300,
      select: function select(event, ui) {
        // CG: Redirect to the relevant course page
        window.location = ui.item.action;
        return false;
      }
    });
  };

  var playlistInit = function playlistInit() {
    $(".playlist__link").on("click", function (e) {
      e.preventDefault();
      $(".playlist__link").removeClass("selected");
      $(this).addClass("selected");
      $("#playlist__item").remove();
      $('<iframe id=playlist__item frameborder="0" allowfullscreen></iframe>').attr("src", $(this).attr("data-url")).appendTo("#playlist__item-container");
    });
  };

  var removeExistingSvgFills = function removeExistingSvgFills(parentClass) {
    var pathElms = document.querySelectorAll(parentClass + " svg path" + ", " + parentClass + " svg g");

    if (pathElms && pathElms !== undefined && pathElms.length !== 0) {
      for (var x = 0; x < pathElms.length; x++) {
        pathElms[x].style.removeProperty('fill');

        if (pathElms[x].getAttribute('fill') !== 'none') {
          pathElms[x].removeAttribute('fill');
        }
      }
    }
  };

  var modal = function modal() {
    var modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    var count = 1;
    modalTriggers.forEach(function (trigger) {
      var modalTrigger = trigger.dataset.modalTrigger;
      var modal = document.querySelector("[data-modal=\"".concat(modalTrigger, "\"]"));

      if (modal && modal != undefined) {
        if (trigger.hasAttribute("data-modal-trigger-isunique")) {
          var modalTriggerName = modalTrigger;
        } else {
          var modalTriggerName = modalTrigger + "-" + count;
          count++;
        }

        trigger.setAttribute('data-modal-trigger', modalTriggerName);
        modal.setAttribute('data-modal', modalTriggerName);
        trigger.addEventListener('click', function (event) {
          document.body.classList.add('modal__is-open');
          var modalTrigger = trigger.dataset.modalTrigger;
          var modal = document.querySelector("[data-modal=\"".concat(modalTrigger, "\"]"));
          modal.classList.add('is-open');
          var video = modal.querySelector("[data-video-src]");
          var hasVideo = video && video != undefined; // CG: Only display the video if the user has consented to the relevant cookies, e.g. the cookie string contains "C0003:1"

          if (hasVideo) {
            var videoCookieCategory = getOptanonCategoryFromClass(video.className);

            if (relevantCookiesAccepted(videoCookieCategory)) {
              video.setAttribute('src', video.dataset.videoSrc);
            } else {
              var newDiv = document.createElement("p");
              newDiv.style.color = '#FFF';
              newDiv.innerHTML = "Sorry, this video requires the use of functional cookies which you have not consented to use. <a style='color: #FFF; text-decoration: underline;' href='/legal/data-protection/cookie-policy'>Change your cookie settings</a> or <a style='color: #FFF; text-decoration: underline;' href='" + video.dataset.videoSrc + "'>watch the video on the provider's website</a>.";
              video.parentNode.replaceChild(newDiv, video);
            }
          }

          modal.querySelector('[data-modal-close]').addEventListener('click', function () {
            modal.classList.remove('is-open');
            document.body.classList.remove('modal__is-open');

            if (hasVideo) {
              video.removeAttribute('src');
            }
          });
          event.preventDefault();
          sliderReInit(document.querySelector("[data-modal=\"".concat(modalTrigger, "\"] .modal-slider")), modal);
        });
      }
    });
  };

  var toggleSlide = function toggleSlide(query, callback) {
    var courseModulesTriggers = document.querySelectorAll(query);
    courseModulesTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        var elmId = trigger.getAttribute('href').replace('#', '');

        if (elmId && elmId != undefined) {
          var targetElm = document.getElementById(elmId);

          if (targetElm && targetElm != undefined) {
            targetElm.classList.add('hidden');
            var hiddenElm = document.getElementById(trigger.dataset.courseModulesTrigger);

            if (hiddenElm && hiddenElm != undefined) {
              hiddenElm.classList.remove('hidden');
              callback(hiddenElm);
            }
          }
        }
      });
    });
  };

  var scrollToTop = function scrollToTop(elm) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
    $('html, body').animate({
      scrollTop: $(elm).offset().top - offset
    }, 200);
  };

  var stopFlag = false;

  function getURLParameter(name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  ;

  var toggleVariantFromUrl = function toggleVariantFromUrl() {
    // CG: Switch tabs on hash, but don't scroll to them
    if (window.location.hash) {
      $(".tab__item a[href='" + window.location.hash + "']").click();
    } // CG: Switch to variant via URL


    if (typeof mode == "undefined" && typeof award == "undefined") {
      var mode = "";
      var award = "";
    }

    mode = getURLParameter("m");
    award = getURLParameter("a");

    if (mode != "" && award != "") {
      //stopFlag = true;
      //console.log('award (via URL parameter) = ' + award);
      //console.log('mode (via URL parameter) = ' + mode);
      var matchingStudyOption = $('[data-award="' + award + '"] input[value=' + mode + ']'); // Do the switch over only if there's at lead one valid option

      if (matchingStudyOption.length > 0) {
        // If there are, do the switchover
        $('input[value=' + award + ']').trigger('change');
        matchingStudyOption.trigger('change');
      }
    }

    ;
  };

  var toggleVariantInit = function toggleVariantInit() {
    $("#study-option-selector").on("change", function () {
      if (stopFlag == false) {
        var activeOption = $(this).find(":selected").val();
        console.log("Mode of study = " + activeOption);
        var activeMode = $('*[data-mode="' + activeOption + '"]');
        $('*[data-mode]').not(activeMode.show()).hide(); // Refresh sliders         

        $(".slick-slider").each(function () {
          $(this).slick('reinit');
        }); // CG: Reset the assessment tabs

        $('a[href="#teachingOverview"]').trigger('click'); // CG: Alter the Clearing button link to reflect the chosen variant

        var regex = /course=.*?#/gm;
        var clearingButtonUrl = $('#offer-calculator-link').attr('href');

        if (clearingButtonUrl != null) {
          var result = clearingButtonUrl.replace(regex, 'course=' + $(this).attr('data-clearing-display-name') + '#');
          $('#offer-calculator-link').attr('href', result);
        }
      }

      stopFlag = false;
    });
    $('input[name=study-option]').on('change', function () {
      if (stopFlag == false) {
        var activeOption = $(this).val();
        console.log("Mode of study = " + activeOption);
        var activeMode = $('*[data-mode="' + activeOption + '"]');
        $('*[data-mode]').not(activeMode.show()).hide(); //Refresh sliders         

        $(".slick-slider").each(function () {
          $(this).slick('reinit');
        });
        $(this).prop('checked', true); // CG: Reset the  assessment tabs

        $('a[href="#teachingOverview"]').trigger('click');
      }

      stopFlag = false;
    });
  };

  var visualizerInit = function visualizerInit() {
    if (getURLParameter("visualizer") == "true") {
      $('[data-source]').each(function () {
        if (!$(this).hasClass('course-details_usp')) {
          $(this).css('position', 'relative');
        }

        $(this).prepend('<div class="source-label">' + $(this).data('source') + '</div>');
        $(this).addClass('element-outline');
      });
      $('[data-source]').hover(function () {
        $(this).addClass('source-outline');
        $('#source-indicator__source').text($(this).data('source'));
        $('#source-indicator__field').text($(this).data('field'));
        $('#source-indicator').show();
      }, function () {
        $(this).removeClass('source-outline');
        $('#source-indicator__source').text('');
        $('#source-indicator__field').text('');
        $('#source-indicator').hide();
      });
      $(document).mousemove(function (e) {
        var item = $('#source-indicator');
        item.css({
          left: e.pageX + 10,
          top: e.pageY + 10
        });
      });
    }
  };

  var countrySubmit = function countrySubmit() {
    $('#countrySubmit').on("click", function (e) {
      e.preventDefault();
      var countryPagePath = document.getElementById('countryPicker').value;

      if (countryPagePath == "") {
        return false;
      }

      $('#form1').on('submit', function (e) {
        e.preventDefault();
      });
      e.stopImmediatePropagation();

      if (countryPagePath != "") {
        if (window.location.hostname == "www.staffslondon.ac.uk") {
          // SM 21/05/21 If the country selector is used from the London site, direct to the main site pages
          window.location.href = window.location.protocol + "//www.staffs.ac.uk" + countryPagePath;
        } else {
          window.location.href = window.location.protocol + "//" + window.location.hostname + countryPagePath;
        }
      }
    });
  };

  $(document).ready(function () {
    megaNavMobile();
    megaNavInit();
    siteSearchInit();
    courseSearchInit();
    tabsInit();
    sliderInit();
    waypointsInit();
    pageNavWaypointsInit();
    autocompleteInit();
    modal();
    toggleVariantInit();
    visualizerInit();
    toggleSlide('[data-course-modules-trigger]', scrollToTop);
    playlistInit();
    countrySubmit();
    crmFormsInit();
    leadGenInit();
    newsAndEventsSearchInit();
  });
  $(window).on('DOMContentLoaded', function () {
    // event triggers once DOM is loaded but before stylesheets are applied
    toggleVariantFromUrl();
    removeExistingSvgFills('.card--ksp');
    removeExistingSvgFills('.iconBox__icon');
  });
  $(window).on('load', function () {
    // correct anything loaded on DOM load which might need adjusting (mostly once images have loaded)
    Waypoint.refreshAll();
  });
  $(window).smartResize(function () {
    // events that need to fire after a window resize (or device rotation)
    Waypoint.refreshAll();
  });
})(jQuery);
//# sourceMappingURL=app.js.map
