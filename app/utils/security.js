var mongoose = require('mongoose');

exports.login = function (req, res) {
    var username = req.params.username;
    var passwordShake128 = req.params.shake128;
    var passwordMD5 = req.params.md5;

    if (username && (passwordShake128 || passwordMD5)) {
        mongoose.connection.collection('users').findOne({
            statusflag: 'A',
            loginid: username.toString(),
            password: { $in: [passwordShake128.toString(), passwordMD5.toString()] }
        }, { projection: { password: 0 } }).then(function (doc) {
            if (doc) {
                res.status(200).json({ user: doc });
            } else {
                res.status(500).json({ error: "ERRORS.INVALIDLOGIN" });
            }
        }).catch(function (err) {
            res.status(500).json({ error: err });
        })
    } else {
        res.status(500).json({ error: "ERRORS.USERNAMEORPASSWORDMISSING" });
    }
}