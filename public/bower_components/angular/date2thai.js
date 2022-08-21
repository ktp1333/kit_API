function DateThai() {}

DateThai.execute = function(tdate) {
months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  var dt  = tdate.split(/\-|\s/);
  tyear=(parseInt(dt[0])+543).toString();
  eyear=dt[0];
  tday=dt[2];
  tmonth=dt[1];

  var thday = new Array ("อาทิตย์","จันทร์",
"อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"); 

var thmonth = new Array ("","มกราคม","กุมภาพันธ์","มีนาคม",
"เมษายน","พฤษภาคม","มิถุนายน", "กรกฎาคม","สิงหาคม","กันยายน",
"ตุลาคม","พฤศจิกายน","ธันวาคม");
t2month= thmonth[parseInt(dt[1])];


   return tday+' '+t2month+' '+tyear;
}

function DateThaimonth() {}

DateThaimonth.execute = function(tdate1,tdate2) {

  var dt  = tdate1.split(/\-|\s/);
  tyear=(parseInt(dt[0])+543).toString();
  tmonth1=dt[1];
xx=dt[0]+dt[1];
  var dt2  = tdate2.split(/\-|\s/);
  tyear2=(parseInt(dt2[0])+543).toString();
  tmonth2=dt2[1];
yy=dt2[0]+dt2[1];

var thmonth = new Array ("","มกราคม","กุมภาพันธ์","มีนาคม",
"เมษายน","พฤษภาคม","มิถุนายน", "กรกฎาคม","สิงหาคม","กันยายน",
"ตุลาคม","พฤศจิกายน","ธันวาคม");

if (xx=yy)
 {
   return  thmonth[parseInt(dt[1])]+' '+tyear;
}
else
{
 return  thmonth[parseInt(dt[1])]+' '+tyear+'  -  '+thmonth[parseInt(dt2[1])]+' '+tyear2;
}


}


