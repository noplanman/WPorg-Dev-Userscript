// ==UserScript==
// @name        WPorg-Dev
// @namespace   wordpress
// @description A userscript to help developers access certain pages a lot easier.
// @include     https://wordpress.org/plugins/*
// @include     https://wordpress.org/support/plugin/*
// @include     https://wordpress.org/support/view/plugin-reviews/*
// @version     1.0
// @copyright   2015 Armando Lüscher
// @author      Armando Lüscher
// @oujs:author noplanman
// @grant       GM_addStyle
// @require     https://code.jquery.com/jquery-1.11.3.min.js
// @homepageURL https://github.com/noplanman/WPorg-Dev-Userscript
// @supportURL  https://github.com/noplanman/WPorg-Dev-Userscript/issues
// @updateURL   https://github.com/noplanman/WPorg-Dev-Userscript/raw/master/WPorg-Dev.user.js
// ==/UserScript==

// The base URL of the WordPress plugins pages.
var pluginsBaseURL = 'https://wordpress.org/plugins/';

var wodu = {};

/**
 * Extract the plugin slug from a URL.
 * @param {string} url URL to extract the plugin slug from.
 * @return {string} The extracted plugin slug.
 */
wodu.getSlug = function(url) {
  var p = url.indexOf('wordpress.org/plugins/');
  if (p >= 0) {
    return url.substring(p + 'wordpress.org/plugins/'.length).split('/')[0];
  }
  p = url.indexOf('wordpress.org/support');
  if (p >= 0) {
    url = url.replace(/\/+$/, '').split('/');
    return url[url.length-1];
  }
  return '';
};

/**
 * Generate the failed message and the retry button.
 *
 * @param {jQuery}   $el The error message panel gets appended to this jQuery object.
 * @param {Function} cb  Callback function when clicking the "Retry" button.
 * @return {jQuery} The jQuery object containing the message and button.
 */
wodu.getFailedRetryButton = function($el, cb) {
  $el.removeClass('wodu-loaded');
  return $('<div class="wodu-failed error">Failed.</div>')
    .append($('<div class="alignright button button-primary button-small">Retry</div>').click(cb))
    .appendTo($el);
};

/**
 * Generate a dropdown menu with all the downloadable versions.
 *
 * The dropdown also has the functionality, that when the selected value changes, the download of it begins.
 *
 * @param {jQuery} $devPage The page containing the links.
 * @return {jQuery} Dropdown menu with all the links.
 */
wodu.getDLLinkDropdown = function($devPage) {
  var $select = $('<select/>')
    .append('<option value="">Direct Download</option>')
    .click(function() { this.value = ''; })
    .change(function() { if (this.value) location.href = this.value; });

  $('.unmarked-list a[itemprop="downloadUrl"]', $devPage).each(function() {
    $select.append('<option value="' + $(this).attr('href') + '">' + $(this).text() + '</option>');
  });

  return $select;
};

/**
 * Get the repository (and admin) links from the developers page.
 *
 * @param {string} slug     Plugin slug.
 * @param {jQuery} $devPage The page containing the links.
 * @return {array} An array of the 3 developer links.
 */
wodu.getDevLinks = function(slug, $devPage) {
  var devLinks = [
    '<a href="http://plugins.trac.wordpress.org/browser/' + slug + '">Browse in Trac</a>',
    '<a href="http://plugins.svn.wordpress.org/'          + slug + '">Subversion Repo</a>',
    '<a href="http://plugins.trac.wordpress.org/log/'     + slug + '">Development Log</a>'
  ];
  if ($('a[href*="' + slug + '/admin"]', $devPage).length) {
    devLinks.push('<a class="wodu-dev-admin" href="' + pluginsBaseURL + slug + '/admin">Admin</a>');
  }
  return devLinks;
};

/**
 * Load the contents of the dev submenu.
 *
 * @param {jQuery} $devMenu    The developer menu item.
 * @param {jQuery} $devSubmenu The developer wodu submenu item.
 */
