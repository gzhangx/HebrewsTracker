'use strict';

angular.module('verses').controller('VersesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Verses','VersesDirect',
	function($scope, $stateParams, $location, Authentication, Verses,VersesDirect) {

        function setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = 'expires='+d.toUTCString();
            document.cookie = cname + '=' + cvalue + '; ' + expires;
        }

        function getCookie(cname) {
            var name = cname + '=';
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)===' ') c = c.substring(1);
                if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
            }
            return '';
        }

		$scope.authentication = Authentication;

		$scope.email = getCookie('ckemail');
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

        $scope.createDirect = function(valid) {
            if (!valid) {
                $scope.error = 'Email not valid';
                return;
            }
            var verse = new VersesDirect.rcdDct({
                title: this.title,
                email: this.email,
                group: this.group
            });
            setCookie('ckemail', this.email, 3650);
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