var rank = {
    Admin: 100,
    GeneralManager: 70, 
    Manager: 50, 
    Member: 10
}
exports.rank = rank;
var isLoggedIn = exports.isLoggedIn = function (req) {
    return req.session && req.session.fullName;
}

var canAssignTask = exports.assignPermission = function (req) {

}

var canEditTeamPermission = exports.canEditTeamPermission = function (req) {

}