wodu.loadDevSubmenu = function($devMenu, $devSubmenu) {
  if ($devSubmenu.hasClass('wodu-loaded')) {
    return;
  }

  var slug = wodu.getSlug(location.href);

  var $spinner = $('<div class="wodu-spinner"/>');

  $devSubmenu.empty()
    .addClass('wodu-loaded')
    .append($spinner);

  if ($devMenu.hasClass('current')) {
    var $devPage = $('#pagebody');
    $devSubmenu.append(wodu.getDevLinks(slug, $devPage));
    $devSubmenu.append(wodu.getDLLinkDropdown($devPage));
    $spinner.hide();
  } else {
    $.get(pluginsBaseURL + slug + '/developers', function(response) {
      // Get rid of all images first, no need to load those.
      var $devPage = $(response.replace(/<img[^>]*>/g, ''));
      $devSubmenu.append(wodu.getDevLinks(slug, $devPage));
      $devSubmenu.append(wodu.getDLLinkDropdown($devPage));
    })
    .always(function() {
      $spinner.hide();
    })
    .fail(function() {
      wodu.getFailedRetryButton($devSubmenu, function() {
        wodu.loadDevSubmenu($devMenu, $devSubmenu);
      });
    });
  }
};

/**
 * Set up the submenu for the Developer menuitem on a plugin page.
 *
 * @param {jQuery} $devMenu The Developer menuitem.
 */
wodu.setupDevSubmenu = function($devMenu) {
  // Add the CSS.
  GM_addStyle(
    '.wodu-spinner { width: 100%; }' +
    '.wodu-dev-submenu { display:none; position: absolute; background: white; border: 1px solid #d7d7d7; padding: 6px; }' +
    '.wodu-dev-submenu > * { display: block; font-size: 1.2em; }' +
    '.wodu-dev-submenu > select { margin-top: 6px; }' +
    '.wodu-dev-submenu > a { display: block; padding: 0 6px; }' +
    '.wodu-dev-submenu > a:hover { background: rgba(0,0,0,.05); }'
  );

  var onSubmenu = false;

  var menuShowHide = function() {
    if (onSubmenu) {
      $devSubmenu.show();
    } else {
      $devSubmenu.hide();
    }
  };

  var onSubmenuHover = function() {
    onSubmenu = true;
    $devSubmenu.show();
  };
  var onSubmenuBlur = function() {
    onSubmenu = false;
    setTimeout(function() { menuShowHide(); }, 100);
  };

  var p = $devMenu.position();
  var h = $devMenu.outerHeight();
  var w = $devMenu.outerWidth();
  $devMenu.hover(onSubmenuHover, onSubmenuBlur);
  var $devSubmenu = $('<div/>', {
    class: 'wodu-dev-submenu',
    style: 'top: ' + (p.top + h) + 'px; left: ' + p.left + 'px; min-width: ' + w + 'px'
  })
    .hover(onSubmenuHover, onSubmenuBlur)
    .appendTo($('body'));

  wodu.loadDevSubmenu($devMenu, $devSubmenu);
};

/**
 * Load the extra plugin infos for a certain plugin.
 *
 * @param {jQuery} $card The plugin cart to load the infos for.
 */
wodu.loadPluginCardExtra = function($card) {
  if ($card.hasClass('wodu-loaded')) {
    return;
  }
  $card.addClass('wodu-loaded');

  // Get rid of any error message that may be there.

  var slug = wodu.getSlug($('.name a', $card).attr('href'));

  var $panelInfo = $('.wodu-panel-info', $card).empty();

  var $spinner = $('.wodu-spinner', $card).show();

  $.get(pluginsBaseURL + slug + '/developers', function(response) {
    // Get rid of all images first, no need to load those.
    var $devPage = $(response.replace(/<img[^>]*>/g, ''));

    $panelInfo.append($('meta[itemprop="dateModified"]', $devPage).parent());

    var devLinks = '';
    var adminLink = '';
    $.each(wodu.getDevLinks(slug, $devPage), function(index, link) {
      var $link = $(link);
      if ($link.hasClass('wodu-dev-admin')) {
        adminLink += link;
      } else {
        devLinks += link + '<br/>';
      }
    });

    var $panelDev = $('.wodu-panel-dev', $card)
      .append('<div class="wodu-subtitle"><a href="' + this.url + '">Developer</a>' + adminLink + '</dev>')
      .append(devLinks)
      .append(wodu.getDLLinkDropdown($devPage));
  })
  .always(function() {
    $spinner.hide();
  })
  .fail(function(e) {
    wodu.getFailedRetryButton($panelInfo, function() {
      wodu.loadPluginCardExtra($card);
    });
  });
};

/**
 * Add extra plugin information to plugin cards.
 *
 * @param {jQuery} $pluginCards All the plugin cards displayed on the current page.
 */
