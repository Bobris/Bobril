/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="model.ts"/>

module DynamicDataTableApp {

    function h(tag: string, ...args: any[]): IBobrilNode {
        return { tag: tag, children: args };
    }

    function hs(tag: string, style: any, ...args: any[]): IBobrilNode {
        return { tag: tag, style: style, children: args };
    }

    function hc(tag: string, className: any, ...args: any[]): IBobrilNode {
        return { tag: tag, className: className, children: args }
    }

    interface IAppData {
        tableModel: DynamicDatatableModel;
    }

    interface IAppCtx {
        data: IAppData;
    }

    export var App: IBobrilComponent = {
        render(ctx: IAppCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.tag = "div"
            me.children = [
                {
                    component: DynamicDataTable,
                    data: { tableModel: ctx.data.tableModel }
                },
                hc("div", "paginatorContainer",
                    {
                        component: Paginator,
                        data: {
                            currentPage: ctx.data.tableModel.paginatorModel.currentPage,
                            numberOfRecordsPerPage: ctx.data.tableModel.paginatorModel.numberOfRecordsPerPage,
                            countOfRecords: ctx.data.tableModel.paginatorModel.countOfRecords,
                            onPageChange(pageNumber: number) {
                                ctx.data.tableModel.paginatorModel.currentPage = pageNumber;
                            },
                            goToPreviousPage() {
                                ctx.data.tableModel.paginatorModel.goToPrevious();
                            },
                            goToNextPage() {
                                ctx.data.tableModel.paginatorModel.goToNextPage();
                            },
                            goToFirstPage() {
                                ctx.data.tableModel.paginatorModel.goToFirstPage();
                            },
                            goToLastPage() {
                                ctx.data.tableModel.paginatorModel.goToLastPage();
                            }
                        }
                    }),
            ]
        }
    }

    interface IDynamicDataTableData {
        tableModel: DynamicDatatableModel;
    }

    interface IDynamicDataTableCtx {
        data: IDynamicDataTableData;
    }

    var DynamicDataTable: IBobrilComponent = {

        render(ctx: IDynamicDataTableCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.tag = "table";
            me.children = [
                {
                    component: TableHeader,
                    data: {
                        header: ctx.data.tableModel.tableHeader,
                        sortInformation: ctx.data.tableModel.sortModel,
                        sort(columnIndex: number, sortOrder: SortOrder) {
                            ctx.data.tableModel.sortTableByColumn(columnIndex, sortOrder);
                        }
                    }
                },
                {
                    component: TableBody,
                    data: {
                        tableBody: ctx.data.tableModel.tableContent,
                        currentPage: ctx.data.tableModel.paginatorModel.currentPage,
                        numberOfRecordsPerPage: ctx.data.tableModel.paginatorModel.numberOfRecordsPerPage
                    }
                }
            ];

        }
    }

    interface ITableHeaderData {
        header: Array<string>;
        sort: (columnIndex: number, sortOrder: SortOrder) => void;
        sortInformation?: SortModel;
    }

    interface ITableHeaderCtx {
        data: ITableHeaderData;
    }

    function createHeader(ctx: ITableHeaderCtx): IBobrilNode[] {
        var headerNodes: Array<IBobrilNode> = [];
        for (var i = 0; i < ctx.data.header.length; i++) {
            var headerColumn = {
                component: TableHeaderColumn,
                data: {
                    columnName: ctx.data.header[i],
                    columnIndex: i,
                    sort(columnIndex: number, sortOrder: SortOrder) {
                        ctx.data.sort(columnIndex, sortOrder);
                    },
                    sortInformation: ctx.data.sortInformation
                }
            };
            headerNodes.push(headerColumn);
        }
        return headerNodes;
    }

    var TableHeader: IBobrilComponent = {
        render(ctx: ITableHeaderCtx, me: IBobrilNode): void {
            me.tag = "thead";
            me.children = h("tr", createHeader(ctx));
        }
    }

    interface ITableHeaderColumnData {
        columnName: string;
        columnIndex: number;
        sort: (columnIndex: number, sortOrder: SortOrder) => void;
        sortInformation?: SortModel;
    }

    interface ITableHeaderColumnCtx {
        data: ITableHeaderColumnData;
    }

    var TableHeaderColumn: IBobrilComponent = {
        render(ctx: ITableHeaderColumnCtx, me: IBobrilNode): void {
            me.tag = "th";
            if (ctx.data.sortInformation && ctx.data.sortInformation.sortByIndex == ctx.data.columnIndex) {
                if (ctx.data.sortInformation.sortOrder == SortOrder.ASC) {
                    me.children = [hc("div", "arrow-up"), ctx.data.columnName];
                } else {
                    me.children = [hc("div", "arrow-down"), ctx.data.columnName];
                }
            } else {
                me.children = ctx.data.columnName;
            }
        },

        onClick(ctx: ITableHeaderColumnCtx, event: IBobrilMouseEvent): boolean {
            if (ctx.data.sortInformation && ctx.data.sortInformation.sortByIndex == ctx.data.columnIndex) {
                if (ctx.data.sortInformation.sortOrder == SortOrder.ASC) {
                    ctx.data.sort(ctx.data.columnIndex, SortOrder.DESC);
                } else {
                    ctx.data.sort(ctx.data.columnIndex, SortOrder.ASC);
                }
            } else {
                ctx.data.sort(ctx.data.columnIndex, SortOrder.ASC);
            }
            b.invalidate();
            return true;
        }
    }


