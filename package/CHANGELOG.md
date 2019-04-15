# CHANGELOG

## 9.9.1

Fix ref callback

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
