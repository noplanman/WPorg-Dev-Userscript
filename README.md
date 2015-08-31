# WPorg-Dev-Userscript (WoDU)
A userscript to help developers access certain WordPress.org pages a lot easier.

- Version: 1.0
- Short-Link for sharing: [j.mp/wodu-script](https://j.mp/wodu-script)
- Disclaimer: WoDU userscript is in no way affiliated with WordPress.org.

---

I encourage you to read about the [features](#features) first, to know what awesomeness you're about to experience!

If you feel sure about what you're doing and just can't hold it anymore, skip ahead to the [installation](#installation) right away and get started with WoDU :-)

---

##Features

Here's a list of currently available features:
- [Developer submenu](#developer-submenu): A submenu for the **Developer** tab on a plugin page.
- [Plugin card extras](#plugin-card-extras): Extra information panel for plugin cards on the WP.org plugins listing pages.

---

###Developer submenu
When viewing a single plugin page, hovering over the **Developer** tab now opens a quick an convenient set of links for easy access to the Subversion repository, Trac code browser, Trac development log, plugin admin (if available) and a dropdown with direct download links to all versions of the plugin.

![Open submenu][dev-submenu]

###Plugin card extras
When viewing a plugins listing page, each plugin card now has a little *code* icon on the top right corner. Clicking it, will load an overlay with the important information of the plugin and a collection of developer links for easy access (see *[Developer submenu](#developer-submenu))*.

![Plugin card][plugin-card]

![Plugin card extra][plugin-card-extra]

---

##Installation

WoDU can be installed on a **PC with Windows**, or a **Mac with OSX**.
Simply choose the plugin that corresponds to your web browser below and download the script, as easy as that!

###With Plugin
1. Which browser?
  - **Firefox**: Install the [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) extension.
  - **Chrome**: Install the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) extension.
  - **Opera**: Install the [ViolentMonkey](https://addons.opera.com/en/extensions/details/violent-monkey/) extension.
  - **Safari** & **Internet Explorer**: *NOT SUPPORTED!*

2. WoDU userscript can be found here (just choose any one)
  - [Get it on OpenUserJS.org](https://openuserjs.org/install/noplanman/WPorg-Dev.user.js)
  - [Get it on GreasyFork](https://greasyfork.org/scripts/12089-wporg-dev/code/WPorg-Dev.user.js)
  - [Get it on GitHub](https://raw.githubusercontent.com/noplanman/WPorg-Dev-Userscript/master/WPorg-Dev.user.js)

##Any ideas / Feature requests / Comments?
If you have any ideas for me or things you would like to see in this script, go ahead and create a [New Issue](https://github.com/noplanman/WPorg-Dev-Userscript/issues/new) and let me know!

Any comment is highly appreciated, thanks!

##Donations

Well, if you really insist, go ahead =)

- Bitcoin: 139U4NdzUwhWuF6E8ezuVpW9Ctqb6xeAFD
- [PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=armando%40noplanman%2ech&item_name=WoDU%20Donation)

##Changelog

###Version 1.0

- Add the developer submenu.
- Add the plugin cards extras.

[dev-submenu]: https://raw.githubusercontent.com/noplanman/WPorg-Dev-Userscript/master/assets/dev-submenu.png "Open submenu"
[plugin-card]: https://raw.githubusercontent.com/noplanman/WPorg-Dev-Userscript/master/assets/plugin-card.png "Plugin card"
[plugin-card-extra]: https://raw.githubusercontent.com/noplanman/WPorg-Dev-Userscript/master/assets/plugin-card-extra.png "Plugin card extra"
