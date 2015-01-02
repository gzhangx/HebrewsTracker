'use strict';

angular.module('verses').controller('VersesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Verses','VersesDirect',
	function($scope, $stateParams, $location, Authentication, Verses,VersesDirect) {
		$scope.authentication = Authentication;

		$scope.email = $location.search().email;
		$scope.title = $location.search().title;
        $scope.group = $location.search().group;
		$scope.create = function() {
			var verse = new Verses({
				title: this.title,
				group: this.group
			});
			verse.$save(function(response) {
				$location.path('verses/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

        $scope.createDirect = function() {
            var verse = new VersesDirect({
                title: this.title,
                email: this.email,
                group: this.group
            });
            verse.$save(function(response) {
                $location.path('verses/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

		$scope.remove = function(verse) {
			if (verse) {
				verse.$remove();

				for (var i in $scope.verses) {
					if ($scope.verses[i] === verse) {
						$scope.verses.splice(i, 1);
					}
				}
			} else {
				$scope.verses.$remove(function() {
					$location.path('verses');
				});
			}
		};

		$scope.update = function() {
			var verse = $scope.verse;

			verse.$update(function() {
				$location.path('verses/' + verse._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.verses = Verses.query();
		};

		$scope.findOne = function() {
			$scope.verse = Verses.get({
				verseId: $stateParams.verseId
			});
		};
	}
]);