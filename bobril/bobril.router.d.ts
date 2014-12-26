interface IBobrilStatic {
    // register root routes, basicaly call this instead of b.init
    // routes is IRoute | Array<IRoute>
    routes?(routes: any): void;
    route? (config: IRouteConfig, nestedRoutes?: Array<IRoute>): IRoute;
    routeDefault?(config: IRouteConfig): IRoute;
    routeNotFound?(config: IRouteConfig): IRoute;
    link?(node:IBobrilNode, name: string, params?: Params): IBobrilNode;
}

interface Params {
    [name: string]: string
}

// Just marker interface
interface IRoute {
}

interface IRouteConfig {
    name?: string;
    url?: string;
    data?: Object;
    handler: IBobrilComponent;
}
