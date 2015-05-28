var npm = require('npm');
var path = require('path');
var spawn = require('child_process').spawn;

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
    process.env.PORT = Math.floor(Math.random()*9000) + 1000;
    console.log({command: nodeApp, port: process.env.PORT,cwd:cwd});
    var deployedApp = spawn('node',[path.join(cwd,nodeApp)],{env: process.env});
    callback(null, process.env.PORT, deployedApp);
};

module.exports = {
    npmInstall: npmInstall,
    app: app
};
