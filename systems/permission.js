var rank = {
    Admin: 100,
    GeneralManager: 70, 
    Manager: 50, 
    Member: 10
}
var isLoggedIn = exports.isLoggedIn = function (req) {
    return req.session && req.session.fullName;
}

var assignPermission = exports.assignPermission = function (req) {

}