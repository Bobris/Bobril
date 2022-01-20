import {
    IBubblingAndBroadcastEvents,
    IBobrilStyles,
    IBobrilChildren,
    IBobrilNode,
    IBobrilCtx,
    IBobrilComponent,
    GenericEventResult,
} from "./core";
import { isFunction } from "./isFunc";
import { style } from "./cssInJs";

export interface IWebComponentData extends IBubblingAndBroadcastEvents {
    id?: string;
    style?: IBobrilStyles;
    children?: IBobrilChildren;
}

export function wrapWebComponent<TData extends IWebComponentData>(
    name: string,
    props: string[] = [],
    _events?: { [name: string]: string }
): (data?: TData) => IBobrilNode {
    props = ["id", ...props];
    const component = {
        id: name,
        render(ctx: IBobrilCtx<TData>, me: IBobrilNode) {
            let d = ctx.data;
            me.tag = name;
            let attrs = {} as any;
            for (const n of props) {
                attrs[n] = (d as any)[n];
            }
            me.attrs = attrs;
            me.children = d.children;
            if (d.style != undefined) style(me, d.style);
        },
        handleGenericEvent(ctx: IBobrilCtx<TData>, name: string, param: Object): GenericEventResult {
            let handler = (ctx.data as any)[name];
            if (isFunction(handler)) {
                return handler(param);
            }
        },
    } as IBobrilComponent<TData, IBobrilCtx<TData>>;

    return (data?: TData): IBobrilNode => ({
        data: data ?? {},
        component,
    });
}
