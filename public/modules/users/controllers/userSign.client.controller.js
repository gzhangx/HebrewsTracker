'use strict';

angular.module('users').controller('UserSignController', ['$scope', 'Authentication','VersesDirect','Verses',
	function($scope, Authentication, VersesDirect,Verses) {
		$scope.authentication = Authentication;

        $scope.email = null;
        $scope.selectedUserId = null;
        $scope.recordedHash = {};
        $scope.curSchedule = [];
        $scope.scheduleStarts = [];
        $scope.scheduleStartSel ={};
        $scope.allStats = [];

        function setScope(err) {
            $scope.curSchedule = VersesDirect.curSchedule;
            $scope.allStats = VersesDirect.allStats;
            if (VersesDirect.allStats !== null && VersesDirect.allStats.length > 0) {
                $scope.selectedUserId = VersesDirect.allStats[0].userId;
            }
            $scope.recordedHash = VersesDirect.recordedHash;
            $scope.scheduleStarts = VersesDirect.scheduleStarts;
        }
        VersesDirect.scheduleDctf($scope.authentication.user.email, function(){
            setScope();
            var scheduleStarts = VersesDirect.scheduleStarts;
            $scope.scheduleStarts = scheduleStarts;
            if (scheduleStarts.length > 0) {
                $scope.scheduleStartSel = scheduleStarts[0];
            }
        });

        $scope.scheduleChanged = function() {
            VersesDirect.setSchedule($scope.scheduleStartSel, setScope);
        };
        $scope.RequestSign = function(){
            var sign = new VersesDirect.uReqSign($scope.scheduleStartSel);
            sign.email = this.email;
            sign.$save(function(response) {
                $scope.message = response.message;
            }, function(errorResponse) {
                $scope.error = errorResponse.message;
            });
        };

        $scope.SubmitMultiVerse = function(){

            var titles = [];
            for(var i =0; i< $scope.curSchedule.length;i++) {
                var schLine = $scope.curSchedule[i];
                for (var j =0; j< schLine.length;j++) {
                    var sch = schLine[j];
                    if ($scope.recordedHash[sch] || null !== null)
                    if ($scope.recordedHash[sch][$scope.selectedUserId].setNRead) titles.push(sch);
                }
            }

            console.log(titles.length+' titlefirst=' + (titles.length>0?titles[0]:'null'));
            //var titles = $scope.recordedHash.filter(function(x){return x.checked;}).map(function(x){ return x.title;});

                var verse = new Verses({
                    titles: titles,
                    group: this.group
                });
                verse.$save(function(response) {
                    $location.path('verses/' + response._id);
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });

        };
	}
]);