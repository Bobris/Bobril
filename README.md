![Bobril Logo](https://raw.githubusercontent.com/Bobris/Bobril/master/logo.png)
Bobril
======

Component oriented framework inspired by Mithril and ReactJs (work in progress)
Easy automatic generation of code and its speed has higher priority over simplicity.

Examples: http://bobris.github.io/Bobril/

Features in core:
- No additional dependencies
- Virtual DOM diffing
- Components remember state in VDom cache
- Support for partial invalidates for even faster redraws
- Normalization of Events
- support for IE8+, Android 4.0+
- batching of redrawing
- under 11kb minified

Features in extensions:
- OnChange event and value attribute normalization
- Key events
- Mouse, Touch and Swipe Events (polyfill pointerEvents:none)
- Vector graphic in spirit of React-Art just very limited in features, but under 4kb with SVG and VML backends
- Router inspired by https://github.com/rackt/react-router/
- Media detection
- Focus, Blur, FocusIn, FocusOut events
- Transparently add vendor prefixes for inline styles
- Asap (setImmediate) and Promise A+ implementation - simplified https://github.com/taylorhakes/setAsap and https://github.com/taylorhakes/promise-polyfill
- Scroll notification

All extensions + core gziped are under 12kb
Of course you don't need all extensions, it is pure a la carte, so actual application could be shorter.

Near term planned extensions:

Longer term extensions:
- New/Deleted Node animation
- Prevent exit
- Ajax

Uses NodeJs, NPM, TypeScript 1.4, Karma, Jasmine, Coverage

MIT Licensed


How to develop
--------------

Use `npm up` to download all needed node modules.

For TypeScript compilation you can use Visual Studio (even free version is perfect)
On other platforms you can use `gulp ts`.

Start `gulp` for minification and generating statistic for LibSize example.

`gulp pages` upload examples to GitHub pages.

If you want to work on something create bug with description, so work is not duplicated.