    interface ITableBodyData {
        tableBody: Array<any>;
        currentPage: number;
        numberOfRecordsPerPage: number;
    }

    interface ITableBodyCtx {
        data: ITableBodyData;
    }

    function getRecordsForCurrentPage(tableRows: Array<Object>, currentPage: number, numberOfRecordsPerPage: number): Array<any> {
        var displayedRecords: Array<any> = [];
        var startIndex = ((currentPage - 1) * numberOfRecordsPerPage);
        var stopIndex = startIndex + numberOfRecordsPerPage;
        for (var i = startIndex; i < stopIndex; i++) {
            if (i >= tableRows.length) {
                break;
            }
            displayedRecords.push(tableRows[i]);
        }
        return displayedRecords;
    }

    function generateTableRows(tableRows: Array<any[]>): IBobrilNode[] {
        var bodyNodes: Array<IBobrilNode> = [];
        for (var i = 0; i < tableRows.length; i++) {
            var rowNode = h("tr", generateTableRow(tableRows[i]))
            bodyNodes.push(rowNode);
        }
        return bodyNodes;
    }

    function generateTableRow(tableRow: Array<any>): IBobrilNode[] {
        var columnNodes: Array<IBobrilNode> = [];
        for (var i = 0; i < tableRow.length; i++) {
            columnNodes.push(h("td", tableRow[i]));
        }
        return columnNodes;
    }

    var TableBody: IBobrilComponent = {
        render(ctx: ITableBodyCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.tag = "tbody";
            var currentlyDisplayedRecords = getRecordsForCurrentPage(ctx.data.tableBody, ctx.data.currentPage, ctx.data.numberOfRecordsPerPage);
            me.children = generateTableRows(currentlyDisplayedRecords);
        }
    }


    interface IPaginatorData {
        currentPage: number;
        numberOfRecordsPerPage: number;
        countOfRecords: number;
        onPageChange: (pageNumber: number) => void;
        goToPreviousPage: () => void;
        goToNextPage: () => void;
        goToFirstPage: () => void;
        goToLastPage: () => void;
    }

    interface IPaginatorCtx {
        data: IPaginatorData;
    }

    function generatePages(ctx: IPaginatorCtx): IBobrilNode[] {
        var pages: Array<IBobrilNode> = [];
        pages.push({
            component: PaginatorButton, data: {
                onClickHandler() {
                    ctx.data.goToFirstPage();
                },
                text: "<<"
            }
        });
        pages.push({
            component: PaginatorButton, data: {
                onClickHandler() {
                    ctx.data.goToPreviousPage();
                },
                text: "<"
            }
        });
        var countOfPages = Math.ceil(ctx.data.countOfRecords / ctx.data.numberOfRecordsPerPage);
        for (var i = 1; i <= countOfPages; i++) {
            pages.push({
                component: PaginatorButton, data: {
                    pageNumber: i,
                    text: i.toString(),
                    currentPage: ctx.data.currentPage,
                    onPageClickHandler(pageNumber: number) {
                        ctx.data.onPageChange(pageNumber);
                    }
                }
            });
        }
        pages.push({
            component: PaginatorButton, data: {
                onClickHandler() {
                    ctx.data.goToNextPage();
                },
                className: "btn",
                text: ">"
            }
        });
        pages.push({
            component: PaginatorButton, data: {
                onClickHandler() {
                    ctx.data.goToLastPage();
                },
                className: "btn",
                text: ">>"
            }
        });
        return pages;
    }

    var Paginator: IBobrilComponent = {
        render(ctx: IPaginatorCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.tag = "ul";
            me.className = "pagination";
            me.children = generatePages(ctx);
        }
    }

    interface IPaginatorButtonData {
        text: string;
        pageNumber?: number;
        currentPage?: number;
        onClickHandler?: () => void;
        onPageClickHandler?: (pageNumber: number) => void;
    }

    interface IPaginatorButtonCtx {
        data: IPaginatorButtonData;
    }

    var PaginatorButton: IBobrilComponent = {

        render(ctx: IPaginatorButtonCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.tag = "li";
            if (ctx.data.pageNumber && (ctx.data.pageNumber == ctx.data.currentPage)) {
                me.children = hc("a", "active", ctx.data.text);
            } else {
                me.children = h("a", ctx.data.text);
            }
        },

        onClick(ctx: IPaginatorButtonCtx, event: IBobrilMouseEvent): boolean {
            if (ctx.data.pageNumber) {
                ctx.data.onPageClickHandler(ctx.data.pageNumber);
            } else {
                ctx.data.onClickHandler();
            }
            b.invalidate();
            return true;
        }

    }
}