wodu.setupPluginCardExtras = function($pluginCards) {
  // Add the CSS.
  GM_addStyle(
    '.wodu-extras-button { position: absolute; top: 4px; right: 4px; height: 16px; width: 16px; cursor: pointer; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAjElEQVQ4jdWSUQ2AMAxEn4RKQMIkIAEJSEHCHIAEnIATcAA/HYGyhoUvuL8l17vXdPAXdUD1drgBNkCejEGbrAZgNDTBmgRYnIAVaE/vqN6DSIBJm6w8/FFnJCHOGVMO/1w6A30yHWkP+FnqS1oBflrhQi3aFgvwo3pvwfaMHn4kc0ar4s/jqXbaP6gdQPwjtYbeRCAAAAAASUVORK5CYII=); }' +
    '.wodu-spinner { position: absolute; left: 50%; top: 50%; }' +
    '.wodu-close { position: absolute; top: 4px; right: 4px; }' +
    '.wodu-plugin-card { position: relative; }' +
    '.wodu-plugin-card:before { content: ""; position: absolute; top: 0px; right: 0px; border-width: 36px 0 0 36px; border-style: solid; border-color: #ddd transparent; }' +
    '.wodu-plugin-card-extras { box-sizing: border-box; overflow: auto; display: none; position: absolute; width: 100%; height: 100%; margin: -20px -20px -10px; padding: 4px 10px; background-color: rgba(255, 255, 255, 0.9); z-index: 1; }' +
    '.wodu-title { padding: 4px 10px; font-size: 1.5em; font-weight: bold; }' +
    '.wodu-subtitle { font-size: 1.2em; font-weight: bold; }' +
    '.wodu-subtitle .wodu-dev-admin { font-size: .8em; margin-left: 5px; }'
  );

  $pluginCards.each(function() {
    var $card = $(this).addClass('wodu-plugin-card');
    var $cardTop = $('.plugin-card-top', $card);

    var $extrasButton = $('<div class="wodu-extras-button"/>')
      .click(function() {
        $extrasButton.hide();
        $extras.show();
        wodu.loadPluginCardExtra($card);
      })
      .prependTo($cardTop);

    // Prepare the extras.
    var $close = $('<div class="wodu-close"/>')
      .click(function() {
        $extras.hide();
        $extrasButton.show();
      });
    var extrasLoading = false;
    var $extras = $('<div/>', { class: 'wodu-plugin-card-extras' })
      .append($close)
      .append('<div class="wodu-spinner"/>')
      .append('<div class="wodu-title">' + $('.name a', $card).parent().html() +'</div>')
      .append('<div class="wodu-col-6 wodu-panel-info"/>')
      .append('<div class="wodu-col-6 wodu-panel-dev"/>')
      .prependTo($cardTop);
  });
};

/**
 * Start the party.
 */
wodu.init = function() {
  // Add the global CSS rules.
  GM_addStyle(
    '.wodu-spinner { height: 16px; width: 16px; background: no-repeat center center url(data:image/gif;base64,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) }' +
    '.wodu-close { height: 16px; width: 16px; cursor: pointer; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAhklEQVQ4jaWT0Q2AIAwFbyQ2kw3sCG6IG8AG+kFNSAUEIWnSlLyDPgrkdQABuAYjADuFeFRoQwDSAiCwIH7iVUiANzer1ZoAr944FSTN0b1PQCwEzuRxBGAhPXETkCqA1mt1xbaFaROjaWfYxM30XKt1PZgapJVRPiF/iL8AUW8Qpc2cLAA3TsPXvWkb2AIAAAAASUVORK5CYII=) }' +
    '.wodu-col-6 { width: 50%; float: left; padding: 4px 10px; box-sizing: border-box; }' +
    '.wodu-failed { margin: 0; }' +
    '.wodu-dev-admin { background: #439E47; color: #fff !important; padding: 0 6px; border-radius: 4px; }' +
    '.wodu-dev-admin:hover { background: #218834 !important; }'
  );

  var $devMenu = $('#sections .section-developers');
  if ($devMenu.length) {
    wodu.setupDevSubmenu($devMenu);
  }

  var $pluginCards = $('.plugins-directory .plugin-card');
  if ($pluginCards.length) {
    wodu.setupPluginCardExtras($pluginCards);
  }
};

// source: https://muffinresearch.co.uk/does-settimeout-solve-the-domcontentloaded-problem/
if (/(?!.*?compatible|.*?webkit)^mozilla|opera/i.test(navigator.userAgent)) { // Feeling dirty yet?
  document.addEventListener('DOMContentLoaded', wodu.init, false);
} else {
  window.setTimeout(wodu.init, 0);
}
