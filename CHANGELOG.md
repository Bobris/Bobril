# CHANGELOG

## 20.4.1

Fixed performance regression in reconciliation.

## 20.4.0

Make it compatible with TypeScript 4.8.3

## 20.3.5

Do not move "B" in "AB" => "BC" reconciliation.

## 20.3.4

Disabled inputs are not considered focusable.

## 20.3.3

Sprite with recolor to #rrggbb00 was wrongly opaque instead of fully transparent.

## 20.3.2

Attempt to fix missing sprite in styleDef.

## 20.3.1

Fixed sprite resolution selection.

## 20.3.0

New function `setAllowInvalidateStyles` which allows to speed up app startup by lowering number of rebuilding styles.

## 20.2.0

Added optional `slot` property into `wrapWebComponents` function to be able use named slots in wrapped web components.

## 20.1.1

Fixed regression in 20.1.0 when sprite was directly used in styleDef.

## 20.1.0

Create dynamically colored sprites lazily only when used by `b.style`. Should make first start of big applications much faster.
Maybe sprite speed up by remembering ImageData instead of Image.

## 20.0.0

Click and DblClick events are not listened in Capture phase which increase compatibility with web components.
New method `addEventListeners` needs to be called when using Bobril nodes in 3rd party library which prevents bubbling of various browser events. You will want to usually call together with `addRoot`.

## 19.0.0

Removed now unused feature of isArray customization, Bobx now uses Proxies which makes them Array.isArray compatible.

Made useState compatible with ES2015 spread.

## 18.2.0

Fixed refs when switched instances during one render.

Custom events in WebComponent wrapper making it complete.

## 18.1.0

Added basic support for wrapping Web Components (custom events will be added in next version).

## 18.0.0

Removed compatibility with IE11 and old Edge.
Removed definition of `Thenable<T>` replace by `PromiseLike<T>` if you used it.

## 17.13.1

`svg` method was not marked as pure.

## 17.13.0

Css update was moved from before frame to after frame to prevent unstyled icons.

## 17.12.0

`useCanDeactivate` new hook with limitation only one per component.

## 17.11.0

`key` and `ref` are deleted from props in TSX.

## 17.10.0

Improved `shouldBeFocusVisible()`.

## 17.9.0

Fixed compatibility with TypeScript 4.3.4

## 17.8.0

New hooks `useIsFocused()` and `useIsMouseOver()`. They return true if any child of current component has such state.
New function `shouldBeFocusVisible()` which returns true if last user interaction was by keyboard.

## 17.7.0

Effect hooks now working in dynamic style contexts.

## 17.6.1

Fixed regression in router from 17.1.0 (blank screen after reload of some routes).

## 17.6.0

New `FragmentWithEvents` component. Courtesy of _martind-gmc_.

## 17.5.0

Export `extractParams` router url parsing function.

## 17.4.0

Added new function `isSvgSprite`.

Fixed update of element attributes when updated from undefined to object.

## 17.3.0

Allow to use attribute selectors in pseudo css definitions. Example: `b.styleDef({},{ "[aria-disabled=\"true\"]": { opacity: 0.5 } })`

## 17.2.0

Router now allows to store additional state in browser history not visible in URL.
Use this new method to get state `getActiveState()`. `createRedirectPush` and `createRedirectReplace` have new 3rd parameter to set state with transition, if new state is not provided current state is preserved.

## 17.1.0

Fixed a lot of behaviors and inApp calculation in router. Now uses history.state to remember deepness of history.

## 17.0.3

Fix router back transition inApp calculation.

## 17.0.0

Nominal types `Nominal<string,"Bobril">`.

`IBobrilStyleDef` is now not plain string but nominal type.

`sprite` without color creates another nominal type `ColorlessSprite`. `spriteWithColor` now takes only `ColorlessSprite` type making it compile time type safe, function for evaluation could be also passed.

New method `svg` allows to embed svg in JS source and then use it as `ColorlessSprite`. It is not expected to directly use `svg` method but instead `sprite` and bobril-build will load svg from disk and change that call to this method.

