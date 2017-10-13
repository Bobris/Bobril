import * as b from './index';

declare namespace JSX {
    type Element = b.IBobrilNode;

    interface IntrinsicAttributes {
        key?: string;
        ref?: [b.IBobrilCtx, string] | ((node: b.IBobrilCacheNode) => void);
    }

    interface IntrinsicClassAttributes<T> {
    }

    interface IntrinsicElements {
        [name: string]: any;
    }
}
