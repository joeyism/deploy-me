var parse = require('csv').parse;
var async = require('async');
var path = require('path');
var fs = require('fs');
var config;

var readFile = function(location, callback){
    var dir = path.join(__dirname,'..',location);
    console.log('Reading file at ' + dir);
    fs.readFile(dir, null, callback);
};

var parseFile = function(file, callback){
    console.log('Parsing file');
    parse(file, {comment: '#'}, callback);
};

var allApps = function(req, res){
    console.log('Getting all apps');
    async.waterfall([
    function(callback){
        callback(null, config.files.allApps);
    },
    readFile,
    parseFile
    ],function(err, result){
        console.log('Completed. Sending result...');
        if(err){
            console.log(err);
            res.status(404).send(JSON.stringify(error));
        }
        else {
            console.log(result);
            res.status(200).send(JSON.stringify(result));
        }
    });
};


module.exports = function(configuration){
    config = configuration;
    return {
        allApps: allApps
    };
};
