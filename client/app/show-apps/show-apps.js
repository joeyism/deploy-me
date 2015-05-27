'use strict';

angular.module('deployMeApp').directive('showApps', ['$http','$sce',function($http,$sce){

    return {
        templateUrl: 'app/show-apps/show-apps.tpl.html',
        link: function(scope){
            $http.get('/api/v1/getAllApps').success(function(allApps){
                scope.allApps = allApps;
            });

            scope.deployApp = function(eachApp){
                $http.post('/api/v1/deployApp',JSON.stringify({app: eachApp[1]})).success(function(result){
                    scope.deployedApp = $sce.trustAsResourceUrl("http://localhost:"+result.split("\"").join(""));
                    console.log(scope.deployedApp);
                })
                .error(function(result){
                    console.log(result);
                });
            };
        }
    };
}]);