New method `svgWithColor` allows to resize previously defined svg or recolor multiple colors not just `gray` for which you can still use `spriteWithColor`.

When you need to use jQuery selectors with Bobril and you already have nice `key` in VDom to use with `bbseeker`, you can now enable automatic publishing of keys to classNames by `b.setKeysInClassNames(true); b.ignoreShouldChange();` without need to change your application.

## 16.1.1

Fix of regression from 15.0.0 of failure to removing inline style with dash.

## 16.1.0

Temporary revert of Bobril 16.0.0

## 15.2.0

Fix of small problem in router.

ctxClass now have to inherit from BobrilCtx and call its super constructor. But adding disposables in such constructor works again.

components without ctxClass have their ctx instance of BobrilCtx instead of plain object.

## 15.1.0

Router URLs now does not have last slash when optional parameter is not defined.

Component now inherit from BobrilCtx which save some bytes from bundle.

## 15.0.1

Fix type incompatibility of b.Component and b.IBobrilCtx.

## 15.0.0

Breaking change - string styles are not anymore supported `{ tag: 'div', style: 'color: red' }` use objects instead.

Subtle breaking change/optimization - when tsx components render returns Fragment then it is inlined in vdom.

Cleaned up repository from old non npm version. Port old tests.

New dynamic styles feature allowing very efficient update of element inline styles and classes.

```tsx
<div
    style={() => {
        let s = b.useState(0);
        s((s() + 1) % 101);
        return { opacity: s() * 0.01 };
    }}
>
    Pulsing
</div>
```

Tsx components can skip component update by returning constant `b.skipRender`.

```tsx
function SkipHello(data: { input: string }) {
    if (data.input == "skip") return b.skipRender;
    return <Hello input={data.input}></Hello>;
}
```

Key down up events have `key` property (same meaning as `KeyboardEvent.key`) and is normalized on IE11 and Firefox.

New polyfills for IE11: `new Set(array)`, `new Map(array)`

Router `injectParams` function is exported.

## 14.18.0

