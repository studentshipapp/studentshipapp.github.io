var userPeriods = {};
var _days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
var _toEditTarget = NaN;
var _justDeleted = {};
var _flagDeleted = false;

function initUI(){
	if(!document.getElementById('uiLoader').classList.contains('hidden'))
		document.getElementById('uiLoader').classList.add('hidden');

	firebase.firestore().collection('users').doc(currentUser.uid).collection('routine').doc('all').get().then(function(doc){
		if(doc.exists) {
			userPeriods = doc.data();
			addAllPeriods(userPeriods.periods);
			console.log('Fetched routine');
		} else {
			showError('User data not found in database');
			console.log('Document not found in collection for user, contact admin @therdas');
			userPeriods = null;
		}
	}).catch(function(error){
		showError('Something went wrong');
		console.log(error);
		userPeriods = null;
	});
}

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

//10:00am 10:00 am or (1:25am 1:25 am)
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

function getActiveTab(){
	return document.getElementById('allDayTabs').getElementsByClassName('is-active')[0].id.slice(9);
}

function addRoutine(period, day) {
	if(!document.getElementById(day).getElementsByClassName('noPeriods')[0].classList.contains('hidden'))
		document.getElementById(day).getElementsByClassName('noPeriods')[0].classList.add('hidden');

	if(period == undefined || _days.indexOf(day) == -1)
		return false;

	var container = document.createElement('span');
	container.classList = 'mdl-shadow--2dp routine-card';
	container.style.backgroundColor = period.color;

	if(arguments.length==3) {
		container.setAttribute('data-count', arguments[2]);
	}

	var close = document.createElement('span');
	var _inner = document.createElement('i');
	_inner.innerHTML = 'edit';
	_inner.classList = 'material-icons';
	close.classList = 'mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon routine-card-editbtn';
	close.addEventListener('click', handleEditBtn);
	close.appendChild(_inner);
	container.appendChild(close);

	var timeContainer = document.createElement('span');
	timeContainer.classList.add('time');
	timeContainer.innerHTML = period.from + ' — ' + period.to;

	container.appendChild(timeContainer);

	var heading = document.createElement('h2');
	heading.classList.add('periodName');
	heading.innerHTML = period.name;

	container.appendChild(heading);

	var info = document.createElement('span');
	var a = document.createElement('span');
	var b = document.createElement('span');
	a.innerHTML = period.teacher;
	b.innerHTML = period.location;
	info.appendChild(a);
	info.appendChild(b);
	info.classList.add('info');

	container.appendChild(info);

	document.getElementById(day).getElementsByClassName('periodlister')[0].appendChild(container);
	return true;
}

function handleEditBtn(event) {
	_toEditTarget = parseInt(this.parentNode.getAttribute('data-count'));
	showAddBox('replace');
}

document.getElementById('addbtn').addEventListener('click', function(e){
	showAddBox('add');
});

document.getElementById('dialog-shade').addEventListener('click', function(e){
	hideAddBox();
});

document.getElementById('pe-cancel').addEventListener('click', function(e){
	hideAddBox();
});

document.getElementById('pe-submit').addEventListener('click', function(e){
	addSinglePeriod('add');
});

document.getElementById('pe-delete').addEventListener('click', function(e){
	deletePeriodWEditing(_toEditTarget);
	resetAddBox();
	hideAddBox();
});

document.getElementById('pe-replace').addEventListener('click', function(e){
	addSinglePeriod('replace', _toEditTarget);
});

for(var i = 0; i < document.getElementsByClassName('color-container-item').length; ++i) {
	document.getElementsByClassName('color-container-item')[i].addEventListener('click', setColAdd);
}

function setColAdd(e) {
	if(this.children.length > 0){
		if(this.children[0].classList.contains('material-icons'));
	} else {
		var checked = document.getElementsByClassName('pe-col-selected')[0];
		checked.classList.remove('pe-col-selected');
		checked.removeChild(checked.children[0]);
		var ck = document.createElement('i');
		ck.classList.add('material-icons');
		ck.textContent ='checked';
		this.appendChild(ck);
		this.classList.add('pe-col-selected');
	};
	return true;
}

