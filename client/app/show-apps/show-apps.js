'use strict';

angular.module('deployMeApp').directive('showApps', ['$http',function($http){

    return {
        templateUrl: 'app/show-apps/show-apps.tpl.html',
        link: function(scope){
            $http.get('/api/v1/getAllApps').success(function(allApps){
                scope.allApps = allApps;
            });

            scope.deployApp = function(eachApp){
                $http.post('/api/v1/deployApp',{app: eachApp[1]}).success(function(result){
                    console.log(result);
                })
                .error(function(result){
                    console.log(result);
                });
            };
        }
    };
}]);
