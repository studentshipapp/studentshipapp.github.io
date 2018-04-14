// Drawing Part, expects a array, each element of which contains a week's attendance records added up
function dateFromWeekNumber(year, week) {
  var d = new Date(year, 0, 1);
  var dayNum = d.getDay();
  var diff = --week * 7;
  var retstr;

  // If 1 Jan is Friday to Sunday, go to next week
  if (!dayNum || dayNum > 4) {
    diff += 7;
  }

  // Add required number of days
  d.setDate(d.getDate() - d.getDay() + ++diff);
  retstr = d.getDate() + '/' + (d.getMonth()+1) + '/' +(d.getYear()+1900);
  retstr += ' — ';
  var numberOfWeekdays = 6;
  d.setDate(d.getDate() + numberOfWeekdays);
  retstr += d.getDate() + '/' + (d.getMonth()+1) + '/' +(d.getYear()+1900)
  return retstr;
}

function getCurrentWeekNo(){
  var _date = new Date;
  var d = new Date(Date.UTC(_date.getFullYear(), _date.getMonth(), _date.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

function getCurrentYear() {
	return (new Date()).getFullYear();
}

function flattenArray(array) {
	var ret = [];
	for(var i = 0; i<array.length; ++i)
		for(var j=0; j<array[i].length; ++j)
			ret.push(array[i][j]);
	return ret;
}

function restructureArray(array) {
	if(array.length%4 != 0)
		return false;

	var ret = [];
	for(var i=0; i<array.length; i+=4){
		var temp = [];
		for(var j=0; j<=3; ++j){
			temp.push(array[i+j]);
		}
		ret.push(temp);
	}
	return ret;
}

function formatData(array) {
	var prep = [], temp, pres;
	prep.push(['Week', 'Classes Attended', 'Classes Missed']);
	for(var i = 0; i<array.length; ++i) {
		prep.push([ dateFromWeekNumber(array[i][3], array[i][2]), array[i][0], (array[i][1] - array[i][0])]);
	}
	return prep;
}

function drawChart(dataArray){
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(function () {
		//var data = google.visualization.arrayToDataTable(formatData(dataArray));
		var data = google.visualization.arrayToDataTable(formatData(dataArray));
		var options = {
			backgroundColor: '#F7F7F7',
	        legend: { position: 'none' },
	        axisTitlesPosition: 'in',
	        colors: ['#4CAF50', '#EFEFEF'],
	        vAxis: {
	        	textPosition: 'none',
	    		gridlines: {
	        		color: "#EEEEEE"
	    		},
	    		viewWindowMode: 'maximized'
	    	},
	        baselineColor: '#4CAF50',
	        bar: {
				groupWidth: '100%', gap:0
			},
	        hAxis: {
	        	textPosition: 'none',
	        	baselineColor: '#f0f0f0',
	        	gridlines: {
	        		color: "#EFEFEF"
	    		},
	    		viewWindowMode: 'maximized'
	        },
	        chartArea: {
			    left: 0,
			    top: 0,
			    height: '100%',
			    right: 0
			},
	        isStacked: true,
	    }; 
	    var chart = new google.visualization.ColumnChart(
	        document.getElementById('columnchart_material'));

	    chart.draw(data, options);
	});
}
function drawPiChart(dualArray){
	google.charts.load("current", {packages:["corechart"]});
      google.charts.setOnLoadCallback( function(){
        var data = google.visualization.arrayToDataTable([
          ['Was', 'Days'],
          ['Present',               dualArray[0]],
          ['Absent', dualArray[1] - dualArray[0]]
        ]);

        var options = {
          pieHole: 0.5,
          colors: ['#EEEEEE','cornflowerblue'],
          pieSliceText: 'none',
          legend: {
          	position: 'none'
          },
          tooltip: {
          	trigger: 'none'
          },
          enableInteractivity: false,
          reverseCategories: true,
          chartArea: {
          	left: 0,
          	right: 0,
          	top: 0,
          	bottom: 0,
          	height: '100%'
          }
        };

        var chart = new google.visualization.PieChart(document.getElementById('pachart'));
        chart.draw(data, options);
    });
}

function drawLineChart(x, y) {
	document.getElementById('lineChartBack').style.width = '100%';
	document.getElementById('lineChartTop').style.width = '' + ((x/y)*100) + '%';
	document.getElementById('lineChartTop').textContent = '' + precisionRound(((x/y)*100), 2) + '%'
	return true;
}

function storeAttendance(userID, attArray) {
	var qr = db.collection('users').doc(currentUser.uid);
	qr.set({
		attendanceArray : flattenArray(attArray)
	}).then(function(){
		console.log('Write Successful!');
		refreshUserData();
		initUI();
	}).catch(function(error){
		showError('Cannot reach network. Try again later');
		console.log(error);
	});
}

function updateAttendance(pres, total, atArray) {
	var arr = restructureArray(userData.attendanceArray);
	var weekNo = getCurrentWeekNo();
	var year = getCurrentYear();
	if(atArray.length != 0 && arr[arr.length-1][2] == weekNo && arr[arr.length-1][3] == year) {
		arr[arr.length-1][0] += pres;
		arr[arr.length-1][1] += total;
	} else {
		var temp = [];
		temp.push(pres);
		temp.push(total);
		temp.push(weekNo);
		temp.push(year);
		arr.push(temp);
	}
	storeAttendance(currentUser.uid, arr);
	return arr[arr.length - 1];
}

function getTotalAttendance(atArray) {
	var pres = 0, total = 0;
	for(var i=0; i<atArray.length; ++i) {
		pres += atArray[i][0];
		total += atArray[i][1];
	}
	var ret = [];
	ret.push(pres);
	ret.push(total);
	return ret;
}

function getPercentage(dualArray) {
	return (dualArray[0]/dualArray[1]) * 100;
}

function getLastEnteredAttendance(atArray) {
	return atArray[atArray.length - 1];
}

function getThisWeekAtten (atArray) {
	var week = getCurrentWeekNo();
	var yr = getCurrentYear();
	var ret = [];
	if(atArray[atArray.length - 1][2] == week && atArray[atArray.length - 1][3] == yr){
		ret.push(atArray[atArray.length - 1][0]);
		ret.push(atArray[atArray.length - 1][1]);
		return ret;
	}
	return false;
}

function calcDTG(p, t, target, max){
	var steps = 100 | max;
	var i = 0, flag = false, temp, ret = [];
	while(i<steps) {
		temp = (p + i)/(t + i);
		if(temp >= target){
			ret.push(i); ret.push(temp);
			return ret;
		}
		++i;
	}
	return false;
}

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function hideUILoader() {
	var ele = document.getElementById('uiLoader');
	if(!ele.classList.contains('hidden')){
		ele.classList.add('hidden');
	}
}

/*
**  Listen to change on slider and update text value
*/

document.getElementById('upat-total').oninput = function () {
	document.getElementById('upat-total-tx').value = this.value;
}

document.getElementById('upat-present').oninput = function () {
	document.getElementById('upat-present-tx').value = this.value;
}

document.getElementById('upat-present-tx').oninput = function() {
	var val = this.value;
	/*if(val > 15)
		val = 15;
	if(val < 0)
		val = 0;*/
	document.getElementById('upat-present').MaterialSlider.change(parseInt(val));
}

document.getElementById('upat-total-tx').oninput = function() {
	var val = this.value;
	/*if(val > 15)
		val = 15;
	if(val < 0)
		val = 0;*/
	document.getElementById('upat-total').MaterialSlider.change(parseInt(val));
}

document.getElementById('firstattensubmit').onclick = function(){
	addFirstAttendance();
}

/* Default behaviour: If the text value is greater than the slider's value
** use the text value. Else, if the slider value == text value, use slider value
** If total is zero, don't bother updating attendance. It'll save a write.
*/
function attenError(str) {
	var elem = document.getElementById('atten-err');
	elem.textContent = str;
	if(elem.classList.contains('hidden'))
		elem.classList.remove('hidden');
}

function clearAttenError() {
	var elem = document.getElementById('atten-err');
	if(!elem.classList.contains('hidden'))
		elem.classList.add('hidden');
}

document.getElementById('upat-btn').onclick = function() {
	clearAttenError();
	var valTotalBox = parseInt(document.getElementById('upat-total-tx').value);
	var valPresentBox = parseInt(document.getElementById('upat-present-tx').value);
	var valTotalSlider = parseInt(document.getElementById('upat-total').value);
	var valPresentSlider = parseInt(document.getElementById('upat-present').value);
	var p, t;

	if( valTotalBox > valTotalSlider)
		t = valTotalBox;
	else if( valTotalBox == valTotalSlider )
		t = valTotalSlider;
	else {
		attenError('Something went wrong, try again.');
		return false;
	}

	if( valPresentBox > valPresentSlider)
		p = valPresentBox;
	else if( valPresentBox == valPresentSlider )
		p = valPresentSlider;
	else {
		attenError('Something went wrong, try again.');
		return false;
	}

	if( p > t ) {
		attenError('Total classes cannot be less than attended classes!');
		return false;
	}

	if( t == 0 ){
		return true;
	}

	updateAttendance(p, t, userData.attendanceArray);
	return true;
}

function initUI(){
	//check for new user w/o data
	if(userData == null) {
		showNewUserUI();
		return true;
	}

	//shouldn't happen, but if for some reason auth missed creating array, create a temp one
	//till atleast storeAttendance bulldozes (overwrites) it
	if(userData.attendanceArray == undefined){
		userData.attendanceArray = [];
	}

	if(userData.attendanceArray.length == 0){
		showNewUserUI();
		return true;
	}
	
	//Initiaing data structs
	var atten = restructureArray(userData.attendanceArray);
	var total = getTotalAttendance(atten);
	var percent = getPercentage(total);
	var dtg = calcDTG(total[0], total[1], 0.75, 200);
	var thisWeek = getThisWeekAtten(atten);

	var percentObj = {};

	percentObj['percent'] = precisionRound(percent, 2) + '%';
	if(percent < 60) {
		percentObj['state'] = 'Hang on, you\'ll get there';
		percentObj['col'] = 'att-state-red';
	} else if(percent < 75) {
		percentObj['state'] = 'Almost there';
		percentObj['col'] = 'att-state-yellow';
	} else {
		percentObj['state'] = 'In the clear!';
		percentObj['col'] = 'att-state-green';
	}

	document.getElementById('atten-state').textContent = percentObj['state'];
	document.getElementById('atten-percent-text').textContent = percentObj['percent'];
	document.getElementById('atten-state').classList = document.getElementById('atten-percent-text').classList = '';
	document.getElementById('atten-state').classList.add(percentObj['col']);
	document.getElementById('atten-percent-text').classList.add(percentObj['col']);

	if(percent >= 70)
		document.getElementById('atten-dtg').textContent = 'You have more than 75% attendance. Keep it up!';
	else if(dtg == false)
		document.getElementById('atten-dtg').textContent = 'You need to attend classes for more than 200 classes to get 75% attendance';
	else
		document.getElementById('atten-dtg').textContent = 'You need to attend classes for atleast ' + dtg[0] + ' classes to get 75% attendance';

	// Draw Charts
	drawChart(atten);
	drawPiChart(total);

	//Create This Week info
	if(thisWeek == false) {
		drawLineChart(0,1);
	} else {
		document.getElementById('tw-classes').textContent = thisWeek[1];
		document.getElementById('tw-classattn').textContent = thisWeek[0];
		drawLineChart(thisWeek[0], thisWeek[1]);
	}

	hideUILoader();
}

function showNewUserUI(){
	var ele = document.getElementById('newUser');
	var welcome = document.getElementById('welcome');
	if(ele.classList.contains('hidden'))
		ele.classList.remove('hidden');
	if(!welcome.classList.contains('hidden'))
		welcome.classList.add('hidden');
}

function addFirstAttendance(){
	var p = parseInt(document.getElementById('newa-pres').value);
	var t = parseInt(document.getElementById('newa-total').value);
	var err = document.getElementById('newa-err');
	var flag = false;
	var ec = '';
	var arr = [];

	if(t<p) {
		flag = true;
		ec = 'Total number of classes cannot be less than attended classes!';
	}
	if(isNaN(t) || isNaN(p)) {
		flag = true;
		ec = 'Both fields should be numbers';
	}
	if(t == 0) {
		flag = true;
		ec = 'Enter a nonzero value for total number of classes, please!';
	}

	if(flag == true) {
		if(err.classList.contains('hidden'))
			err.classList.remove('hidden');
		err.textContent = ec;
		return false;
	}

	updateAttendance(p, t, arr);
	return true;
}