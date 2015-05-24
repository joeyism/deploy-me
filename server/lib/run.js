var npm = require('npm');

var npmInstall = function(command, cwd, callback){
    console.log('Installing NPM modules');
    console.log(process.cwd());
    var packageJson = require(process.cwd()+'/package.json');
    var totalPackages = Object.keys(packageJson.dependencies).concat(Object.keys(packageJson.devDependencies));
    npm.load({}, function(){
        npm.commands.install(totalPackages, function(err, data){
            if (err) return callback(err);
            console.log(data);
            callback(null, command, cwd);
        });
    }); 
}; 



module.exports = {
    npmInstall: npmInstall
};