Improved `anchor` and added `Anchor` TSX component. (Contrib by https://github.com/keeema)

## 14.17.0

Make it typecheck with noUncheckedIndexedAccess.

## 14.16.1

Fixed crash on uncontrolled multi-select.

## 14.16.0

Changed `useEffect` body to be executed inside update frame. Before this change it was run asynchronously after frame using `b.asap`. This converts `useEffect` into another lifecycle method after `postUpdateDom`. Difference is that `postUpdateDom` (`useLayoutEffect`) can trigger another synchronous `Render`, but `useEffect` is executed always only once as last. Calling `deferSyncUpdate` from `useEffect` body does not have any effect.

## 14.15.0

`b.setIsArrayVdom` is better typed to support TS 4.1.x

better typed dropEffect and effectAllowed in DnD

## 14.14.0

`b.styledDiv` is better typed.

## 14.13.0

New function `spriteWithColor(colorLessSprite: IBobrilStyleDef, color: string): IBobrilStyleDef` for coloring already created sprites.

## 14.12.0

Optimized, simplified and shortened code for pointer events.

b.style on b.styleDef(string) could be called outside of render now.

## 14.11.0

use User Timing API to measure component performance (#109)

-   report component lifecycle method durations into User Timing API
-   results are available in the performance tab of devtools (e.g. 'timings' timelane in Chrome)
-   have to be manually switched on in the code `b.setMeasureConfiguration()`, since the performance impact is not known

## 14.10.0

New functions `namedStyleDef` and `namedStyleDefEx` which are not modified by bobril-build and allows to define css classes with exact names.

## 14.9.0

Allow override `b.asset` behavior by `b.setAsset` or from bobril build by setting defining global function `bobrilBAsset`.

## 14.8.0

Added `useCallback` and `useReducer` hooks.

## 14.7.0

Fixed JSX compatibility with TypeScript 3.9.2. Unfortunately `never` type cannot be used anymore for `data` type, use `{}` instead.
Fixed missing handler in chain by providing build in basic implementation instead. Also it should correctly handle cases when some route handler does not want to show child.

## 14.6.1

Fixed bug in router when routes had different nesting.

## 14.6.0

Fixed `vdomPath` search for Portals. Portal element now defaults to document.body same as `b.init`.

## 14.5.0

Added support for Portals. `IBobrilNode` for portal is `{ tag: "@", data: domElement, children }`. In TSX it is `<b.Portal element={domElement}>{children}</b.Portal>`.

`useStore` hook now calls dispose on store automatically when destroying the context

## 14.4.0

`Fragment` now require its parameter. Should not be problem because TSX/createElement passes that parameter always nonnull. It can now return `IBobrilNode` type making it more compatible to functional components.

## 14.3.0

Changed zIndex of dragged container div to be 1e9, so hopefully above everything.

## 14.2.0

New `assertNever` method use for exhaustive check in TypeScript.

## 14.1.1

Just republished correctly.

## 14.1.0

New exported method

```tsx
export function swallowPromise<T>(promise: Promise<T>): void {
    promise.catch((reason) => {
        console.error("Uncaught exception from swallowPromise", reason);
    });
}
```

## 14.0.1

Made `flatten` work correctly with observable arrays from Bobx.

## 14.0.0

Breaking change createDerivedComponent requires to specify both data types.

## 13.1.2

Typings for createDerivedComponent

## 13.1.1

Fix for regression in 13 of wrong propagation of cfg.

## 13.1.0

Add support for media queries

## 13.0.5

Better typesafetyness for old style IBobrilComponent methods.

## 13.0.4

Fixed ICtxClass because Bobril will always send these parameters, users just don't need to use them.

## 13.0.3

Fixed regression in 13.0 to allows to use ctxClass with never TData with more generics and less any.

## 13.0.2

Fixes in Drag and drop.

## 13.0.1 beta

Fixed some regressions from 13.0.0

## 13.0.0 beta

BREAKING CHANGE

-   `IBobrilCacheNode` has now just read only fields as it was always intended. Events `onFocus`, `onBlur`, `onSelectionChange` bubble now.
-   `bubble`, `broadcast`, `captureBroadcast` now type check `EventNames` and `EventParam<TName>`

Most event parameters now inherit from `IEventParam` which contains `target` of `IBobrilCacheNode` type.
New hooks `useEvents` and `useCaptureEvents` (this is completely new capability `bubble` and `broadcast` now first broadcast to all useCaptureEvents). New types `IHookableEvents` and `ICapturableEvents`. New event `onInput` which is similar to `onChange` but parameter is object with `target` and `value` fields and bubbles.

Improve mouse cursor override during drag and drop.

Npm now contains index.js (ES5) and index.d.ts.

## 12.0.0

BREAKING CHANGE - Router Params are now better typed to allow get undefined. Quick fix is to add `!` everywhere it breaks code.

## 11.7.0

`useEffect` hook is now synchronously executed by `b.syncUpdate()`, so it could be easily tested without async waiting.

## 11.6.0

Default component name from class or function name now appends unique sufix, so even after minification it stays unique.

## 11.5.0

Result of `b.keyframesDef` could be used as factory but also as string, in all places where it makes sense.

## 11.4.3

Fixed `useEffect` hook when called twice in same frame due to another `useLayoutEffect` hook.

## 11.4.2

Fixed renamed shimmed styles like `float` on update render in browsers which support `float` as well as `cssFloat`.

## 11.4.1

Fixed missing s in TSX style property. Fixed onMouseIn and onMouseOut events - they should be called only on change of node under mouse.

## 11.4.0

Removed workaround for Chrome styling (hopefully it is fixed for long time). `b.ignoreShouldChange()` now also skip same reference for node optimization, making it true deep invalidate.

## 11.3.1

Fixed init for `anchor`.

## 11.3.0

New component lifecycle method `postRenderDom` which combines `postInitDom` and `postUpdateDom`

Allow to define keyframes animations:

```tsx
let red2green = b.keyframesDef({ from: { color: "red" }, to: { color: "green" } });
b.init(() => <div style={{ animation: red2green("2s") }}>Hello</div>);
```

## 11.2.0

New features: shouldChange in Component, PureComponent, useMemo

## 11.1.2

It is pity, but it has be `any`.

## 11.1.1

Better fix for IRouteHandler.

## 11.1.0

Better typing of IRouteHandler. New `Link` component which is more suited to TSX world.
Allowed to use string inside `b.style` as class. It is still better to declare class name with `b.styleDef("class")` on one place.

## 11.0.1

Until Bobril 12 allowed to have `0` in styles. It is also correctly skipped in `b.style`.

## 11.0.0

Styles are now strictly secured by TypeScript definitions. Because of more strict typings increased major version, but hoping all errors will be true mistakes.

## 10.2.2

Fixed compatibility with TS 3.5.1

## 10.2.1

`float` could be now used in style instead of `cssFloat`.

## 10.1.4

setTimeout method is now use only from window so it should not have problem with nodejs types. Decreased size of library because of it.

## 10.1.3

It should be possible to pass children in TSX as attribute.

## 10.1.2

Fixed focus change events when focus change called from inside focus change events.

## 10.1.1

Fixed events in class components.

## 10.1.0

Focus method has optionally backwards search.
Class component now supports also nonenumerable properties (Babel creates such code).
Allow `never` type to be data/props type additionally to `object`.

## 10.0.2

Removed last const enum.

## 10.0.1

Had to workaround TS strange behavior by need to specify Ctx type default is any so all should compile, but it will be less type safe.

## 10.0.0

All these are possibly breaking changes but should be minor.
Removed all const enums so now Babel could be used for "compiling TypeScript" (In future it will be optimized to same optimal code by bobril-build). IBobrilNode now cannot be function, it never worked but TS type allowed it.
`provideContext` was renamed to `useProvideContext`.
Exposed new `IBobrilEvents` with all events defined by Bobril.

## 9.12.0

Fixed Component, added mouseLeave and mouseEnter events.
All methods starting on[A-Z] are considered events.
Added support for class component inheritance.
Added way to override component id without calling b.component.
jsx.d.ts merged into index.ts as TSX is now always supported even without bobril-build.
Fixed bind on whole class, oops.

## 9.11.1

Another fix for children in TSX.

## 9.11.0

New handy exported interface:

```tsx
export interface IDataWithChildren {
    children?: IBobrilChildren;
}
```

Class `Component<TData = IDataWithChildren>` using this as generic default.

Decorator bind fixed and extended to cover all methods in class.

Fixed children typings in TSX.

## 9.10.0

Added `createContext` with similar API like in React. `useContext` and `provideContext` now additionally work with this type of context. Added decorator `context` which could be used in class components or classic component ctx.

Added generic to `IBobrilCtx<TData>` and `IBobrilComponent<TData>`.

Fix ref callback.

## 9.9.0

Removed support for IE9 and IE10. Completely removed code which still sometimes made phantom clicks on 0,0.

## 9.8.0

Added `useStore` hook for creating mutable store.
Added first test to Bobril ;-)

## 9.7.1

Another fix of phantom clicks at 0,0 now with button.

## 9.7.0

Allow libraries to write their hooks in low level code.

## 9.6.0

Allow to use hooks even in classic components.
Added `useEffect` and `useLayoutEffect` hooks.
During frame you can now trigger exactly one synchronous update by calling `deferSyncUpdate()`.
Added `@bind` directive for binding class methods.

## 9.5.0

b.component does not need to be used with TSX.

## 9.4.0

Added `useRef` hook. Also made both `useRef` and `useState` more useful in Bobril by implementing also `IProp<T>`. `ref` property in `IBobrilNode` also supports `{ current: IBobrilCacheNode | undefined }` so it could be used together with `useRef`.

## 9.3.0

Allow to use EventResult on classic components too. Fixed `useContext` empty context crash.

## 9.2.0

More strict typing of Derived component. Exported `ChildrenType` type.

## 9.1.1

Fixed unused parameter.

## 9.1.0

Added `useContext` and `provideContext` hooks.

## 9.0.0

New way how to write components. `b.component` takes class or function and creates Bobril component factory function. TSX now supports Bobril event handlers. Event Handlers could now return also `EventResult` enum instead of `boolean`, bubbling and broadcasting was updated to works with EventResult. TSX `ref` could be now also simple `string`.

Breaking change is that children parameter type is not always `IBobrilChildren`, but extracted from `data.children`.

Added polyfill for `Object.is`.

First hook `useState` implemented with same semantics like in React.

## 8.21.0

New function debounceProp which delays setting value after changes stops for defined delay (default 500ms).

## 8.20.0

Added support for TSX fragments `<>...</>`.

## 8.19.0

Added `cancelable` to `IBobrilMouseEvent` so it could be detected that browser want to handle it itself.

## 8.18.0

TSX now correctly pass children to functions with just one parameter.

## 8.17.1

Fix compilation errors in TypeScript 3.2.2

## 8.17.0

New type `IBobrilNodeWithKey<T>` which `withKey` newly returns.
Duplicate keys shows warning in console (only in DEBUG mode).

## 8.16.0

Added polyfills for: Array.find, Array.findIndex, Array.some, String.includes, String.startsWith, String.endsWith

## 8.15.2

Fixed router which did not call canDeactivate when handler was function

## 8.15.1

Made compatible with TypeScript 3.1.1

## 8.15.0

Allow route handler to return IBobrilChildren to ease burden of more stricter IBobrilNode.

## 8.14.0

Forbid arrays to be compatible with IBobrilNode type, you can probably use IBobrilChildren instead.

## 8.13.0

Removed .d.ts and .js to make package lighter.

## 8.12.0

Allow to customize isArray detection in Vdom. This allows to use Bobx observable arrays.
Array flattening algorithm complexity decreased for nested arrays.

## 8.11.2

Fixed router problem when first route starting deeper. Thanks @Petaniss for repro.

## 8.11.1

Fixed regression with passing undefined to color in b.sprite with enabled spriting.

## 8.11.0

Forcing active event listeners, due to browsers breaking apps because "they think it is good for users".

## 8.10.1

invalidated() is reset in syncUpdate too.

## 8.10.0

Prevented onClick event when you move pointer too far. It could be controversial change, so be prepared for reverting of this change if it will not work out in real world.

## 8.9.2

Fixed regression which makes static bundled sprites invisible if they are created later.

## 8.9.1

Fixed regression to allow to pass color as variable string again to b.sprite with enabled spriting in bb2.

## 8.9.0

Support for higher dppx sprites.

## 8.8.1

Fixed revalidateMouseIn method to fix also Drag and Drop use-case.

## 8.8.0

New feature runMethod and getCurrentCtxWithEvents which is new method of how to call methods between components.

## 8.7.0

Fixed searching vdomPath when one of roots was created by Bobril. Don't do this at home.

## 8.6.1

Fixed bug in updateNode in special case.

## 8.6.0

Exported encodeUrl, encodeUrlPath, decodeUrl functions.

## 8.5.0

Compilable by TS 2.8.1.

## 8.4.2

Fixed crashes in virtual components with local invalidates.

## 8.4.1

Compilable by TS 2.7.1 with strict settings.

## 8.4.0

Compile on most strict settings. Callback functions in IBobrilNode.ref are now called with undefined instead of null when destroying reference.

## 8.3.1

Anchor element with href is now also considered tabbable, so it can be made untabbable if needed.

## 8.3.0

Forbid use of wrongly cased attribute tabIndex (it must be all lower case).

## 8.2.4

Normalize Keypress event on Firefox by filtering Alt key. Other browsers behave correctly.

## 8.2.3

Fixed !important in inline styles works for multi word properties.

## 8.2.2

Removed useless line with setting DEBUG default value which with "use strict" does not have meaning.

## 8.2.1

Fix of infinite routing when canDeactive returns false and url is changed

## 8.2.0

Added support for !important in inline styles. Whitelisted touchCallout style property.

## 8.1.1

Fix Drag And Drop in Chrome 62, to not recreate original DNDCtx and lost data types.

## 8.1.0

Made many types generic by data type. And TSX is type safe again.

## 8.0.1

Fixed regression in 8.0.0 when partially invalidating node it wrongly remember old className, styles or tag.

## 8.0.0

Breaking Change: (You are most probably are not affected by this)

IBobrilNodes without component are now compared by reference in update and if equal whole update it skipped. It means IBobrilNodes passed into Bobril should be immutable. To prevent such mutation mistakes object is frozen in debug version. It now makes sense to remember constant node trees to enjoy this speed up.

IBobrilCacheNode has new field orig which contains reference to original IBobrilNode.

Local invalidate correctly remembers original pre render node values. This allows style nodes after component factory was called and still use local invalidate.

One more work on cfg improvements. `extendCfg` could be called multiple times.

## 7.7.0

New feature to allow request images with credentials instead of anonymous context (`setImagesWithCredentials`).

## 7.6.6

Fixed propagation of cfg during update. Now it behaves how was described in comment.

## 7.6.5

Massively simplified jsx.d.ts. It now works again :-)

