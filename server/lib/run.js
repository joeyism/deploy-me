var npm = require('npm');
var path = require('path');
var npmInstall = function(cwd, nodeApp, callback){
    console.log('Installing NPM modules');
    console.log(process.cwd());
    var packageJson = require(process.cwd()+'/package.json');
    var totalPackages = Object.keys(packageJson.dependencies).concat(Object.keys(packageJson.devDependencies));
    npm.load({}, function(){
        npm.commands.install(totalPackages, function(err, data){
            if (err) return callback(err);
            console.log(data);
            callback(null, command, nodeApp);
        });
    }); 
}; 

var app = function(cwd, nodeApp, callback){
    console.log({command: nodeApp, cwd:cwd});
    var runningApp = require(path.join(cwd, nodeApp));
    console.log(runningApp);
};

module.exports = {
    npmInstall: npmInstall,
    app: app
};
