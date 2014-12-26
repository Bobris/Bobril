Bobril
======

Component oriented framework inspired by Mithril and ReactJs (work in progress)
Easy automatic generation of code and its speed has higher priority over simplicity.

Examples: http://bobris.github.io/Bobril/

Features in core:
- No additional dependencies
- Virtual DOM diffing
- Components remember state in VDom cache
- Normalization of Events
- support for IE8+, Android 4.0+
- batching of redrawing
- under 10kb minified

Features in extensions:
- OnChange event and value attribute normalization
- Key events
- Mouse, Touch and Swipe Events
- Vector graphic in spirit of React-Art just very limited in features, but under 4kb with SVG and VML backends
- Router inspired by https://github.com/rackt/react-router/
- Media detection
- Focus, Blur, FocusIn, FocusOut events
- Transparently add vendor prefixes for inline styles
- Asap (setImmediate) and Promise A+ implementation - simplified https://github.com/taylorhakes/setAsap and https://github.com/taylorhakes/promise-polyfill

Near term planned extensions:
- Scroll notification

Longer term extensions:
- New/Deleted Node animation
- Prevent exit
- Ajax

Uses Karma, Jasmine, Coverage for testing

MIT Licensed
