Bobril core
===========

It has no dependencies.

It polyfills for IE8 - `Array.isArray`, `Array.map`, `Object.create`, `Object.keys`

There is used `DEBUG` which could be predefined to false and remove some code by uglify

It defines global variable `b` which is used like namespace for all bobril methods.

Bobril is component oriented framework with very lightweight virtual dom.

Virtual Dom
-----------

Very basic examples how to build it by pure JS objects. Of course nothing prevents you to create your own helper functions to shorten code to less than original HTML.

HTML | Bobril
-----+-------
`<div></div>` | `{ tag:"div" }`
`<span>Hello</span>` | `{ tag:"span", children:"Hello" }`
`<a href="url">Ex</a>` | `{ tag:"a", attrs: { href:"url" }, children:"Ex" }`
`<span style="text-size:20px">Big</span>` | `{ tag:"span", attrs: { style: { textSize:"20px" } }, children:"Big" }`
`<h1 class="head">&lt;</h1>` | `{ tag:"h1", attrs: { className:"head" }, children:"<" }`
`style="float:left"` | `style: { cssFloat:"left" }`
`<div><br></div>` | `{ tag:"div", children: { tag:"br" } }`
`<div><span>A</span>B</div>` | `{ tag:"div", children: [ { tag:"span", children: "A" }, "B" ] }`

Note: Example with `cssFloat` does not work on IE8 without `bobril.styleshim` extension.
