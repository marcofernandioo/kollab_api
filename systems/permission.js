var position = {
    Admin: 100, 
    Manager: 50, 
    Member: 10
}
var isLoggedIn = exports.isLoggedIn = function (req) {
    return req.session && req.session;
}

// var assignPermission = exports.assignPermission = function (req) {

// }