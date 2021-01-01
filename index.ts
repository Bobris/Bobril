import "./src/ie11";
export * from "./src/isFunc";
export * from "./src/asap";
export * from "./src/cssTypes";
export * from "./src/core";
export * from "./src/router";
export * from "./src/dnd";
export * from "./src/mediaQueryBuilder";

import {
    deref,
    getRoots,
    setInvalidate,
    invalidateStyles,
    ignoreShouldChange,
    setAfterFrame,
    setBeforeFrame,
    setBeforeInit,
} from "./src/core";
import { getDnds } from "./src/dnd";

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
