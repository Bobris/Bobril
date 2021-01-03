import "./src/ie11";
export * from "./src/isFunc";
export * from "./src/asap";
export * from "./src/cssTypes";
export * from "./src/frameCallbacks";
export * from "./src/core";
export * from "./src/router";
export * from "./src/dnd";
export * from "./src/mediaQueryBuilder";
export * from "./src/svgExtensions";
export * from "./src/cssInJs";

import { setAfterFrame, setBeforeFrame } from "./src/frameCallbacks";
import { deref, getRoots, setInvalidate, ignoreShouldChange, setBeforeInit } from "./src/core";
import { getDnds } from "./src/dnd";
import { invalidateStyles } from "./src/cssInJs";

// bobril-clouseau needs this
// bobril-g11n needs ignoreShouldChange and setBeforeInit
if (!(<any>window).b)
    (<any>window).b = {
        deref,
        getRoots,
        setInvalidate,
        invalidateStyles,
        ignoreShouldChange,
        setAfterFrame,
        setBeforeFrame,
        getDnds,
        setBeforeInit,
    };