## 7.6.4

Bobril.style: Autofix naming of class names to never have digit as first character because it is not valid.

## 7.6.3

Fix recreating input without component (bug introduced in 7.6.1).

## 7.6.2

Allow # and ? in router params.

## 7.6.1

Major bug fixed in updating VDom node when node with component is changed do simple node, component was not destroyed.

## 7.6.0

Prettier applied on source code.

## 7.5.0

Added 2 convenience functions withRef and extendCfg.

## 7.4.0

Made withKey function more generic now it accepts IBobrilChildren and not just IBobrilNode.

## 7.3.3

Small speed up by removing obsolete fallback for textContent on IE8.

## 7.3.2

Allow route handler be undefined, just fix of strict TS 2.4.1 checks, as it had workaround before.

## 7.3.1

Fix compilation in TS 2.4.1 when using ICtxClass.

## 7.3.0

Images for sprites are loaded in Anonymous crossOrigin so with CORS they can be used sandboxed iframe. It also means that this image needs to be available without cookies/session.

## 7.2.0

New feature to stop user clicking spree when wanted. Automatically on route change. Think of something on single click changing route so fast that user double click is already handled by new route.

## 7.1.2

Fixed crash when combining Bobril with Angular and drag and drop and Angular input loosing focus.

## 7.1.0