function showAddBox(mode) {
	resetAddBox();
	var dialog = document.getElementById('add-dialog');
	var shade = document.getElementById('dialog-shade');
	if(dialog.classList.contains('hidden'))
		dialog.classList.remove('hidden');
	if(shade.classList.contains('hidden'))
		shade.classList.remove('hidden');

	if(mode == 'add') {
		if(document.getElementById('pe-submit').classList.contains('hidden'))
			document.getElementById('pe-submit').classList.remove('hidden');

		if(!document.getElementById('pe-replace').classList.contains('hidden'))
			document.getElementById('pe-replace').classList.add('hidden');
		if(!document.getElementById('pe-delete').classList.contains('hidden'))
			document.getElementById('pe-delete').classList.add('hidden');
	} else if (mode == 'replace') {
		var _day = getActiveTab();
		var _period =  userPeriods.periods[_day][_toEditTarget];
		document.getElementById('pe-title-text').textContent = 'Edit Period';
		document.getElementById('pe-name').parentNode.MaterialTextfield.change(unescapeHtml(_period.name));
		document.getElementById('pe-from').parentNode.MaterialTextfield.change(unescapeHtml(_period.from));
		document.getElementById('pe-to').parentNode.MaterialTextfield.change(unescapeHtml(_period.to));
		document.getElementById('pe-teacher').parentNode.MaterialTextfield.change(unescapeHtml(_period.teacher));
		document.getElementById('pe-location').parentNode.MaterialTextfield.change(unescapeHtml(_period.location));
		var collection = document.getElementsByClassName('color-container-item');
		for(var i = 0; i<collection.length; ++i) {
			if(collection[i].style.backgroundColor == _period.color){
				setColAdd.apply(collection[i]);
			}
		}

		if(!document.getElementById('pe-submit').classList.contains('hidden'))
			document.getElementById('pe-submit').classList.add('hidden');

		if(document.getElementById('pe-replace').classList.contains('hidden'))
			document.getElementById('pe-replace').classList.remove('hidden');
		if(document.getElementById('pe-delete').classList.contains('hidden'))
			document.getElementById('pe-delete').classList.remove('hidden');
	}
	return true;
}

function hideAddBox() {
	var dialog = document.getElementById('add-dialog');
	var shade = document.getElementById('dialog-shade');
	if(!dialog.classList.contains('hidden'))
		dialog.classList.add('hidden');
	if(!shade.classList.contains('hidden'))
		shade.classList.add('hidden');
	return true;
}

function deletePeriodWEditing(index) {
	var day = getActiveTab();
	_justDeleted = userPeriods.periods[day][index];
	_flagDeleted = true;
	userPeriods.periods[day].splice(index, 1);
	saveRoutine(userPeriods.periods);
	console.log('Deleted period');
	console.log(_justDeleted);
	document.getElementById('errorbar').MaterialSnackbar.showSnackbar({
		message: 'Deleted Element',
		timeout: 3000,
		actionHandler: redoDelete,
		actionText: 'Undo'
	});
}

function redoDelete(){
	if(!_flagDeleted)
		return false;

	var day = getActiveTab();
	userPeriods.periods[day].push(_justDeleted);
	saveRoutine(userPeriods.periods);
}

function resetAddBox(){
	var collection = document.getElementsByClassName('mdl-textfield');
	for(var i = 0; i < collection.length; ++i){
		collection[i].MaterialTextfield.change();
	}
	document.getElementById('pe-title-text').textContent = 'Add Period';
	_flagDeleted = false;
}

function addSinglePeriod(type){
	var day = getActiveTab();
	var period = {};
	period.name = escapeHtml(document.getElementById('pe-name').value);
	period.location = escapeHtml(document.getElementById('pe-location').value);
	period.teacher = escapeHtml(document.getElementById('pe-teacher').value);
	period.color = escapeHtml(document.getElementsByClassName('pe-col-selected')[0].style.backgroundColor);
	period.from = getTime(escapeHtml(document.getElementById('pe-from').value));
	period.to = getTime(escapeHtml(document.getElementById('pe-to').value));

	if(!(period.from && period.to)){
		showError('To time must be in hh:mm am (or pm) format');
		return false;
	}

	if(period.name.length <= 0 || period.location.length <= 0 ||
	   period.teacher.length <= 0 || period.color.length <= 0){
		showError('Feild cannot be empty, try again');
		return false;
	}

	console.log('Trying to add period');

	if(userPeriods.periods[day] == undefined){
		console.log('Had to create index '+ day);
		userPeriods.periods[day] = [];
		console.log(userPeriods);
	}

	if(type == 'add'){
		userPeriods.periods[day].push(period);
		saveRoutine(userPeriods.periods);
		console.log('added' + userPeriods);
	} else if(type == 'replace') {
		var toReplace = arguments[1];
		console.log('Replaced period');
		userPeriods.periods[day][toReplace] = period;
		saveRoutine(userPeriods.periods);
	}

	resetAddBox();
	hideAddBox();
}

function sortPeriods (periodObject) {
	for(var day in periodObject){
		if(_days.indexOf(day) != -1){
			periodObject[day].sort(agtb_time);
		}
	}
}

function clearPeriods () {
	var elements = document.getElementsByClassName('periodlister');
	for(var i=0; i<elements.length; ++i) {
		while(elements[i].firstChild){
			elements[i].removeChild(elements[i].firstChild);
		}
	}
	return true;
}

function addAllPeriods (periodObject) {
	var count = 0;
	sortPeriods(periodObject);
	clearPeriods();
	for(var day in periodObject)
		if(_days.indexOf(day) != -1){
			count = 0;
			for(var i = 0; i < periodObject[day].length; ++i)
				addRoutine(periodObject[day][i], day, count++);
		}
}

function saveRoutine (periodObject) {
	firebase.firestore().collection('users').doc(currentUser.uid).collection('routine').doc('all').set({
		periods: periodObject
	}).then(function() {
		console.log('Write successful!');
		refreshUserData();
	}).catch(function(error) {
		showError('Cannot reach network. Try again later');
		console.log(error);
	});
}