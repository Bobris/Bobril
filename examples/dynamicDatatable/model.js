var DynamicDataTableApp;
(function (DynamicDataTableApp) {
    var SortOrder;
    (function (SortOrder) {
        SortOrder[SortOrder["ASC"] = 0] = "ASC";
        SortOrder[SortOrder["DESC"] = 1] = "DESC";
    })(SortOrder = DynamicDataTableApp.SortOrder || (DynamicDataTableApp.SortOrder = {}));
    var SortModel = (function () {
        function SortModel(sortByIndex, sortOrder) {
            this.sortByIndex = sortByIndex;
            this.sortOrder = sortOrder;
        }
        return SortModel;
    }());
    DynamicDataTableApp.SortModel = SortModel;
    var DynamicDatatableModel = (function () {
        function DynamicDatatableModel(tableHeader, tableContent, numberOfRecordsPerPage) {
            this.tableHeader = tableHeader;
            this.tableContent = tableContent;
            this.numberOfRecordsPerPage = numberOfRecordsPerPage;
            var countOfRecords = tableContent.length;
            this.paginatorModel = new PaginatorModel(numberOfRecordsPerPage, countOfRecords);
        }
        DynamicDatatableModel.prototype.sortTableByColumn = function (columnIndex, sortOrder) {
            //go to first page when sorting
            this.paginatorModel.goToFirstPage();
            this.sortModel = new SortModel(columnIndex, sortOrder);
            //now sort table data by this!!
            if (sortOrder == SortOrder.ASC) {
                this.sortTableContentAsc(columnIndex);
            }
            else {
                this.sortTableContentDesc(columnIndex);
            }
        };
        DynamicDatatableModel.prototype.sortTableContentAsc = function (columnIndex) {
            this.tableContent.sort(function (a, b) {
                if (a[columnIndex] == b[columnIndex]) {
                    return 0;
                }
                else {
                    return (a[columnIndex] < b[columnIndex]) ? -1 : 1;
                }
            });
        };
        DynamicDatatableModel.prototype.sortTableContentDesc = function (columnIndex) {
            this.tableContent.sort(function (a, b) {
                if (a[columnIndex] == b[columnIndex]) {
                    return 0;
                }
                else {
                    return (a[columnIndex] > b[columnIndex]) ? -1 : 1;
                }
            });
        };
        return DynamicDatatableModel;
    }());
    DynamicDataTableApp.DynamicDatatableModel = DynamicDatatableModel;
    var PaginatorModel = (function () {
        function PaginatorModel(numberOfRecordsPerPage, countOfRecords) {
            this.numberOfRecordsPerPage = numberOfRecordsPerPage;
            this.countOfRecords = countOfRecords;
            this._currentPage = 1;
        }
        Object.defineProperty(PaginatorModel.prototype, "currentPage", {
            get: function () {
                return this._currentPage;
            },
            set: function (currentPage) {
                this._currentPage = currentPage;
            },
            enumerable: true,
            configurable: true
        });
        PaginatorModel.prototype.goToPrevious = function () {
            if (this._currentPage > 1) {
                this._currentPage--;
            }
        };
        PaginatorModel.prototype.goToNextPage = function () {
            var lastPage = this.getLastPage();
            if (this._currentPage < lastPage) {
                this._currentPage++;
            }
        };
        PaginatorModel.prototype.goToFirstPage = function () {
            this._currentPage = 1;
        };
        PaginatorModel.prototype.goToLastPage = function () {
            this._currentPage = this.getLastPage();
        };
        PaginatorModel.prototype.getLastPage = function () {
            return Math.ceil(this.countOfRecords / this.numberOfRecordsPerPage);
        };
        return PaginatorModel;
    }());
})(DynamicDataTableApp || (DynamicDataTableApp = {}));
