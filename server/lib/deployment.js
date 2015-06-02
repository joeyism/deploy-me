var parse = require('csv-parse');
var async = require('async');
var path = require('path');
var git = require('./git');
var fs = require('fs');
var run = require('./run');
var allDeployedApps = [];
var os = require('os');
var ifaces = os.networkInterfaces();
var config;
var currentIp;

Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            return;
        }

        if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            console.log(ifname + ':' + alias, iface.address);
            currentIp= iface.address;
        } else {
            // this interface has only one ipv4 adress
            console.log(ifname, iface.address);
            currentIp = iface.address;
        }

    });
});
var readFile = function(location, callback){
    var dir = path.join(__dirname,'..',location);
    console.log('Reading file at ' + dir);
    fs.readFile(dir, function(err, data){
        data = data.toString();
        console.log({err:err, data: data});
        callback(err, data);
    });
};

var parseFile = function(file, callback){
    console.log('Parsing file '+file);
    parse(file, {comment: '#'}, function(err, data){
        console.log({err:err, data:data, file: file});
        callback(err, data);
    });
};

var getAppsAndParse = [
    function(callback){
        callback(null, config.files.allApps);
    },
    readFile,
    parseFile
];

var matchApp = function(parsedFile, appname, callback){
    var matchedFile;
    if (parsedFile.every(function(file, i){
        if (file[1] === appname){
            matchedFile = file;
            return false;        
        }
        return true;
    })){
        callback("Project not found");
    } else {
        callback(null, matchedFile);
    }
};

var downloadAppIfIsntThere = function(app, callback){
    fs.readdir(path.join(__dirname, '../deployments'), function(err, files){
        if (files.every(function(file){
            if (file===app[1]){
                return false;
            }
            return true;
        })){
            console.log('Cloning');
            git.clone(app[0], path.join(__dirname,'../deployments'), app[1],app[2],callback);
        }
        else {
            console.log('App already there. Moving on');
            callback(null, path.join(__dirname,'../deployments',app[1]),app[2]);
        }
    });
};

var downloadDependencies = function(file, command, callback){
    var currentDir = process.cwd();
    process.chdir(file);
    run.npmInstall(command, currentDir, callback); 

};

var deployment = function(req, res){
    console.log('Beginning deployment process');
    async.waterfall(
        getAppsAndParse.concat([
            function(parsedFile, callback){
                matchApp(parsedFile, req.body.app, callback);
            },
            downloadAppIfIsntThere,
            run.app,
            function(port, deployedApp, callback){
                allDeployedApps.push({port: port, app: deployedApp, name: req.body.app});
                callback(null, port);
            }
        ]),
        function(err, result){            
            console.log('Completed. Sending result...');
            if(err){
                console.log(err);
                res.status(404).send(JSON.stringify(err));
            }
            else {
                res.status(200).send(JSON.stringify({port:result, url: currentIp, name: req.body.app}));
            }
        });
};

var allApps = function(req, res){
    console.log('Getting all apps');
    async.waterfall(
        getAppsAndParse,
        function(err, result){
            console.log('Completed. Sending result...');
            if(err){
                console.log(err);
                res.status(404).send(JSON.stringify(err));
            }
            else {
                var resultObj = {allApps: result};
                if (allDeployedApps.length > 0){
                    resultObj.allDeployedApps=[]; 
                    allDeployedApps.forEach(function(app){
                        resultObj.allDeployedApps.push({port: app.port, url:currentIp, name:app.name}); 
                    });
                }
                res.status(200).send(resultObj);
            }
        });
};

var appTermination = function(req, res){
    var deployedPort = req.body.port.toString().split("\"").join("");
    allDeployedApps.forEach(function(deployed,i){
        console.log('killing');
        console.log({deployedPort:deployedPort, port: deployed.port});
        if(deployedPort === deployed.port){
            deployed.app.kill();
            allDeployedApps.splice(0,1);
            res.status(200).send();
        }
    });
};

var cdIntoDeployment = function(file, callback){
    var cwd = process.cwd();
    var dir = path.join(__dirname,'..','deployments',file[1]);
    cdInto(dir,function(){
        callback(null, cwd);
    });
};

var cdInto = function(location, callback){
    console.log('cd into ' + location);
    process.chdir(location);
    callback(null);
};

var update = function(req, res){
    console.log('updating app');
    console.log(req.body.name);
    async.waterfall(
        getAppsAndParse.concat([
            function(parsedFile, callback){
                matchApp(parsedFile, req.body.name, callback);
            },
            cdIntoDeployment,
            run.update,
            cdInto
        ]),
        function(err, result){
            console.log('update complete');
            console.log({err: err, result:result});
            if (err)
                res.status(404).send(err);
            else
                res.status(200);
        });
};

var install = function(req, res){
    console.log('installing app');
    async.waterfall(
        getAppsAndParse.concat([
            function(parsedFile, callback){
                matchApp(parsedFile, req.body.name, callback);
            },
            function(file, callback){
                var cwd = process.cwd();
                cdInto(path.join(__dirname, '..','deployments'), function(){
                    callback(null, file, cwd);
                });
            },
            run.install,
            cdInto
        ]),
        function(err, result){
            console.log('installation complete\n');
            console.log({err: err, result:result});
            if (err)
                res.status(404).send(err);
            else
                res.status(200);
        });
};

module.exports = function(configuration){
    config = configuration;
    return {
        allApps: allApps,
        deployment: deployment,
        update: update,
        install: install,
        appTermination: appTermination
    };
};
