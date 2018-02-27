![Bobril Logo](https://raw.githubusercontent.com/Bobris/Bobril/master/logo.png)
Bobril
======

[![npm version](https://badge.fury.io/js/bobril.svg)](https://badge.fury.io/js/bobril)

Changelog of npm version: https://github.com/Bobris/Bobril/blob/master/CHANGELOG.md

Component oriented framework inspired by ReactJs (Virtual DOM, components with state) and Mithril (small size, more complete framework). Compared to ReactJS Added speeeed, autoprefixer, CSS in JS, router, additional livecycle methods, only rAF based repaint.
Bobril ignores Isomorphic JavaScript, because it would increase size and is not needed for SEO anyway (Google bot supports JavaScript). Client applications are expected to be written in TypeScript.
Because it is heavily used in production, backward compatibility is king. Any new feature must be optional or its perceived value to minified size ratio must be high enough.

It is intended to be used with [bobril-build](https://github.com/Bobris/bobril-build). There is faster build in works also in usable state (https://github.com/bobril/bbcore) with some additional features like lazy module loading.

If you need compatibility with IE8 look at 2.x branch.

Examples: http://bobris.github.io/Bobril/
For modern code look at Bobril Material: https://github.com/Bobril/Bobril-m

Tutorial videos [cz][en sub]:

[![Bobril tutorial](https://i.ytimg.com/vi/OV6Su7wauVA/hqdefault.jpg?sqp=-oaymwEXCNACELwBSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLC3ND2Ig4ihIKtsV8xe4BVXztqQ9w)](https://www.youtube.com/playlist?list=PLNswFMwJJR39BvE5NuYmEiVvUmzwhZqZa)

See it in vdom-benchmarks: http://vdom-benchmark.github.io/vdom-benchmark/

Documentation: https://github.com/Bobris/Bobril/blob/master/src/bobril.md

Chrome plugin to help you to inspect running Bobril application: https://chrome.google.com/webstore/detail/clouseau/npfemnefhbkiahihigplihehpbgkbhbj
(Github source for it is here: https://github.com/klesta490/bobril-clouseau)

If you want to speed up your Angular app use: https://github.com/karasek/ngBobril

Bobx (Mobx like state managment library with deep Bobril integration) is here: https://github.com/bobril/bobx

Flux implementation for Bobril is here: https://github.com/karelsteinmetz/bobflux

Bobril Material Icons: https://github.com/bobril/bobril-m-icons

Available in npm as bundle of most interesting and useful plugins

Features:

* Small - whole sample applications fits into 17kb gzipped.
* No additional dependencies
* Fast Virtual DOM diffing
* Interesting component lifecycle callbacks
* Components remember state in VDom cache
* Components does not need to be HTML Elements - where is component(0-1) to HTMLNode(0-n) mapping
* Support for partial invalidates for even faster redraws
* Normalization of Events
* support for IE9+, Android 4.1+ (Support for IE8 removed in 3.0)
* batching of redrawing
* any html element could be root
* automatic passing of global configuration/context to children
* automatic adding of "px" to length like inline style
* reference to children nodes ala React
* OnChange event and value attribute normalization
* Key events
* Mouse, Touch Events (includes polyfill pointerEvents:none and userSelect:none)
* SVG helpers
* Router inspired by https://github.com/rackt/react-router/
* Media detection
* Focus, Blur, FocusIn, FocusOut events
* Transparently add vendor prefixes for inline styles
* Asap (setImmediate) and Promise A+ polyfill - simplified https://github.com/taylorhakes/setAsap and https://github.com/taylorhakes/promise-polyfill
* Scroll notification
* Drag and Drop - uses browser one except on IE9, multi touch, allows animating drag, state of the art as usual
* Style - create css dynamically for even faster speed, allow recomputing styles for theming
* PNG Sprites with dynamic change of color

Optional addins - separate npm modules:

[bobril-flex-ie10](https://github.com/Bobris/Bobril/tree/master/packageFlexIE10)

* Transparently polyfill modern flexbox for IE10

[bobril-g11n](https://github.com/Bobris/bobril-g11n)

* Globalization - behind uses moment.js, bobril-build extracts texts for localization from TypeScript source.

Whole simple applications including Bobril could fit into 17kb gzipped. Bobril-build does dead-code elimination and module flattening.

Uses NodeJs, NPM, TypeScript, Karma, Jasmine, Coverage

MIT Licensed

## How to develop

Use `npm up` to download all needed node modules.

For helping writing TypeScript you can use VS Code. Compilation on save is disabled. So you have to work with gulp started in background.

Start `gulp` for TS compilation, minification and generating statistic for LibSize example.

`gulp compilets` force compilation of all TS files. It reads tsconfig.json files for information how to compile each subproject.

`gulp pages` upload examples to GitHub pages.

If you want to work on something create bug with description, so work is not duplicated.