Loosened type definition for setDragNodeView to allow any IBobrilChildren as Dnd view.

## 7.0.0

BobrilCtx is now generic and also Bobril pass data and me to its constructor. Added reallyBeforeFrame callback where you can invalidate still same frame.

## 6.3.3

Removed useless warning message about change of "ref" in updateNode. It actually just made confusion than any help.

## 6.3.2

Fixed rare crash with input element without component.

## 6.3.1

Fix TSX definitions.

## 6.3.0

Added way to skip render by setting tag to "-". Changed behavior of RenderPhases for easier Bobx integration.

## 6.2.1

Fix for some platforms broken PointerEvents, so Touch events has now higher priority.

## 6.2.0

Fix for Bobx. And some possible API for future. deferSyncUpdate function for merging syncUpdates during events.

## 6.1.0

Add way to specify ctx as class for component.

## 6.0.2

Fixed rare regression with router clearing page in back action.

## 6.0.1

Fixed regression with rootRoutes.

## 6.0.0

Breaking change is that it requires TypeScript 2.2. Improvements for BobX. Fixed spelling where possible without breaking compatibility.

## 5.5.0

Fixed missing null | undefined option in IBobrilStyle

## 5.4.0

Secret project needs to know what is currently rendering. Call custom method before each render.

## 5.3.1

