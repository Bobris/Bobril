interface IBobrilStatic {
    // run fn async faster than setImmediate or setTimer(fn,0)
    asap?: (fn: () => void) => void;
}
