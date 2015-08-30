// ==UserScript==
// @name        WPorg-Dev
// @namespace   wordpress
// @description A userscript to help developers access certain pages a lot easier.
// @include     *wordpress.org/plugins/*
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

// Make sure we have jQuery loaded.
//if ( ! ( 'jQuery' in window ) ) { return false; }

/**
 * Add the required CSS rules.
 */
GM_addStyle(
  '.wodu-spinner { background: no-repeat center center url(data:image/gif;base64,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) }' +
  '.wodu-dev-menu { display:none; position: absolute; background: white; border: 1px solid #d7d7d7; }' +
  '.wodu-dev-menu > * { display: block; font-size: 1.2em; }' +
  '.wodu-dev-menu > a { display: block; padding: 0 6px; }'
);

var wodu = {};
wodu.slug = location.pathname.slice('/plugins/'.length, -1);
wodu.tracLog  = 'http://plugins.trac.wordpress.org/log/' + wodu.slug;
wodu.svnRepo  = 'http://plugins.svn.wordpress.org/' + wodu.slug;
wodu.tracRepo = 'http://plugins.trac.wordpress.org/browser/' + wodu.slug;

wodu.setupDevSubmenu = function($devMenu) {
  var onSubmenu = false;

  var addDLLinkDropdown = function($page) {
    var $select = $('<select/>')
    .append('<option value="">Direct Download</option>')
    .click(function() { this.value = ''; })
    .change(function() { if (this.value) location.href = this.value; });

    $('.unmarked-list a[itemprop="downloadUrl"]', $page).each(function() {
      $select.append('<option value="' + $(this).attr('href') + '">' + $(this).text() + '</option>');
    });

    $wodu.append($select);
  };

  var menuShowHide = function() {
    if (onSubmenu) {
      $wodu.show();
    } else {
      $wodu.hide();
    }
  };

  var onSubmenuHover = function() {
    onSubmenu = true;
    $wodu.show();
  };
  var onSubmenuBlur = function() {
    onSubmenu = false;
    setTimeout(function() { menuShowHide(); }, 100);
  };
  $devMenu.hover(onSubmenuHover, onSubmenuBlur);

  var $spinner = $('<img class="wodu-spinner" height="16" />');
  var p = $devMenu.position();
  var h = $('#plugin-info .head').height();

  var $wodu = $('<div/>', {
    class: 'wodu-dev-menu',
    html:
      '<a href="' + wodu.tracRepo + '">Browse in Trac</a>' +
      '<a href="' + wodu.svnRepo  + '">Subversion Repo</a>' +
      '<a href="' + wodu.tracLog  + '">Development Log</a>',
    style: 'top: ' + (p.top + h) + 'px; left: ' + p.left + 'px;'
  })
  .hover(onSubmenuHover, onSubmenuBlur)
  .append($spinner)
  .appendTo($('body'));

  if ($devMenu.hasClass('current')) {
    addDLLinkDropdown($('.block-content'));
    $spinner.hide();
  } else {
    $.get($('a', $devMenu).attr('href'), function(response) {
      // Get rid of all images first, no need to load those.
      var $devPage = $(response.replace(/<img[^>]*>/g, ''));
      addDLLinkDropdown($('.block-content', $devPage));
    })
    .always(function() {
      $spinner.hide();
    });
  }
};

wodu.init = function() {
  var $devMenu = $('#sections .section-developers');
  if ($devMenu.length) {
    wodu.setupDevSubmenu($devMenu);
  }

};
window.addEventListener('DOMContentLoaded', wodu.init);
