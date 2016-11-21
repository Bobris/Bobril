CHANGELOG
===

5.0.0
--

BREAKING CHANGE
--

Method `convertPointFromPageToNode` was renamed to `convertPointFromClientToNode` - it did correct transformation but it was needed to correct by window scroll. Now you need just pass x,y from mouse event (which always where in Client coordinates) and it will be converted correctly in all cases.
This method was used rarely and even in example it was used wrongly. So I don't expect breaking existing apps, or complex fixing.

4.49.2
--

Fixes
-

Workaround for IE10 pointer events not triggeing over body/html without focus.

4.49.1
--

Fixes
-

IE9/10 onClick pointerEvents:none emulation fixed.
 
4.49.0
--

New feature
-

In debug check for wrong url in b.sprite (probably double called).

4.48.3
--

Fixes
-

`setBeforeInit` and `styleDef` didn't play nicely together.

4.48.2
--

Fixes
-

`b.prop` style value does not work for checkbox.

4.48.1
--

Fixes
-

In Chrome refocusing same element from different application didn't triggered onFocus event.

4.48.0
--

New features
--

Support for `foreignObject` in svg.

4.47.0
--

New features
-

Exported new type `IComponentFactory<TData>` which is returned by `createComponent`.

4.46.1
--

Fixes
-

Provide types definition in package.json

4.46.0
--

New features
-

Converted to be completely TS 2.0 safe with all safety features enabled.

Fixes
-

Allow to call b.select without onSelectionChange defined

4.45.0
--

New features
-

`b.anchor` to add scroll position to route. `b.propim` for prop with reference check for change and optional local invalidate.
Both dedicated by Keeema.

4.44.1
--

Fixed
-

Make it again correctly strict. Old PhantomJs tests pass again.

4.44.0
--

New features
-

Exported setBeforeInit to window.b so bobril-g11n could be dynamicaly linked to Bobril. This allows to reuse bobril-g11n also in bobril native.

4.43.0
--

Removed features
-

Due to regressions `onMultiClick` event was removed you get called with `onClick` again, but you can still check `count` property, so feature is still there.

Tooling changed
-

Compiled with TS 2.0

4.42.0
--

New features
-

`onMultiClick` event to detect more than double clicks, new count property contains how many times

`convertPointFromPageToNode` new method to convert global to local position which supports any 3D transformations. 

4.41.2
--

Fixed
-

Dynamicaly created image has now backgroundPosition zero.

4.41.1
--

Fixed
-

"InnerHTML" tag didn't removed old content on change when it was not last in parent.

4.41.0
--

New Features
-

Exported isArray = Array.isArray

Fixed
-

Background position for sprite is set every time, so it cannot be wrongly inherited.


4.40.0
--

New Features
-

New component function `postUpdateDomEverytime` which if exists is called in every frame regardles shouldUpdate or local invalidate.
When both function `postUpdateDom` and `postUpdateDomEverytime` exists then they are called in this order. In all cases from children to parent order (nothing changed).
Usecase for this function could be updating layout even-though parent prevented child update with returning `false` from `shouldUpdate`.
