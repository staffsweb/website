// CG: Allow switching of PG course tab in subject pages, but don't scroll to the anchor
var anchorTarget = window.location.hash;

if(anchorTarget == "#courses__postgraduate")
{
  window.location.hash = "";
}

/* global Waypoint, console */

// @TODO: Learn to module bundle properly and manage dependencies with a proper
// package manager 🤦

// These are currently duplicated because we're using gulp-include as a
// replacement for CodeKit, it compiles with both as a fallback becuase it's
// @Sheerman's first time using Gulp.

//@codekit-prepend silent './vendor/jquery.hoverIntent';
//=include vendor/jquery.hoverIntent.js
//@codekit-prepend silent './vendor/smartResize';
//=include vendor/smartResize.js
//@codekit-prepend silent './vendor/slick-1.8.1/slick/slick';
//=include vendor/slick-1.8.1/slick/slick.js
//@codekit-prepend silent './vendor/waypoints/lib/jquery.waypoints.js';
//=include vendor/waypoints/lib/jquery.waypoints.js
//@codekit-prepend silent './vendor/jquery-ui.js';
//=include vendor/jquery-ui.js
//=include specific-functionality/cookie-read-and-write.js
//=include specific-functionality/optanon.js
//=include specific-functionality/crm-forms.js
//=include specific-functionality/lead-generation.js
//=include specific-functionality/news-and-events-search.js

// @TODO: at some point, it'd probably be nice if functions sat in
// 'eachIndividualComponentName.js' in each component folder and were imported
// rather than being here, like their Sass files

