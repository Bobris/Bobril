/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="model.ts"/>
var DynamicDataTableApp;
(function (DynamicDataTableApp) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    function hs(tag, style) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return { tag: tag, style: style, children: args };
    }
    function hc(tag, className) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return { tag: tag, className: className, children: args };
    }
    DynamicDataTableApp.App = {
        render: function (ctx, me, oldMe) {
            me.tag = "div";
            me.children = [
                {
                    component: DynamicDataTable,
                    data: { tableModel: ctx.data.tableModel }
                },
                hc("div", "paginatorContainer", {
                    component: Paginator,
                    data: {
                        currentPage: ctx.data.tableModel.paginatorModel.currentPage,
                        numberOfRecordsPerPage: ctx.data.tableModel.paginatorModel.numberOfRecordsPerPage,
                        countOfRecords: ctx.data.tableModel.paginatorModel.countOfRecords,
                        onPageChange: function (pageNumber) {
                            ctx.data.tableModel.paginatorModel.currentPage = pageNumber;
                        },
                        goToPreviousPage: function () {
                            ctx.data.tableModel.paginatorModel.goToPrevious();
                        },
                        goToNextPage: function () {
                            ctx.data.tableModel.paginatorModel.goToNextPage();
                        },
                        goToFirstPage: function () {
                            ctx.data.tableModel.paginatorModel.goToFirstPage();
                        },
                        goToLastPage: function () {
                            ctx.data.tableModel.paginatorModel.goToLastPage();
                        }
                    }
                }),
            ];
        }
    };
    var DynamicDataTable = {
        render: function (ctx, me, oldMe) {
            me.tag = "table";
            me.children = [
                {
                    component: TableHeader,
                    data: {
                        header: ctx.data.tableModel.tableHeader,
                        sortInformation: ctx.data.tableModel.sortModel,
                        sort: function (columnIndex, sortOrder) {
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
    };
    function createHeader(ctx) {
        var headerNodes = [];
        for (var i = 0; i < ctx.data.header.length; i++) {
            var headerColumn = {
                component: TableHeaderColumn,
                data: {
                    columnName: ctx.data.header[i],
                    columnIndex: i,
                    sort: function (columnIndex, sortOrder) {
                        ctx.data.sort(columnIndex, sortOrder);
                    },
                    sortInformation: ctx.data.sortInformation
                }
            };
            headerNodes.push(headerColumn);
        }
        return headerNodes;
    }
    var TableHeader = {
        render: function (ctx, me) {
            me.tag = "thead";
            me.children = h("tr", createHeader(ctx));
        }
    };
    var TableHeaderColumn = {
        render: function (ctx, me) {
            me.tag = "th";
            if (ctx.data.sortInformation && ctx.data.sortInformation.sortByIndex == ctx.data.columnIndex) {
                if (ctx.data.sortInformation.sortOrder == DynamicDataTableApp.SortOrder.ASC) {
                    me.children = [hc("div", "arrow-up"), ctx.data.columnName];
                }
                else {
                    me.children = [hc("div", "arrow-down"), ctx.data.columnName];
                }
            }
            else {
                me.children = ctx.data.columnName;
            }
        },
        onClick: function (ctx, event) {
            if (ctx.data.sortInformation && ctx.data.sortInformation.sortByIndex == ctx.data.columnIndex) {
                if (ctx.data.sortInformation.sortOrder == DynamicDataTableApp.SortOrder.ASC) {
                    ctx.data.sort(ctx.data.columnIndex, DynamicDataTableApp.SortOrder.DESC);
                }
                else {
                    ctx.data.sort(ctx.data.columnIndex, DynamicDataTableApp.SortOrder.ASC);
                }
            }
            else {
                ctx.data.sort(ctx.data.columnIndex, DynamicDataTableApp.SortOrder.ASC);
            }
            b.invalidate();
            return true;
        }
    };
    function getRecordsForCurrentPage(tableRows, currentPage, numberOfRecordsPerPage) {
        var displayedRecords = [];
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
    function generateTableRows(tableRows) {
        var bodyNodes = [];
        for (var i = 0; i < tableRows.length; i++) {
            var rowNode = h("tr", generateTableRow(tableRows[i]));
            bodyNodes.push(rowNode);
        }
        return bodyNodes;
    }
    function generateTableRow(tableRow) {
        var columnNodes = [];
        for (var i = 0; i < tableRow.length; i++) {
            columnNodes.push(h("td", tableRow[i]));
        }
        return columnNodes;
    }
    var TableBody = {
        render: function (ctx, me, oldMe) {
            me.tag = "tbody";
            var currentlyDisplayedRecords = getRecordsForCurrentPage(ctx.data.tableBody, ctx.data.currentPage, ctx.data.numberOfRecordsPerPage);
            me.children = generateTableRows(currentlyDisplayedRecords);
        }
    };
    function generatePages(ctx) {
        var pages = [];
        pages.push({
            component: PaginatorButton, data: {
                onClickHandler: function () {
                    ctx.data.goToFirstPage();
                },
                text: "<<"
            }
        });
        pages.push({
            component: PaginatorButton, data: {
                onClickHandler: function () {
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
                    onPageClickHandler: function (pageNumber) {
                        ctx.data.onPageChange(pageNumber);
                    }
                }
            });
        }
        pages.push({
            component: PaginatorButton, data: {
                onClickHandler: function () {
                    ctx.data.goToNextPage();
                },
                className: "btn",
                text: ">"
            }
        });
        pages.push({
            component: PaginatorButton, data: {
                onClickHandler: function () {
                    ctx.data.goToLastPage();
                },
                className: "btn",
                text: ">>"
            }
        });
        return pages;
    }
    var Paginator = {
        render: function (ctx, me, oldMe) {
            me.tag = "ul";
            me.className = "pagination";
            me.children = generatePages(ctx);
        }
    };
    var PaginatorButton = {
        render: function (ctx, me, oldMe) {
            me.tag = "li";
            if (ctx.data.pageNumber && (ctx.data.pageNumber == ctx.data.currentPage)) {
                me.children = hc("a", "active", ctx.data.text);
            }
            else {
                me.children = h("a", ctx.data.text);
            }
        },
        onClick: function (ctx, event) {
            if (ctx.data.pageNumber) {
                ctx.data.onPageClickHandler(ctx.data.pageNumber);
            }
            else {
                ctx.data.onClickHandler();
            }
            b.invalidate();
            return true;
        }
    };
})(DynamicDataTableApp || (DynamicDataTableApp = {}));
