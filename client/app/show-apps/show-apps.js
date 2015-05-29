'use strict';

angular.module('deployMeApp').directive('showApps', ['$http','$sce','$timeout',function($http,$sce,$timeout){

    return {
        templateUrl: 'app/show-apps/show-apps.tpl.html',
        link: function(scope){
            var deployedApp = [];
            var appShowing = {};

            var deployedAppIndex = function(){
                deployedApp.forEach(function(app, i){
                    if (angular.equals(app, appShowing)){
                        return i;
                    }
                });
            };

            var displayApp = function(result, isAlreadyDeployed){

                var url = "http://" + result.url + ":" + result.port.split("\"").join("");
                scope.deployedApp = $sce.trustAsResourceUrl(url);
                var thisAppObj = {port: result.port, name:result.name, url:result.url};
                appShowing = thisAppObj;
                if (!isAlreadyDeployed){
                    deployedApp.push(thisAppObj);
                }
                $timeout(function(){
                    scope.$apply();
                },1);
                console.log(deployedApp);
            };

            $http.get('/api/v1/getAllApps').success(function(results){
                scope.allApps = results.allApps; 
                if (results.allDeployedApps){
                    deployedApp = results.allDeployedApps;
                    displayApp(deployedApp[0], true);
                }
            });

            scope.deployApp = function(eachApp){
                if (deployedApp.every(function(app){
                    var notDeployed = (eachApp[1] !== app.name);
                    if (!notDeployed){
                        console.log('already deployed '+app.url+":"+app.port);
                var url = "http://" + app.url + ":" + app.port.split("\"").join("");
                        scope.deployedApp = $sce.trustAsResourceUrl(url);
                        appShowing = app;
                        return false;
                    };
                    return notDeployed;
                })){
                    $http.post('/api/v1/deployApp',JSON.stringify({app: eachApp[1]})).success(function(result){
                        displayApp(result);
                    })
                    .error(function(result){
                        console.log(result);
                    });
                }
            };

            scope.kill = function(){
                $http.post('/api/v1/killApp', appShowing).success(function(result){
                    scope.deployedApp = null;
                    delete deployedApp[deployedAppIndex()];
                });
            };
        }
    };
}]);
