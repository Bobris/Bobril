interface Thenable<R> {
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
}

declare class Promise<R> implements Thenable<R> {
	constructor(callback: (resolve : (value?: R | Thenable<R>) => void, reject: (error?: any) => void) => void);
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Promise<U>;
	catch<U>(onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
}

declare module Promise {
	function resolve<R>(value?: R | Thenable<R>): Promise<R>;
	function reject(error: any): Promise<any>;
	function all<R>(promises: (R | Thenable<R>)[]): Promise<R[]>;
	function race<R>(promises: (R | Thenable<R>)[]): Promise<R>;
}

interface IBobrilStatic {
    // run fn async faster than setImmediate or setTimer(fn,0)
    asap?: (fn: () => void) => void;
}
