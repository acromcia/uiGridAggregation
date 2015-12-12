var app = angular.module('app', ['ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.grouping', 'ui.grid.edit', 'ui.grid.selection']);

app.controller('MainCtrl', ['$scope', '$http', '$interval', 'uiGridGroupingConstants', function ($scope, $http, $interval, uiGridGroupingConstants) {
    $scope.debug = function () {
        console.error($scope);
    };

    $scope.getUniqueValues = function (rows, col) {
        var uniqueMap = [];
        rows.map(function (row) {
            var value = row.entity[col.field];
            if (row.visible && uniqueMap.indexOf(value) === -1) {
                uniqueMap.push(value);
            }
        });
        return uniqueMap;
    };

    $scope.gridOptions = {
        enableFiltering: true,
        enableGroupHeaderSelection: false,
        treeRowHeaderAlwaysVisible: false,
        showColumnFooter: false,
        treeCustomAggregations: {},
        columnDefs: [
            {name: 'name', width: '15%'},
            {field: 'age', width: '45%', treeAggregationType: 'count', type: 'number'}
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;

            //$scope.gridApi.grouping.on.aggregationChanged($scope, function (col) {
            //    if (col.treeAggregation.type) {
            //        $scope.lastChange = col.displayName + ' aggregated using ' + col.treeAggregation.type;
            //    } else {
            //        $scope.lastChange = 'Aggregation removed from ' + col.displayName;
            //    }
            //    console.log($scope.lastChange);
            //});

            // vendor bug that removes aggregation on ungrouping columns
            $scope.gridApi.core.on.rowsVisibleChanged($scope, function () {
                console.log('rowsVisibleChanged');
            });

            $scope.gridApi.core.on.rowsRendered($scope, function () {
                console.log('rowsRendered');
                // filter unique
                //$scope.gridApi.grid.columns.map(function (col) {
                //    if (!col.isRowHeader) {
                //        console.log($scope.getUniqueValues(col.grid.rows, col), col.displayName);
                //    }
                //});
            });

            $scope.gridApi.grouping.on.groupingChanged($scope, function (col) {
                if (typeof col.treeAggregation === 'undefined'
                    && ( col.colDef.type === 'number'
                    || col.colDef.type === 'numberStr'
                    || col.colDef.type === 'date')) {
                    $scope.gridApi.grouping.aggregateColumn(col.field, col.colDef.treeAggregationType);
                }

                if (col.grouping.groupPriority >= 0) {
                    $scope.lastChange = col.displayName + ' grouped with priority ' + col.grouping.groupPriority;
                } else {
                    $scope.lastChange = col.displayName + ' removed from grouped columns';
                }
                console.log($scope.lastChange);
            });
        }
    };

    $http.get('https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/10000_complex.json')
        .success(function (data) {
            $scope.gridOptions.data = data;
        });

    $scope.output = function () {
        //var str   = 'total: 1234';
        //var str = '1234 (1)';
        var str = $scope.input || '';

        var aggregationRE = /(.*: )(.*)/;
        var countRE = /(.*)( \(.*\))/;

        if (str.match(aggregationRE)) {
            return str.replace(aggregationRE, function (input, label, num) {
                return label + num.toFixed();
            });
        } else if (str.match(countRE)) {
            return str.replace(countRE, function (input, num, occurences) {
                return num.toFixed() + occurences;
            });
        }
        return null;
    }
}]);