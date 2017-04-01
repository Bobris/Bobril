Bobril core
===========

Bobril is component oriented framework with very lightweight virtual dom. It has no dependencies.

There are 2 versions of framework.

First should be used directly as scripts without any build tool, it declares global variable `b` which is like namespace for all Bobril methods. And is probably easiest way to start learning Bobril. 

Second one in package directory which is published in NPM. It is meant to be used with bobril-build. And should be used with standard ES6 imports. For this version there is also additional NPM module bobril-g11n to help with globalization of Bobril applications.

There is used `DEBUG` variable which could be predefined to false and remove some code by uglify, also remove warnings for developer mistakes, so make sure you are using nonminified version in development.

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

Children member in virtual dom could be `undefined`, `null`, `false`, `true`, string, number, object or array of all these items.
`undefined`, `null`, `false` and `true` are automatically skipped. Nested arrays are flattened. Strings, numbers are DOM text nodes.
Objects must contain at least one of `tag` or `component`. `component` could build itself to vdom, but lets skip their description for later.
There are 3 special values for `tag`. If `tag` is empty string, children must be string and it means just DOM text node,
string in children is converted to this inside Bobril, there are not much reasons to use this directly.
Second is more interesting, if `tag` is `"/"` it means that children (must be string) is treated as innerHTML. 
Normally you should not need it, but if you will use it, be very careful about XSS attacks and that string should never come directly from user. Probably only useful if you have Markdown renderer inside app.
Third special value for `tag` is `"-"`, it means to skip update of this component. It could be used for very similar purposes as `shouldChange` live cycle method.

Maybe you are asking why skipping `false` and `true` is useful. It allows to write code like this:

```
function div() {
    return { tag:"div", children: [].split.call(arguments) };
}

me.children = items.map((v)=>div(v.name, " ", v.readonly || { tag:"button", children: "rename" }));
```

When `tag` is `"svg"`, Bobril automatically adds all namespace crap, so your code is more readable.

`attrs` member is just JS object. Because `for` is reserved word in JS it must be written as `htmlFor`.
`style` attribute is handled specially. It could be string or object. String case for `style` should be used very rarely, because
it is not enriched like object case. For `style` key `float` must be written as `cssFloat` because it is also reserved keyword.

Components
----------

Every node could have `component` field defined. It has can contain main life cycle methods. It can also contain event handlers. You should not use native HTML events directly though for example attrs field. If you need to use some of events currently not wrapped by Bobril, you can use `postInitDom` function to link event.

<img src="https://raw.githubusercontent.com/Bobris/Bobril/master/src/BobrilComponentLifecycle.png" width="377px">

`postUpdateDomEverytime` is similar to `postUpdateDom` function, but it is called in every frame regardless shouldChange or invalidate(ctx).

Init
----

So you know how to create Virtual dom. So to display it at end of body use:

	b.init(functionReturningVdom);
	
This function will be called for every "frame", but only if it is requested. Easiest request for next frame is:

	b.invalidate();