Another fix of phantom clicks at 0,0 now for Edge with checkbox.
Also fixed sole number in children rare case.

## 5.3.0

White list "overflowScrolling" style property to be always ok to use even on browsers does not supporting it.

Fix root.c to contain root children again.

## 5.2.1

Fixed regresion with removingRoots during frame render.

## 5.2.0

Changing behaviour click and dblclick event are now listened in capturing stage, so Bobril could react to them before Nonbobril code.

## 5.1.0

## New features

New function `updateRoot` to force rendering of some root and optinally update its factory. `addRoot` does not wait for next frame anymore, but shows it in same frame. Root factory also gets its `IBobrilRoot` as first parameter.

## 5.0.4

## Fixes

Another attempt to fix similar case as in 5.0.3

## 5.0.3

## Fixes

Don't fix target node for nested events generated by JS (like triggering browse for file dialog in input).

## 5.0.2

## Fixes

Fix pointer events for IE10 (Correctly detect pointer type and use correct position system).

## 5.0.1

## Fixes

Better workaround for IE onClick pointerEvents none. Fix TS 2.1 compilation errors.

## 5.0.0

## BREAKING CHANGE

Method `convertPointFromPageToNode` was renamed to `convertPointFromClientToNode` - it did correct transformation but it was needed to correct by window scroll. Now you need just pass x,y from mouse event (which always where in Client coordinates) and it will be converted correctly in all cases.
This method was used rarely and even in example it was used wrongly. So I don't expect breaking existing apps, or complex fixing.

