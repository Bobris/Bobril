interface PromiseImpl {
	new <T>(resolver: (resolvePromise: (value: T) => void, rejectPromise: (reason: any) => void) => void): Thenable<T>;
    all<T>(values: any[]): Thenable<T[]>;
    all<T>(...values: any[]): Thenable<T[]>;
    resolve<T>(value: any): Thenable<T>;
    reject(reason: any): Thenable<any>;
    race<T>(values: Thenable<T>[]): Thenable<T>;
}

interface Thenable<R> {
	then<U>(onFulfill: (value: R) => Thenable<U>, onReject: (error: any) => Thenable<U>): Thenable<U>;
	then<U>(onFulfill: (value: R) => Thenable<U>, onReject?: (error: any) => U): Thenable<U>;
	then<U>(onFulfill: (value: R) => U, onReject: (error: any) => Thenable<U>): Thenable<U>;
    then<U>(onFulfill?: (value: R) => U, onReject?: (error: any) => U): Thenable<U>;
}

interface IBobrilStatic {
    // run fn async faster than setImmediate or setTimer(fn,0)
    asap?: (fn: () => void) => void;
    // Mostly Promise A+ compatible (only exception is that 'then' does not ignore non functions parameters)
    Promise?: PromiseImpl;
}
