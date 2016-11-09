interface IBobrilStatic {
	withKey?(node: IBobrilNode, key: string): IBobrilNode;
    styledDiv?(children: IBobrilChildren, ...styles: any[]): IBobrilNode;
	createVirtualComponent?<TData>(component: IBobrilComponent): (data: TData, children?: IBobrilChildren) => IBobrilNode;
	createComponent?<TData>(component: IBobrilComponent): (data: TData, children?: IBobrilChildren) => IBobrilNode;
	createDerivedComponent?<TData>(original: (data: any, children?: IBobrilChildren) => IBobrilNode, after: IBobrilComponent): (data: TData, children?: IBobrilChildren) => IBobrilNode;
    createOverridingComponent?<TData>(original: (data?: any, children?: IBobrilChildren) => IBobrilNode, after: IBobrilComponent): (data?: TData, children?: IBobrilChildren) => IBobrilNode;
}
