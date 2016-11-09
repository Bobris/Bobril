module DynamicDataTableApp {

    export enum SortOrder {
        ASC,
        DESC
    }

    export class SortModel {

        constructor(public sortByIndex: number, public sortOrder: SortOrder) {

        }
    }

    export class DynamicDatatableModel {
        paginatorModel: PaginatorModel;
        sortModel: SortModel;

        constructor(public tableHeader: Array<string>, public tableContent: Array<any>, public numberOfRecordsPerPage: number) {
            var countOfRecords = tableContent.length;
            this.paginatorModel = new PaginatorModel(numberOfRecordsPerPage, countOfRecords);
        }

        sortTableByColumn(columnIndex: number, sortOrder: SortOrder) {
            //go to first page when sorting
            this.paginatorModel.goToFirstPage();
            this.sortModel = new SortModel(columnIndex, sortOrder);
            //now sort table data by this!!
            if (sortOrder == SortOrder.ASC) {
                this.sortTableContentAsc(columnIndex);
            } else {
                this.sortTableContentDesc(columnIndex);
            }
        }

        private sortTableContentAsc(columnIndex: number) {
            this.tableContent.sort((a, b) => {
                if (a[columnIndex] == b[columnIndex]) {
                    return 0;
                }
                else {
                    return (a[columnIndex] < b[columnIndex]) ? -1 : 1;
                }
            });
        }

        private sortTableContentDesc(columnIndex: number) {
            this.tableContent.sort((a, b) => {
                if (a[columnIndex] == b[columnIndex]) {
                    return 0;
                }
                else {
                    return (a[columnIndex] > b[columnIndex]) ? -1 : 1;
                }
            });
        }

    }

    class PaginatorModel {
        private _currentPage: number;

        constructor(public numberOfRecordsPerPage: number, public countOfRecords: number) {
            this._currentPage = 1;
        }

        get currentPage(): number {
            return this._currentPage;
        }

        set currentPage(currentPage: number) {
            this._currentPage = currentPage;
        }


        goToPrevious() {
            if (this._currentPage > 1) {
                this._currentPage--;
            }
        }

        goToNextPage() {
            var lastPage = this.getLastPage();
            if (this._currentPage < lastPage) {
                this._currentPage++;
            }
        }

        goToFirstPage() {
            this._currentPage = 1;
        }

        goToLastPage() {
            this._currentPage = this.getLastPage();
        }

        getLastPage(): number {
            return Math.ceil(this.countOfRecords / this.numberOfRecordsPerPage);
        }
    }
}
