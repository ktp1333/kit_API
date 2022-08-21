(function () {
    var app = angular.module('myApp');

    app.factory('globalSetting', function ($rootScope) {
        var vm = this;

        vm.setting = {


            // orguid : "5faa3d95f71034497f38a208",
            // vacode :"EYEVISION",
            // code_cr : "['3000018','3335388']",
            // code_hba1cs : "['3331428']",
            // code_fbss : "['3000161']",
            // code_choles : "['3000026', '3000622','3000875', '3000876','3330531','3331426']",
            // homemed :'57ce9bc44ac9670b1c439ba9',
            // dailymed : '5796e65d1526f6ebabe3b4a4',
            // continuemed :'5796e65d1526f6ebabe3b4a5',
            // fileserver_cuc:"https://fileserver.chaksusathan.com:9999",
            // fileserver_demo:"https://annotate.princhealth.local:9999",
            // fileserver_metta:"http://110.78.211.222:9999",
            // fileserver_metta:"https://192.168.20.19:9999",
            //set up
            // if (orguid == '59e865c8ab5f11532bab0537') {
            // code_hba1cs = "['CC0040']";
            // code_fbss = "['CC0011', 'CH002']";
            // code_choles = "['CC0210', 'CC0220','CC0230', 'CC0240']";
            // code_cholesterol = '3000026';
            // code_triglyceride = '3000622';
            // code_HDL = '3000875';
            // code_LDL = '3000876';
            // code_LDL(Direct) = '3330531';
            // code_cr = 'CC0140';
            // } else if (orguid == '5b6187eca03e2340f130e6fb') {
            // } else {
            // }
            orguid: {
                QA: '59e865c8ab5f11532bab0537',
                METTA: '5faa3d95f71034497f38a208',
                METTAUAT: '5faa3d95f71034497f38a208',
                DEMO: '59e865c8ab5f11532bab0537',
                CUC: '569794170946a3d0d588efe6',
                KDMS: '59e865c8ab5f11532bab0537'
            },
            url:{
                QA: 'http://159.138.253.189:30030/',
                METTA: 'http://192.168.20.19:30030/',
                METTAUAT: 'http://192.168.30.12:30030/',
                DEMO: 'http://159.138.253.189:30030/',
                CUC: 'http://10.202.0.33:8095/',
            },
            // vatnuser:{
            //     QA: '11',
            //     METTA: "INTERFACE",
            //     METTAUAT:  "MIEC04",
            //     DEMO: '11',
            //     CUC: '11'
            // },
            // fileserver:{
            //     QA: "https://annotate.princhealth.local:9999",
            //     METTA: "192.168.20.20:5555",
            //     METTAUAT: "http://192.168.30.12:10099",
            //     // METTA: "https://192.168.20.19:9999",
            //     DEMO: "https://annotate.princhealth.local:9999",
            //     CUC: "https://fileserver.chaksusathan.com:9999",
            // },
            // qrurl:{
            //     QA: "http://addon.humancentric.info:7222",
            //     METTA: "",
            //     METTAUAT: "",
            //     DEMO: "http://addon.humancentric.info:7222",
            //     CUC: "",
            // },
            // iip:{
            //     METTA: "http://192.168.20.19:30030/",      
            //     METTAUAT: 'http://192.168.30.12:30030/',      
            // },
        }


        return vm;

    })

    app.factory('Org')
})();


