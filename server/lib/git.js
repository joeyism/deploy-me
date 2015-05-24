var exec = require('child_process').exec;
var path = require('path');

var clone = function(gitUrl, location, foldername, command, callback){
     exec('git clone '+gitUrl+ ' '+location+'/'+foldername, function(err, stdout, stderr){
         if (err){
            callback(err);
         }
        callback(null, path.join(__dirname, '../deployments',foldername), command);
     });
};


module.exports = {
    clone:clone
};