(function ($) {

  function megaNavMobile() {
    $('#megaNav li.has-children > a').each(function(){
      var link = $(this);
      var levelheader = $('+ .megaNav__level > .megaNav__levelHeader', this);
      var newlink = link.clone();
      newlink.insertAfter(levelheader).wrap('<h3 class="meganav-mobile-section-link"></h3>');
    });
  }




  let megaNavInit = function () {

    let megaNav = $('#megaNav');
    let megaNavToggle = $('#toggle-megaNav');
    let megaNavClose = $('#megaNav__close');
    let megaNavFullBreakpoint = window.matchMedia('(min-width: 70rem)');

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

    let keyMap = {
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
      UP: 38,
    };

    function updateMegaNavBreakpointClass() {
      if (megaNavFullBreakpoint.matches) {
        megaNav.addClass('is-largescreen');
        megaNav.removeClass('is-smallscreen');

        $('#megaNav.is-largescreen, .megaNav__topLevel-item.has-children, .megaNav__secondLevel-item.has-children, #megaNav.is-smallscreen .has-children > a').unbind();

        $('#megaNav.is-largescreen').hoverIntent({
          over: function () {
            let item = $(this);
            expandChildren(item);
            let secondLevelItem = $('.megaNav__secondLevel-item.has-children', item).eq(0);
            expandChildren(secondLevelItem);
            let thirdLevelItem = $('.megaNav__thirdLevel-item.has-children', item).eq(0);
            expandChildren(thirdLevelItem);
          },
          out: function () {
            $(this).closest('.is-expanded').removeClass('is-expanded');
          },
          selector: '.megaNav__topLevel-item.has-children',
          sensitivity: 25,
          timeout: 200
        });

        $('#megaNav.is-largescreen').hoverIntent({
          over: function () {
            let item = $(this);
            expandChildren(item);
            let thirdLevelItem = $('.megaNav__thirdLevel-item.has-children', item).eq(0);
            expandChildren(thirdLevelItem);
          },
          out: function () {
            // $(this).closest('.is-expanded').removeClass('is-expanded');
          },
          selector: '.megaNav__secondLevel-item.has-children',
          sensitivity: 75
        });

        $('#megaNav.is-largescreen').hoverIntent({
          over: function () {
            let item = $(this);
            expandChildren(item);
            let thirdLevelItem = $('.megaNav__thirdLevel-item.has-children', item).eq(0);
            expandChildren(thirdLevelItem);
          },
          out: function () {
            // $(this).closest('.is-expanded').removeClass('is-expanded');
          },
          selector: '.megaNav__thirdLevel-item.has-children',
          sensitivity: 75
        });

        $('#megaNav.is-largescreen').hoverIntent({
          over: function () {
            $('body').addClass('has-expanded-nav');
          },
          out: function () {
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
          let item = $(this).parent();

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
          let item = $(this).parent();

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
          let item = $(this).parent();

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
          let item = $(this).parent();

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
          let item = $(this).parent();

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
      let siblings = item.siblings();

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
      let target = $(item).closest('.is-expanded');
      collapseChildren(target);
    }

    function focusFirstChildItem(item) {
      let target = $(item).find('> .megaNav__level .megaNav__levelList > li:first-child > a').eq(0);
      target.focus();
    }

    function focusNextSibling(item) {
      let target = $(item).next('li').children('a');
      target.focus();
    }

    function focusPrevSibling(item) {
      let target = $(item).prev('li').children('a');
      target.focus();
    }

    function focusParentItem(item) {
      let target = $(item).closest('.megaNav__level').siblings('a').eq(0);
      target.focus();
    }

  };

  let siteSearchInit = function() {
    
    let megaNav = $('#megaNav');
    let searchField = $('#search-site');

    searchField.on('focus focusout', function () {
        var searchIsOpen = searchField.hasClass('is-open');

        if(searchIsOpen) {
          searchField.removeClass('is-open');
          setTimeout(function() {
            megaNav.fadeIn(500);
          }, 200);
        } else {
          megaNav.fadeOut(500, function() {
            searchField.addClass('is-open');
          });
        }
    })
  }

  let courseSearchInit = function() {
    $('#course-search__submit--ug').on('click', function() {
      var targetUrl = 'https://search.staffs.ac.uk/s/search.html?collection=staffordshire-coursetitles&f.Level%7CV=undergraduate&query=' + $('#course-search__keywords').val();
      if (window.location != window.parent.location) {
        window.parent.location = targetUrl;
      } else {
        window.location = targetUrl;
      }
    });

    $('#course-search__submit--pg').on('click', function() {
      var targetUrl = 'https://search.staffs.ac.uk/s/search.html?collection=staffordshire-coursetitles&f.Level%7CV=postgraduate+%28research%29&f.Level%7CV=postgraduate+%28taught%29&query=' + $('#course-search__keywords').val();
      if (window.location != window.parent.location) {
        window.parent.location = targetUrl;
      } else {
        window.location = targetUrl;
      }
    });
  }

  let tabsInit = function () {
    // @TODO: check accessibility - add AIRA/keyboard if needed
    // @TODO: consider using history.pushState?
    // @TODO: perhaps add something to handle switching to a tab when its ID is the URL hash?
    var tabCount = 1;

    $('.js-tabs').each(function () {
      let tabs = $(this);
      var tabId = 'tabs-' + tabCount;
      tabs.attr('id', tabId);
      tabCount++;
      let links = $('.tabs__link', tabs);
      let sections = $('.tabs__section', tabs);

      let defaultTab = $('.tabs__link.is-selected', tabs).attr('href');

      sections.hide();

      if (defaultTab) {
        $(defaultTab).show();
      }
      else {
        $(links[0]).addClass('is-selected');
        $(sections[0]).show().addClass('is-expanded');
      }

      links.on('click', function (e) {
        e.preventDefault();
        let targetHref = '#' + tabId + ' ' + $(this).attr('href');

        sections.hide().removeClass('is-expanded');
        $(targetHref).show().addClass('is-expanded');

        links.removeClass('is-selected');
        $(this).addClass('is-selected');

        $('.js-slider--variable').slick("setPosition", 0); // how did we end up
                                                           // with tabs of
                                                           // sliders?
        Waypoint.refreshAll(); // height is liable to change, so we need to refresh these

        var sliders = $(targetHref).find('.js-slider--generic');

        if(sliders && sliders.length != 0) {
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
        window.scrollTo(0,0);
      }
    });
  };

  let sliderInit = function () {
    // CG: On tablet and larger, only show two slides if the page has side nav
    var noOfSlides = $(".page-body__side-nav")[0] ? 2.1 : 3.1;
  
    $('.js-slider--tiles').slick({
      slidesToShow: noOfSlides,
      slidesToScroll: 3,
      infinite: false,
      swipeToSlide: true,
      waitForAnimate: false,
      responsive: [
        {
          breakpoint: 1000,
          settings: {
            slidesToShow: 2.1,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 700,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            centerPadding: '0%'
          }
        }
      ]
    });

    $('.js-slider--event-cards').slick({
      slidesToShow: 3.1,
      slidesToScroll: 3,
      infinite: false,
      responsive: [
        {
          breakpoint: 1000,
          settings: {
            slidesToShow: 2.5,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1.25,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 360,
          settings: {
            slidesToShow: 1.1,
            slidesToScroll: 1
          }
        }
      ]
    });

    // CG: Calculate how many slides to show by default, so that they are always centred. Stop at 5
    var accoladeSlidesToShow = $(".js-slider--accolades > div").length;
    accoladeSlidesToShow = accoladeSlidesToShow > 5 ? 5 : accoladeSlidesToShow;

    $('.js-slider--accolades').slick({
      slidesToShow: accoladeSlidesToShow,
      slidesToScroll: accoladeSlidesToShow,
      infinite: false,
      responsive: [
        {
          breakpoint: 900,
          settings: {
            slidesToShow: 3.25,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 500,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 360,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            centerPadding: '5%'
          }
        }
      ]
    });

    $('.js-slider--responsive').slick({
      infinite: false,
      responsive: [{
        breakpoint: 99999,
        settings: 'unslick'
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1.2,
            slidesToScroll: 1
          }
        }
      ]
    });

    $('.js-slider--generic').slick({
      slidesToShow: 3.1,
      slidesToScroll: 3,
      infinite: false,
      responsive: [
        {
          breakpoint: 1000,
          settings: {
            slidesToShow: 2.5,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1.25,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 360,
          settings: {
            slidesToShow: 1.1,
            slidesToScroll: 1
          }
        }
      ]
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
        responsive: [
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
        ]
      }).on('afterChange', function (){
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
      }).on('afterChange', function (){
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
      responsive: [
          {
          breakpoint: 1000,
          settings: {
              slidesToShow: 2,
              slidesToScroll: 2
          }
          },
          {
          breakpoint: 600,
          settings: {
              slidesToShow: 1,
              slidesToScroll: 1
          }
          },
          {
          breakpoint: 360,
          settings: {
              slidesToShow: 1,
              slidesToScroll: 1
          }
          }
      ]
  });

    Waypoint.refreshAll(); // sliders' content may change the height of the page, thus these need to be recalculated

  };

  let sliderReInit = function (sliderElm, elmWithRefreshId) {

    var isReset = false;
    var hasAttribute = false;

    if(!elmWithRefreshId.hasAttribute("data-slider-isrefreshed")) {
      isReset = true;
    }
    else {
      var isSliderRefreshed = parseInt(elmWithRefreshId.dataset.sliderIsrefreshed);
      isReset = isSliderRefreshed === 0;
      hasAttribute = true;
    }
    
    if(isReset) {
      var slider = $(sliderElm);
      if(slider) {
        slider.slick('reinit');
        if(hasAttribute) {
          elmWithRefreshId.setAttribute("data-slider-isrefreshed", 1);
        }
      }
    }
  }

  let waypointsInit = function () {
    // Potential Refactor: in an ideal world, using Intersection Observer might be better for this
    $('.js-waypoint').each(function () {
      let el = $(this);

      el.waypoint(function (direction) {
        if (direction === 'down') {
          el.addClass('is-waypoint-reached');
        }
        else {
          el.removeClass('is-waypoint-reached');
        }
      }, {
        offset: (Waypoint.viewportHeight() - (window.innerHeight / 50))
      });
    });
  };

  let pageNavWaypointsInit = function () {
    // Potential Refactor: in an ideal world, using Intersection Observer might be better for this

    function getRelatedNavigation(targetid) {
      return $('.js-page-nav .page-nav__link[href="#' + targetid + '"]');
    }

    function centerActiveItem(item) {
      let list = $('.page-nav__list')[0];

      function isOverflowing(element) {
        return (element.scrollWidth > element.offsetWidth);
      }

      if (isOverflowing(list)) {
        let inner = $('.page-nav__inner')[0];

        let leftPos = item.position().left;
        let centeredPos = leftPos - ($(inner).width() / 2) + ($(item).width() / 2);

        $(inner).stop().animate({scrollLeft: centeredPos}, 250);
      }
    }

    $('.js-waypoint-page-section').each(function () {
      let el = $(this);

      el.waypoint(function (direction) {
        let activeItem = getRelatedNavigation(el.attr('id'));
        activeItem.toggleClass('is-active', direction === 'down');

        if (activeItem.hasClass('is-active')) {
          centerActiveItem(activeItem);
        }
      }, {
        offset: (window.innerHeight / 5)
      });

      el.waypoint(function (direction) {
        let activeItem = getRelatedNavigation(el.attr('id'));
        activeItem.toggleClass('is-active', direction === 'up');

        if (activeItem.hasClass('is-active')) {
          centerActiveItem(activeItem);
        }
      }, {
        offset: function () {
          return -($(el).height()) + window.innerHeight / 5;
        }
      });
    });

    $('.page-nav__link').on('click', function () {
      let target = $($(this).attr('href'));

      $('html, body').stop().animate({
        scrollTop: (target.offset().top - window.innerHeight / 10)
      }, 250);
    });

    $('#apply-scroll-btn').on('click', function () {
      let target = $($(this).attr('href'));

      $('html, body').stop().animate({
        scrollTop: (target.offset().top - window.innerHeight / 10)
      }, 750);
    });

    $('#js-page-nav').each(function () {
      let el = $(this);

      el.waypoint(function (direction) {
        if (direction === 'down') {
          el.addClass('is-waypoint-reached');
        }
        else {
          el.removeClass('is-waypoint-reached');
        }
      }, {
        offset: 0
      });
    });
  };

  let autocompleteInit = function() {
    $.widget("custom.courseautocomplete", $.ui.autocomplete, {
      _create: function() {
        this._super();
        this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
      },
      _renderMenu: function( ul, items ) {
        var that = this,
          currentCategory = "";
        $.each( items, function( index, item ) {
          var li;
          if ( item.cat != currentCategory ) {
            ul.append( "<li class='course-search__category ui-autocomplete-category'>" + item.cat + "</li>" );
            currentCategory = item.cat;
          }
          li = that._renderItemData( ul, item );
          if ( item.cat ) {
            li.attr( "aria-label", item.cat + " : " + item.disp );
          }
        });
      },
      _renderItemData: function( ul, item) {
            var label = item.disp.replace(new RegExp('('+ $("#course-search__keywords").val() + ')', 'i'), '<strong>$1</strong>');
            ul.data('ui-autocomplete-item', item);
            return $("<li>")
              .data('ui-autocomplete-item', item )
              .append( "<div>" + label + "</div>" )
              .addClass('ui-menu-item ui-menu-item__course')
              .appendTo( ul );
        }
    });

    $("#course-search__keywords").courseautocomplete({
      source: function(request, response) {
        $.ajax({
            url: "https://search.staffs.ac.uk/s/search.html",
            dataType: "json",
            data: {
              meta_t_trunc : request.term.toLowerCase(), // CG: Accounts for mobile devices using sentence caps when doing autocorrect
              collection : 'staffordshire-coursetitles',
              profile : 'auto-completion',
              form : 'qc',
              meta_V_and: $("#course-search__level").find(":selected").val() != null ? $("#course-search__level").find(":selected").val() : $("#course-search__level").val(),
              sort : 'dmetaV' // CG: Sorts by level of study, with UG first
            },
            success: function(data) {
                response(data);
            }
        });
      },
      minLength: 3,
      delay: 300,
      select: function(event, ui) {
        // CG: Redirect to the relevant course page
        window.location = ui.item.action;
        return false;
      }
    });

    $("#global-search__keywords--courses").courseautocomplete({
      source: function(request, response) {
        $.ajax({
            url: "https://search.staffs.ac.uk/s/search.html",
            dataType: "json",
            data: {
              meta_t_trunc : request.term.toLowerCase(), // CG: Accounts for mobile devices using sentence caps when doing autocorrect
              collection : 'staffordshire-coursetitles',
              profile : 'auto-completion',
              form : 'qc',
              sort : 'dmetaV' // CG: Sorts by level of study, with UG first
            },
            success: function(data) {
                response(data);
            }
        });
      },
      minLength: 3,
      delay: 300,
      select: function(event, ui) {
        // CG: Redirect to the relevant course page
        window.location = ui.item.action;
        return false;
      }
    });
  };

  let playlistInit = function() {
    $(".playlist__link").on("click", function(e) {
      e.preventDefault();
      $(".playlist__link").removeClass("selected");
      $(this).addClass("selected");
      $("#playlist__item").remove();
      $('<iframe id=playlist__item frameborder="0" allowfullscreen></iframe>').attr("src", $(this).attr("data-url")).appendTo("#playlist__item-container");
    });
  };

  let removeExistingSvgFills = function(parentClass) {
    var pathElms = document.querySelectorAll(parentClass + " svg path" + ", " + parentClass + " svg g");

    if (pathElms && pathElms !== undefined && pathElms.length !== 0) {
        for (var x = 0; x < pathElms.length; x++) {
            pathElms[x].style.removeProperty('fill');
            if(pathElms[x].getAttribute('fill') !== 'none') {
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
      
      if(modal && modal != undefined){

        if(trigger.hasAttribute("data-modal-trigger-isunique")) {
          var modalTriggerName = modalTrigger;
        }
        else{
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

          if (hasVideo)
          {
            var videoCookieCategory = getOptanonCategoryFromClass(video.className);

            if(relevantCookiesAccepted(videoCookieCategory)) {
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
            
            if(hasVideo) {
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
        if(elmId && elmId != undefined) {

          var targetElm = document.getElementById(elmId);
          if(targetElm && targetElm != undefined) {
            targetElm.classList.add('hidden');
            var hiddenElm = document.getElementById(trigger.dataset.courseModulesTrigger);
            if(hiddenElm && hiddenElm != undefined){
              hiddenElm.classList.remove('hidden');
              callback(hiddenElm)
            }
          }
        }
      });
    });
  };

  let scrollToTop = function(elm, offset = 100) {
    $('html, body').animate({
      scrollTop: $(elm).offset().top - offset
  }, 200);
  }

  var stopFlag = false;

  function getURLParameter(name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };

  var toggleVariantFromUrl = function toggleVariantFromUrl() {
    // CG: Switch tabs on hash, but don't scroll to them
    if(window.location.hash) {
        $(".tab__item a[href='" + window.location.hash +"']").click();        
    }

    // CG: Switch to variant via URL
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

        var matchingStudyOption = $('[data-award="' + award + '"] input[value=' + mode + ']');

        // Do the switch over only if there's at lead one valid option
        if(matchingStudyOption.length > 0) {    
            // If there are, do the switchover
            $('input[value=' + award + ']').trigger('change');
            matchingStudyOption.trigger('change');
        }
    };
  };

  var toggleVariantInit = function toggleVariantInit() {
    $("#study-option-selector").on("change", function() {

      if (stopFlag == false) {        
          var activeOption = $(this).find(":selected").val();
          console.log("Mode of study = " + activeOption);
          var activeMode = $('*[data-mode="' + activeOption + '"]');
          $('*[data-mode]').not(activeMode.show()).hide();
          // Refresh sliders         
          $(".slick-slider").each(function() {
              $(this).slick('reinit');          
          });
  
          // CG: Reset the assessment tabs
          $('a[href="#teachingOverview"]').trigger('click');
  
          // CG: Alter the Clearing button link to reflect the chosen variant
          const regex = /course=.*?#/gm;
          var clearingButtonUrl = $('#offer-calculator-link').attr('href');
          if(clearingButtonUrl != null)
          {
            const result = clearingButtonUrl.replace(regex, 'course=' + $(this).attr('data-clearing-display-name') + '#');
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
          $('*[data-mode]').not(activeMode.show()).hide();
         //Refresh sliders         
          $(".slick-slider").each(function() {
              $(this).slick('reinit');          
          });

          $(this).prop('checked', true);

          // CG: Reset the  assessment tabs
          $('a[href="#teachingOverview"]').trigger('click');
      }
      stopFlag = false;
  });
  };

  var visualizerInit = function visualizerInit() {
    if(getURLParameter("visualizer") == "true") {	

      $('[data-source]').each(function() {
              if(!$(this).hasClass('course-details_usp')) {
                  $(this).css('position','relative');
              }
        $(this).prepend('<div class="source-label">' + $(this).data('source') + '</div>');
        $(this).addClass('element-outline');
      });        
  
      $('[data-source]').hover(function() {
        $(this).addClass('source-outline');
        $('#source-indicator__source').text($(this).data('source'));
        $('#source-indicator__field').text($(this).data('field'));
        $('#source-indicator').show();
      }, function() {
        $(this).removeClass('source-outline');
        $('#source-indicator__source').text('');
        $('#source-indicator__field').text('');
        $('#source-indicator').hide();
      });	
  
      $(document).mousemove(function(e) {
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
          if (window.location.hostname == "www.staffslondon.ac.uk") { // SM 21/05/21 If the country selector is used from the London site, direct to the main site pages
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
