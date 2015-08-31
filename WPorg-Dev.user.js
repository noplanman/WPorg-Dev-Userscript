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

var pluginsURL = 'https://wordpress.org/plugins/';

var wodu = {};

wodu.getSlug = function(href) {
  return href.substring(pluginsURL.length).replace(/\/+$/, '');
};

wodu.getDLLinkDropdown = function($page) {
  var $select = $('<select/>')
  .append('<option value="">Direct Download</option>')
  .click(function() { this.value = ''; })
  .change(function() { if (this.value) location.href = this.value; });

  $('.unmarked-list a[itemprop="downloadUrl"]', $page).each(function() {
    $select.append('<option value="' + $(this).attr('href') + '">' + $(this).text() + '</option>');
  });

  return $select;
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
    '.wodu-dev-menu { display:none; position: absolute; background: white; border: 1px solid #d7d7d7; }' +
    '.wodu-dev-menu > * { display: block; font-size: 1.2em; }' +
    '.wodu-dev-menu > a { display: block; padding: 0 6px; }'
  );

  var slug = wodu.getSlug(location.href);
  var tracLog  = 'http://plugins.trac.wordpress.org/log/' + slug;
  var svnRepo  = 'http://plugins.svn.wordpress.org/' + slug;
  var tracRepo = 'http://plugins.trac.wordpress.org/browser/' + slug;

  var onSubmenu = false;

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

  var $spinner = $('<div class="wodu-spinner"/>');
  var p = $devMenu.position();
  var h = $('#plugin-info .head').height();

  var $wodu = $('<div/>', {
    class: 'wodu-dev-menu',
    html:
      '<a href="' + tracRepo + '">Browse in Trac</a>' +
      '<a href="' + svnRepo  + '">Subversion Repo</a>' +
      '<a href="' + tracLog  + '">Development Log</a>',
    style: 'top: ' + (p.top + h) + 'px; left: ' + p.left + 'px;'
  })
  .hover(onSubmenuHover, onSubmenuBlur)
  .append($spinner)
  .appendTo($('body'));

  if ($devMenu.hasClass('current')) {
    $wodu.append(wodu.getDLLinkDropdown($('.block-content')));
    $spinner.hide();
  } else {
    $.get($('a', $devMenu).attr('href'), function(response) {
      // Get rid of all images first, no need to load those.
      var $devPage = $(response.replace(/<img[^>]*>/g, ''));
      $wodu.append(wodu.getDLLinkDropdown($('.block-content', $devPage)));
    })
    .always(function() {
      $spinner.hide();
    });
  }
};

/**
 * Add extra plugin information to plugin cards.
 *
 * @param {jQuery} $pluginCards All the plugin cards displayed on the current page.
 */
wodu.setupPluginCardExtras = function($pluginCards) {
  // Add the CSS.
  GM_addStyle(
    '.wodu-extras-button { height: 16px; width: 16px; cursor: pointer; background: url(datauri); }' +
    '.wodu-spinner { position: absolute; left: 50%; top: 50%; }' +
    '.wodu-close { position: absolute; top: 4px; right: 4px; }' +
    '.wodu-plugin-card { position: relative; }' +
    '.wodu-plugin-card-extras { display: none; position: absolute; width: 100%; height: 100%; margin: -20px -20px -10px; padding: 4px 10px; background-color: rgba(255, 255, 255, 0.9); z-index: 1; }' +
    '.wodu-title { padding: 4px 10px; font-size: 1.2em; font-weight: bold; }' +
    '.wodu-subtitle { padding: 0 10px; font-size: 1.1em; font-weight: bold; }'
  );

  $pluginCards.each(function() {
    var $card = $(this).addClass('wodu-plugin-card');
    var $cardTop = $('.plugin-card-top', $card);


    var $extrasButton = $('<div class="wodu-extras-button"/>')
    .click(function() {
      $extrasButton.hide();
      $extras.show();
    })
    .prependTo($cardTop);

    // Prepare the extras.
    var $spinner = $('<div class="wodu-spinner"/>');
    var $close = $('<div class="wodu-close"/>')
    .click(function() {
      $extras.hide();
      $extrasButton.show();
    });
    var $panelInfo = $('<div class="wodu-col-6 wodu-panel-info"/>');
    var $panelDev  = $('<div class="wodu-col-6 wodu-panel-dev"/>');
    var extrasLoading = false;
    var $extras = $('<div/>', { class: 'wodu-plugin-card-extras' })
    .append($spinner)
    .append($close)
    .append($panelInfo)
    .append($panelDev)
    .prependTo($cardTop);

addToInfo = '<br><strong>Total Downloads:</strong>' + 2346622


/*

<div class="wodu-plugin-card-extras" style="">
  <div class="wodu-close"></div>
  <div class="wodu-title">Plugin title</div>
  <div class="wodu-col-4 wodu-panel-info">

      <strong>Requires:</strong> 3.5 or higher<br>

      <strong>Compatible up to:</strong> 4.2.4<br>

  <strong>Last Updated: </strong> <meta itemprop="dateModified" content="2015-7-23">2015-7-23<br>

      <strong>Active Installs:</strong>
    <meta itemprop="interactionCount" content="UserDownloads:660">
    90+<br>

      <strong>Total Downloads:</strong>
    2346622
    </div>


  <div class="wodu-col-4 wodu-panel-dev">
    <div class="wodu-subtitle">Dev Links</div>
      List of Links
      <ul>
        <li>Link 1</li>
        <li>Link 2</li>
      </ul>
  </div>
</div>

 */



    var slug = wodu.getSlug($('.name a', $card).attr('href'));
    console.log(slug);
    $.get(pluginsURL + slug + '/developers', function(response) {
      // Get rid of all images first, no need to load those.
      var $devPage = $(response.replace(/<img[^>]*>/g, ''));



      $panelDev.append(wodu.getDLLinkDropdown($devPage));
    })
    .always(function() {
      $spinner.hide();
    });
  });
};

/**
 * Start the party.
 */
wodu.init = function() {
  // Add the global CSS rules.
  GM_addStyle(
    '.wodu-spinner { height: 16px; width: 16px; background: url(data:image/gif;base64,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) }' +
    '.wodu-close { height: 16px; width: 16px; cursor: pointer; background: url(data:image/gif;base64,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) }' +
    '.wodu-col-6 { width: 50%; float: left; padding: 4px 10px; box-sizing: border-box; }'
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
window.addEventListener('DOMContentLoaded', wodu.init);
