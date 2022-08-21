function ch1() {}
ch1.execute = function(abbre) {
    var result = '';


        if (abbre=='D') {
            result='รายวัน';
        } else {
            result='รายเดือน';
           
        }
       return  result;
}



function addCommas() {}
addCommas.execute = function(nStr) {

		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	}

	