## 4.49.2

## Fixes

Workaround for IE10 pointer events not triggering over body/html without focus.

## 4.49.1

## Fixes

IE9/10 onClick pointerEvents:none emulation fixed.

## 4.49.0

## New feature

In debug check for wrong url in b.sprite (probably double called).

## 4.48.3

## Fixes

`setBeforeInit` and `styleDef` didn't play nicely together.

## 4.48.2

## Fixes

`b.prop` style value does not work for checkbox.

## 4.48.1

## Fixes

In Chrome refocusing same element from different application didn't triggered onFocus event.

## 4.48.0

## New features

Support for `foreignObject` in svg.

## 4.47.0

## New features

Exported new type `IComponentFactory<TData>` which is returned by `createComponent`.

## 4.46.1

## Fixes

Provide types definition in package.json

## 4.46.0

## New features

Converted to be completely TS 2.0 safe with all safety features enabled.

## Fixes

Allow to call b.select without onSelectionChange defined

## 4.45.0

## New features

`b.anchor` to add scroll position to route. `b.propim` for prop with reference check for change and optional local invalidate.
Both dedicated by Keeema.

## 4.44.1

## Fixed

Make it again correctly strict. Old PhantomJs tests pass again.

## 4.44.0

## New features

Exported setBeforeInit to window.b so bobril-g11n could be dynamically linked to Bobril. This allows to reuse bobril-g11n also in bobril native.

## 4.43.0

## Removed features

Due to regressions `onMultiClick` event was removed you get called with `onClick` again, but you can still check `count` property, so feature is still there.

## Tooling changed

Compiled with TS 2.0

## 4.42.0

## New features

`onMultiClick` event to detect more than double clicks, new count property contains how many times

`convertPointFromPageToNode` new method to convert global to local position which supports any 3D transformations.

## 4.41.2

## Fixed

Dynamically created image has now backgroundPosition zero.

## 4.41.1

## Fixed

"InnerHTML" tag didn't removed old content on change when it was not last in parent.

## 4.41.0

## New Features

Exported isArray = Array.isArray

## Fixed

Background position for sprite is set every time, so it cannot be wrongly inherited.

## 4.40.0

## New Features

New component function `postUpdateDomEverytime` which if exists is called in every frame regardless shouldUpdate or local invalidate.
When both function `postUpdateDom` and `postUpdateDomEverytime` exists then they are called in this order. In all cases from children to parent order (nothing changed).
Use case for this function could be updating layout even-though parent prevented child update with returning `false` from `shouldUpdate`.
