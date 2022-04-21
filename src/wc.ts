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
    slot?: string;
    style?: IBobrilStyles;
    children?: IBobrilChildren;
}

interface WebComponentCtx<TData extends IWebComponentData> extends IBobrilCtx<TData> {
    evMap?: Map<string, EventListenerObject>;
}

export function wrapWebComponent<TData extends IWebComponentData>(
    name: string,
    props: string[] = [],
    events?: { [name: string]: string }
): (data?: TData) => IBobrilNode {
    props = ["id", "slot", ...props];
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
    if (events != undefined) {
        const eventProps = Object.keys(events);
        component.init = (ctx: WebComponentCtx<TData>) => {
            ctx.evMap = undefined;
        };
        component.postInitDom = component.postUpdateDom = (ctx: WebComponentCtx<TData>) => {
            let d = ctx.data;
            for (const n of eventProps) {
                let e = (d as any)[n];
                if (e == undefined) continue;
                let es = ctx.evMap;
                if (es == undefined) {
                    es = new Map();
                    ctx.evMap = es;
                }
                let en = events[n] as string;
                if (!es.has(en)) {
                    let el = {
                        handleEvent(event: Event) {
                            e(event);
                        },
                    };
                    (ctx.me.element as HTMLElement).addEventListener(en, el);
                    es.set(en, el);
                }
            }
        };
        component.destroy = (ctx: WebComponentCtx<TData>) => {
            let es = ctx.evMap;
            if (es != undefined) {
                es.forEach(function (this: HTMLElement, value: EventListenerObject, key: string) {
                    this.removeEventListener(key, value);
                }, ctx.me.element as HTMLElement);
            }
        };
    }

    return (data?: TData): IBobrilNode => ({
        data: data ?? {},
        component,
    });
}
