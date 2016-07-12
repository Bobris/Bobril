CHANGELOG
===

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
