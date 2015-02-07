Bobril core
===========

It has no dependencies.

It polyfills for IE8 - `Array.isArray`, `Array.map`, `Object.create`, `Object.keys`

There is used `DEBUG` variable which could be predefined to false and remove some code by uglify

It defines global variable `b` which is used like namespace for all bobril methods.

Bobril is component oriented framework with very lightweight virtual dom.

Virtual Dom
-----------

Very basic examples how to build it by pure JS objects. Of course nothing prevents you to create your own helper functions to shorten code to less than original HTML.

HTML | Bobril
---- | ------
`<div></div>` | `{ tag:"div" }`
`<span>Hello</span>` | `{ tag:"span", children:"Hello" }`
`<a href="url">Ex</a>` | `{ tag:"a", attrs: { href:"url" }, children:"Ex" }`
`<span style="text-size:20px">Big</span>` | `{ tag:"span", style: { textSize:"20px" }, children:"Big" }`
`<h1 class="head">&lt;</h1>` | `{ tag:"h1", className:"head", children:"<" }`
`style="float:left"` | `style: { cssFloat:"left" }`
`<div><br></div>` | `{ tag:"div", children: { tag:"br" } }`
`<div><span>A</span>B</div>` | `{ tag:"div", children: [ { tag:"span", children: "A" }, "B" ] }`

Note: Example with `cssFloat` does not work on IE8 without `bobril.styleshim` extension.

Children member in virtual dom could be `undefined`, `null`, `false`, `true`, string, object or array of all these items.
`undefined`, `null`, `false` and `true` are automatically skipped. Nested arrays are flattened. Strings are DOM text nodes.
Objects must contain atleast one of `tag` or `component`. `component` could build itself to vdom, but lets skip their description for later.
There are 2 special values for `tag`. If `tag` is empty string, children must be string and it means just DOM text node,
string in children is converted to this inside Bobril, there are not much reasons to use this directly.
Second is more interesting, if `tag` is `"/"` it means that children (must be string) is treated as innerHTML. 
Normally you should not need it, but if you will use it, be very careful about XSS attacks and that string should never come directly from user.
Probably only useful if you have Markdown renderer inside app. It is also internally used to build VML as that was only way which worked for me.

Maybe you are asking why skipping `false` and `true` is useful. It allows to write code like this:

```
function div() {
    return { tag:"div", children: [].split.call(arguments) };
}

me.children = items.map((v)=>div(v.name, " ", v.readonly || { tag:"button", children: "rename" }));
```

Note: Numbers are not supported and must be converted to strings before passing to children.

When `tag` is `"svg"`, Bobril automatically adds all namespace crap, so your code is more readable.

`attrs` member is just JS object. Because `for` is reserved word in JS it must be written as `htmlFor`.
`style` attribute is handled specially. It could be string or object. String case for `style` should be used very rarely, because
it is not enriched like object case. For `style` key `float` must be written as `cssFloat` because it is also reserved keyword.
