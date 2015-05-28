'use strict';

angular.module('deployMeApp').directive('showApps', ['$http','$sce','$timeout',function($http,$sce,$timeout){

    return {
        templateUrl: 'app/show-apps/show-apps.tpl.html',
        link: function(scope){
            var deployedApp = [];

            var updateLink = function(result){
                scope.deployedApp = $sce.trustAsResourceUrl("http://localhost:"+result.split("\"").join(""));
                deployedApp.push(result);
                $timeout(function(){
                    scope.$apply();
                },1);
                console.log(scope.deployedApp);
            };

            $http.get('/api/v1/getAllApps').success(function(results){
                console.log(results);
                scope.allApps = results.allApps;
                if (results.deployed){
                    updateLink(results.deployed);
                }
            });

            scope.deployApp = function(eachApp){
                $http.post('/api/v1/deployApp',JSON.stringify({app: eachApp[1]})).success(function(result){
                    updateLink(result);
                })
                .error(function(result){
                    console.log(result);
                });
            };

            scope.kill = function(){
                $http.post('/api/v1/killApp',{app: deployedApp[0]}).success(function(result){
                    scope.deployedApp = null;
                    delete deployedApp[0];
                });
            };
        }
    };
}]);
