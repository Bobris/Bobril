/// <reference path="../../../src/bobril.d.ts"/>
/// <reference path="../../../src/bobril.vg.d.ts" />
/// <reference path="../model/cell.ts" />

module GameOfLifeApp{
    export interface ICanvasData{
        lifeCels: Cell[];
        width: number;
        height: number;
    }

    export interface ICanvasCtx{
        data: ICanvasData;

    }

    export class Canvas implements IBobrilComponent{
        static init(ctx: ICanvasCtx){

        }

        static render(ctx: ICanvasCtx, me: IBobrilNode){
            me.tag = 'div';
            me.children = <any>[
                {
                    component : b.vg,
                    data : { width : ctx.data.width, height : ctx.data.height },
                    children : [
                        {
                            data : {
                                path : ["rect", 0, 0, ctx.data.width, ctx.data.height],
                                stroke : 'red'
                            }
                        },
                        ctx.data.lifeCels.map((cell: Cell) =>{
                                return {
                                    data : {
                                        path : [
                                            'rect',
                                            cell.positionX * (4 + 1) + ctx.data.width / 2,
                                            cell.positionY * (4 + 1) + ctx.data.height / 2,
                                            4 - 1,
                                            4 - 1
                                        ],
                                        stroke :
                                            'red',
                                        fill :
                                            'red'
                                    }
                                }
                            }
                        )
                    ]
                }
            ];
        }
    }
}
