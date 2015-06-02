var npm = require('npm');
var path = require('path');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var async = require('async');

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
    var nodeApp = nodeApp || "server/app.js";
    process.env.PORT = Math.floor(Math.random()*9000) + 1000;
    console.log({command: nodeApp, port: process.env.PORT,cwd:cwd});
    var deployedApp = spawn('node',[path.join(cwd,nodeApp)],{env: process.env});
    callback(null, process.env.PORT, deployedApp);
};

var runCmd = function(commandArray, callback){
    console.log('running commands');
    console.log(commandArray);
    var commandFunctionArray = [];
    commandArray.forEach(function(cmd){
        commandFunctionArray.push(function(eachCb){
            exec(cmd, function(err, stdout){
                console.log(stdout);
                eachCb(err, stdout);
            });
        });
    });
    async.series(commandFunctionArray, function(err, totalOutput){
        console.log('Commands completed');
        if (err)
            callback(err);
        else
            callback(null, totalOutput);
    });
};

var update = function(cwd, callback){
    console.log('running update commands');
    runCmd(['git pull origin master', 'npm install','bower install','grunt'], function(err, output){
        console.log(err, output);
        if (err)
            callback(err);
        else
            callback(null, cwd);
    });
};

var install = function(file, cwd, callback){
    runCmd(['git clone '+file[0]+' '+file[1],'cd '+file[1], 'npm install --force','bower install','grunt'], function(err, output){
        console.log(err, output);
        if (err)
            callback(err);
        else
            callback(null, cwd);
    });
    
};

module.exports = {
    npmInstall: npmInstall,
    update: update,
    install: install,
    app: app
};
