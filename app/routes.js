module.exports = function (app) {
    // var local_host = require('./local_host.route.js');
    // app.post('/local_host/findconsent', local_host.findconsent);
    // app.post('/local_host/saveconsent', local_host.saveconsent);
    app.get('/org-config', function (req, res) {
        if (!process.env.ORG) {
            return res.status(500).json({ error: 'no organistion config' })
        }

        return res.status(200).json({ org: process.env.ORG })
    })

    var security = require('./utils/security');
    app.get('/security/login/:username/:shake128/:md5?', security.login);

    var API = require('./API.route.js');
    app.post('/API/find_site', API.find_site);
    app.post('/API/opd', API.opd);
    app.post('/API/ipd', API.ipd);
    var local = require('./local.route.js');
    // app.post('/local/savepro', local.savepro);

   
}
