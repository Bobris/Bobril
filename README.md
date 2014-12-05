Bobril
======

Component oriented framework inspired by Mithril and ReactJs (work in progress)
Easy automatic generation of code and its speed has higher priority over simplicity.

Features in core:
- No additional dependencies
- Virtual DOM diffing
- Components remember state in VDom cache
- Normalization of Events
- support for IE8+, Android 4.0+
- batching of redrawing
- under 9kb minified

Features in extensions:
- OnChange event and value attribute normalization
- Key events
- Mouse, Touch and Swipe Events
- Vector graphic in spirit of React-Art just very limited in features, but under 4kb with SVG and VML backends
- Router inspired by https://github.com/rackt/react-router/
- Media detection

Near term planned extensions:
- Focus, blur events

Longer term extensions:
- New/Deleted Node animation
- Promises
- Prevent exit
- Ajax

Uses Karma, Jasmine, Coverage for testing

MIT Licensed
