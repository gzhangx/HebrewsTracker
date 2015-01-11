'use strict';


angular.module('core').controller('HomeController', ['$scope', 'datashare',
	function($scope, datashare) {
        $scope.dailyReads = datashare;
        $scope.$watch('dailyReads', function(newVal){
            var rbd = $scope.dailyReads.readersByDate;
            $scope.chartObject.data.rows =[];
            for (var i =0 ;i < rbd.length; i++) {
                var dat = rbd[i];
                $scope.chartObject.data.rows.push({ c:[{ v: dat.date  }, {v: dat.vcount }, {v: dat.pcount }]});
            }
        }, true);

        $scope.chartObject = {};

        $scope.chartObject.data = {'cols': [
            {id: 't', label: '日期', type: 'date'},
            {id: 's', label: '经节数', type: 'number'},
            {id: 's', label: '人数', type: 'number'}
        ], 'rows': [
            {c: [
                {v: new Date()},
                {v: 0}
            ]}
        ]};


        // $routeParams.chartType == BarChart or PieChart or ColumnChart...
        $scope.chartObject.type = 'LineChart';
        $scope.chartObject.options = {
            'title': '每日读者'
        };

    }
]);