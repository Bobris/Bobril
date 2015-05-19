/// <reference path="bobril.promise.d.ts"/>

﻿interface IBobrilStatic {
    // register root routes, basicaly call this instead of b.init
    routes?(routes: IRoute|IRoute[]): void;
    route?(config: IRouteConfig, nestedRoutes?: Array<IRoute>): IRoute;
    routeDefault?(config: IRouteConfig): IRoute;
    routeNotFound?(config: IRouteConfig): IRoute;
    isRouteActive?(name: string, params?: Params): boolean;
    urlOfRoute?(name: string, params?: Params): string;
    createRedirectReplace?(name: string, params?: Params): IRouteTransition;
    createRedirectPush?(name: string, params?: Params): IRouteTransition;
    createBackTransition?(): IRouteTransition;
    runTransition?(transition: IRouteTransition): void;
    link?(node: IBobrilNode, name: string, params?: Params): IBobrilNode;
}

interface Params {
    [name: string]: string
}

// Just marker interface
interface IRoute {
}

declare const enum RouteTransitionType {
    Push,
    Replace,
    Pop
}

interface IRouteTransition {
    inApp: boolean;
    type: RouteTransitionType;
    name: string;
    params: Params;
}

declare type IRouteCanResult = boolean | Thenable<boolean> | IRouteTransition | Thenable<IRouteTransition>;

interface IBobrilComponent {
    canActivate?: (transition: IRouteTransition) => IRouteCanResult;
    canDeactivate?: (ctx: IBobrilCtx, transition: IRouteTransition) => IRouteCanResult;
}

declare type IRouteHandler = IBobrilComponent | ((data: any) => IBobrilNode);

interface IRouteConfig {
    // name cannot contain ":" or "/"
    name?: string;
    url?: string;
    data?: Object;
    handler: IRouteHandler;
    keyBuilder?: (params: Params) => string;
}
