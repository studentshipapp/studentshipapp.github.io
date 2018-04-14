/*
**  Variables
*/

var userPeriods = {};
var _days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
var _toEditTarget = NaN;
var _justDeleted = {};
var _flagDeleted = false;

/*
**  Managing time stuff
*/

//Finds a > b (1: true, -1:false, 0: equal), expects periodObject as input
function agtb_time(aa, ab){
	var a = aa.from;
	var b = ab.from;

	var a_h = parseInt(a.slice(0,2));
	var b_h = parseInt(b.slice(0,2));
	var a_m = parseInt(a.slice(3,5));
	var b_m = parseInt(b.slice(3,5));

	if(a.indexOf('pm') != -1 || a.indexOf('PM') != -1)
		a_h += 12;
	if(b.indexOf('pm') != -1 || b.indexOf('PM') != -1)
		b_h += 12;

	if(a_h > b_h)
		return 1;
	if(a_h < b_h)
		return -1;
	if(a_h == b_h) {
		if(a_m > b_m)
			return 1;
		if(a_m < b_m)
			return -1;
		if(a_m == b_m)
			return 0;
	}
	return false;
}

// Check if time is in format h:mm:ss am/pm. Returns false if not, original string if is.
function getTime(str) {
	var bk = str;
	if((str.length == 6 || str.length == 7) && str[1] == ':')
		str = '0' + str;

	if(str[2] != ':')
		return false;

	if(str.length < 7)
		return false;
	if(str.length > 8)
		return false;
	if(str.length == 8)
		if(str.indexOf(' ') == -1)
			return false;

	var flaga, flagb;
	var a_h = parseInt(str.slice(0,2));
	var a_m = parseInt(str.slice(3,5));

	if(str.indexOf('pm') != -1 || str.indexOf('PM') != -1)
		flaga = true;
	if(str.indexOf('am') != -1 || str.indexOf('AM') != -1)
		flagb = true;

	if(flaga && flagb)
		return false;
	if(!(flaga || flagb))
		return false;
	if(a_h > 12 || a_h < 0)
		return false;
	if(a_m >59 || a_m < 0)
		return false;

	return bk;
}


/*
**  Tab manipulation
*/

//Selects tab
function selectTab(str){
	if(_days.indexOf(str) < 0 || _days.indexOf(str) > 6)
		return false;

	document.getElementById('link-day-'+str).click();
	var elem = document.getElementById('tabbar');
	if(_days.indexOf(str) > 2){
		var maxScroll = elem.scrollWidth - elem.clientWidth;
		elem.scrollLeft = maxScroll;
	} else {
		elem.scrollLeft = 0;
	}
	return true;
}

//Returns string for active tab in format www (eg mon, tue etc)
function getActiveTab(){
	return document.getElementById('allDayTabs').getElementsByClassName('is-active')[0].id.slice(9);
}
