![Bobril Logo](https://raw.githubusercontent.com/Bobris/Bobril/master/logo.png)
Bobril
======

[Main site bobril.com](bobril.com)

[![npm version](https://badge.fury.io/js/bobril.svg)](https://badge.fury.io/js/bobril)

Changelog of npm version: https://github.com/Bobris/Bobril/blob/master/CHANGELOG.md

Component oriented framework inspired by ReactJs (Virtual DOM, components with state) and Mithril (small size, more complete framework). Compared to ReactJS Added speeeed, autoprefixer, CSS in JS, router, additional livecycle methods, only rAF based repaint.
Bobril ignores Isomorphic JavaScript, because it would increase size and is not needed for SEO anyway (Google bot supports JavaScript). Client applications are expected to be written in TypeScript.
Because it is heavily used in production, backward compatibility is king. Any new feature must be optional or its perceived value to minified size ratio must be high enough.

It is intended to be used with [bobril-build](https://github.com/Bobris/bbcore).

Old Examples: http://bobris.github.io/Bobril/

For modern code look at Bobril Material: https://github.com/Bobril/Bobril-m

Tutorial videos [cz][en sub]:

[![Bobril tutorial](https://i.ytimg.com/vi/OV6Su7wauVA/hqdefault.jpg?sqp=-oaymwEXCNACELwBSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLC3ND2Ig4ihIKtsV8xe4BVXztqQ9w)](https://www.youtube.com/playlist?list=PLNswFMwJJR39BvE5NuYmEiVvUmzwhZqZa)

See it in vdom-benchmarks: http://vdom-benchmark.github.io/vdom-benchmark/

Chrome plugin to help you to inspect running Bobril application: https://chrome.google.com/webstore/detail/clouseau/npfemnefhbkiahihigplihehpbgkbhbj
(Github source for it is here: https://github.com/klesta490/bobril-clouseau)

Features:

-   Small - whole sample applications fits into 17kb gzipped.
-   No additional dependencies
-   Fast Virtual DOM diffing
-   Interesting component lifecycle callbacks
-   Components remember state in VDom cache
-   Components does not need to be HTML Elements - where is component(0-1) to HTMLNode(0-n) mapping
-   Support for partial invalidates for even faster redraws
-   Normalization of Events
-   support for evergreen browsers
-   batching of redrawing
-   any html element could be root
-   automatic passing of global configuration/context to children
-   automatic adding of "px" to length like inline style
-   reference to children nodes ala React
-   style as function which behaves like mini component with its own context
-   OnChange event and value attribute normalization
-   Key events
-   Mouse, Touch Events
-   SVG helpers
-   Router inspired by https://github.com/rackt/react-router/
-   Media detection
-   Focus, Blur, FocusIn, FocusOut events
-   Transparently add vendor prefixes for inline styles
-   Asap (setImmediate)
-   Scroll notification
-   Drag and Drop - multi touch, allows animating drag, state of the art as usual
-   Style - create css dynamically for even faster speed, allow recomputing styles for theming
-   PNG Sprites with dynamic change of color

Optional addins - separate npm modules:

[bobril-g11n](https://github.com/Bobris/bobril-g11n)

-   Globalization - behind uses moment.js, bobril-build extracts texts for localization from TypeScript source.

[bobx](https://github.com/Bobril/bobx)

-   Mobx like state management with deep integration with Bobril.

[bobflux](https://github.com/karelsteinmetz/bobflux)

-   Flux implementation for Bobril (Though BobX is preferred way)

[bobril-m-icons](https://github.com/bobril/bobril-m-icons)

-   Bobril Material Icons

Whole simple applications including Bobril could fit into 17kb gzipped. Bobril-build does dead-code elimination and module flattening.

Uses NodeJs, NPM, TypeScript, Jasmine

MIT Licensed

## How to develop

Install `npm i bobril-build -g`.

And then just start `bb` (bobril-build).

For helping writing TypeScript you can use VSCode.

If you want to work on something create bug with description, so work is not duplicated.
