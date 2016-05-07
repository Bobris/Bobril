CHANGELOG
===

4.40.0
--

New Features
-

New component function `postUpdateDomEverytime` which if exists is called in every frame regardles shouldUpdate or local invalidate.
When both function `postUpdateDom` and `postUpdateDomEverytime` exists then they are called in this order. In all cases from children to parent order (nothing changed).
Usecase for this function could be updating layout even-though parent prevented child update with returning `false` from `shouldUpdate`.
