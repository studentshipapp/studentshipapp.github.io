var userExams = {};
var _justDeleted = {};
var _justDone = null;
var _toEdit = null;
var _flagDeleted = false;
var _flagMADone = false;

function initUI(){
	if(!document.getElementById('uiLoader').classList.contains('hidden'))
		document.getElementById('uiLoader').classList.add('hidden');

	firebase.firestore().collection('users').doc(currentUser.uid).collection('exam').doc('all').get().then(function(doc){
		if(doc.exists) {
			userExams = doc.data();

			if(userExams.exams.length > 0) {
				hideNoAssgn();
			} else {
				showNoAssgn();
			}

			if(!document.getElementById('done-label').classList.contains('hidden'))
				document.getElementById('done-label').classList.add('hidden');

			displayExams();
			console.log('Fetched routine');
		} else {
			showError('User data not found in database');
			console.log('Document not found in collection for user, contact admin @therdas');
			userExams = null;
		}
	}).catch(function(error){
		showError('Something went wrong');
		console.log(error);
		userExams = null;
	});
}

function hideNoAssgn () {
	if(!document.getElementById('empty-maker').classList.contains('hidden'))
		document.getElementById('empty-maker').classList.add('hidden');

	if(document.getElementById('asn-container').classList.contains('hidden'))
		document.getElementById('asn-container').classList.remove('hidden');

	if(document.getElementById('asn-done-container').classList.contains('hidden'))
		document.getElementById('asn-done-container').classList.remove('hidden');
}

function showNoAssgn () {
	if(document.getElementById('empty-maker').classList.contains('hidden'))
		document.getElementById('empty-maker').classList.remove('hidden');

	if(!document.getElementById('asn-container').classList.contains('hidden'))
		document.getElementById('asn-container').classList.add('hidden');
	
	if(!document.getElementById('asn-done-container').classList.contains('hidden'))
		document.getElementById('asn-done-container').classList.add('hidden');
}

function saveExams(examobj){
	firebase.firestore().collection('users').doc(currentUser.uid).collection('exam').doc('all').set({
		exams: examobj
	}).then(function(){
		console.log('Successfully saved!');
		refreshUserData();
	}).catch(function(error) {
		showError('Cannot reach to network. Try again later');
		console.log(error);
	});
}

function handleEditBtn(){
	showAddBox('replace', this.parentNode.parentNode.getAttribute('data-count'));
	_toEdit = this.parentNode.parentNode.getAttribute('data-count');
}

function handleCheckBtn(){
	doneAssignment(this.parentNode.parentNode.getAttribute('data-count'));
}

function handleDeleteBtn(){
	deleteAssignment(this.parentNode.parentNode.getAttribute('data-count'));
}

function displayAssignment(obj, count){
	var container = document.createElement('div');
	container.classList = 'mdl-shadow--2dp asn-card';

	if(count != undefined)
		container.setAttribute('data-count', count);

	var info = document.createElement('span');
	info.style.backgroundColor = obj.color;
	if(obj.doneFlag == true) {
		info.style.opacity = '0.6';
	}
	info.classList = 'info';

	var dateSubmission = document.createElement('span');
	dateSubmission.classList = 'date';
	dateSubmission.innerHTML = 'On ' + moment(obj.date, 'D/M/YYYY').format('MMMM Do, YYYY');
	info.appendChild(dateSubmission);

	var name = document.createElement('h2');
	name.classList.add('name');
	name.innerHTML = obj.name;
	info.appendChild(name);

	var teacher = document.createElement('span');
	teacher.classList.add('teacher');
	teacher.innerHTML = obj.teacher;
	var location = document.createElement('span');
	location.classList.add('location');
	location.innerHTML = obj.location;
	info.appendChild(teacher);
	info.appendChild(location);

	var editbtn = document.createElement('button');
	editbtn.classList = 'mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon asn-card-editbtn';
		var editicn = document.createElement('i');
		editicn.classList.add('material-icons');
		editicn.innerHTML = 'edit';
		editbtn.appendChild(editicn);
	editbtn.addEventListener('click', handleEditBtn);
	info.appendChild(editbtn);

	if(obj.doneFlag == false) {
		var checkbtn = document.createElement('button');
		checkbtn.classList = 'mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon asn-card-donebtn';
			var checkicn = document.createElement('i');
			checkicn.classList.add('material-icons');
			checkicn.innerHTML = 'checked';
			checkbtn.appendChild(checkicn);
		checkbtn.addEventListener('click', handleCheckBtn);
		info.appendChild(checkbtn); 
	} else {
		var deletebtn = document.createElement('button');
		deletebtn.classList = 'mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon asn-card-deletebtn';
			var deleteicn = document.createElement('i');
			deleteicn.classList.add('material-icons');
			deleteicn.innerHTML = 'delete';
			deletebtn.appendChild(deleteicn);
		deletebtn.addEventListener('click', handleDeleteBtn);
		info.appendChild(deletebtn);
	}

	container.appendChild(info);

	var extrainfo = document.createElement('span');
	extrainfo.classList.add('extra-info');

	var givendate = document.createElement('span');
	givendate.classList.add('timing');
	givendate.innerHTML = 'Timing: '
	var gvdInner = document.createElement('span');
	gvdInner.innerHTML = obj.timing;
	givendate.appendChild(gvdInner);
	extrainfo.appendChild(givendate);

	var descp = document.createElement('span');
	descp.classList.add('syllabus');
	descp.textContent = 'Syllabus: '
	var descpSyl = document.createElement('span');
	descpSyl.innerHTML = obj.syllabus;
	descp.appendChild(descpSyl);
	extrainfo.appendChild(descp);

	container.appendChild(extrainfo);

	if(obj.doneFlag == false){
		document.getElementById('asn-container').appendChild(container);
	} else if(obj.doneFlag == true) {
		document.getElementById('asn-done-container').appendChild(container);
		if(document.getElementById('done-label').classList.contains('hidden'))
			document.getElementById('done-label').classList.remove('hidden');
	}
}

function displayExams() {
	var cont1 = document.getElementById('asn-container');
	var cont2 = document.getElementById('asn-done-container');
	while(cont1.firstChild)
		cont1.removeChild(cont1.firstChild);
	while(cont2.firstChild)
		cont2.removeChild(cont2.firstChild);

	userExams.exams.sort(function(a, b){
		if( moment(a.submitBy, 'D/M/YYYY').isAfter(moment(b.submitBy, 'D/M/YYYY')))
			return 1;

		if( moment(a.submitBy, 'D/M/YYYY').isSame(moment(b.submitBy, 'D/M/YYYY')))
			return 0;

		if(moment(a.submitBy, 'D/M/YYYY').isBefore(moment(b.submitBy, 'D/M/YYYY')))
			return -1;

		return 0;
	})

	for(var i = 0; i<userExams.exams.length; ++i)
		displayAssignment(userExams.exams[i], i);
}
/*
**  Add and edit element
*/

function addAssignment(mode, index) {
	if(!moment(escapeHtml(document.getElementById('ex-date').value), 'D/M/YYYY').isValid()){
		showError('Date must be of format D/M/YYYY');
		return false;
	}

	var exam = {};
	exam.syllabus = escapeHtml(document.getElementById('ex-syllabus').value);
	exam.doneFlag = document.getElementById('ex-done').parentNode.classList.contains('is-checked');
	exam.name = escapeHtml(document.getElementById('ex-name').value);
	exam.date = moment(escapeHtml(document.getElementById('ex-date').value), 'D/M/YYYY').format('D/M/YYYY');
	exam.timing = escapeHtml(document.getElementById('ex-timing').value);
	exam.location = escapeHtml(document.getElementById('ex-location').value);
	exam.teacher = escapeHtml(document.getElementById('ex-teacher').value);
	exam.color = escapeHtml(document.getElementsByClassName('ex-col-selected')[0].style.backgroundColor);

	if(exam.syllabus.length <= 0 || exam.name.length <= 0 || exam.timing.length <= 0 ||
	   exam.date.length <= 0 || exam.teacher.length <= 0 || exam.location.length <=0) {
		showError('Field cannot be empty, try again');
		return false;
	}


	console.log('Trying to add assignment...');

	if(mode == 'add'){
		userExams.exams.push(exam);
		saveExams(userExams.exams);
		console.log('Added' + exam);
	} else if(mode == 'replace') {
		var toReplace = arguments[1];
		console.log('Replaced period');
		userExams.exams[toReplace] = exam;
		saveExams(userExams.exams);
	}

	resetAddBox();
	hideAddBox();
}

/*
**  Deletion and Undo
*/

function deleteAssignment(index) {
	_justDeleted = userExams.exams[index];
	_flagDeleted = true;
	userExams.exams.splice(index, 1);
	saveExams(userExams.exams);
	console.log('Deleted Exam');
	console.log(_justDeleted);
	document.getElementById('errorbar').MaterialSnackbar.showSnackbar({
		message: 'Deleted Exam',
		timeout: 3000,
		actionHandler: redoDelete,
		actionText: 'Undo'
	});
}

function redoDelete(){
	if(!_flagDeleted)
		return false;

	userExams.exams.push(_justDeleted);
	saveExams(userExams.exams);
}

/*
**  Mark and unmark as undone
*/

function doneAssignment(index) {
	_flagMADone = true;
	_justDone = index;
	userExams.exams[index].doneFlag = true;
	saveExams(userExams.exams);
	console.log('Marked as done');
	document.getElementById('errorbar').MaterialSnackbar.showSnackbar({
		message: 'Marked as done',
		timeout: 3000,
		actionHandler: redoDone,
		actionText: 'Undo'
	});
}

function redoDone(){
	if(!_flagMADone)
		return false;

	userExams.exams[_justDone].doneFlag = false;
	saveExams(userExams.exams);
}

/*
**	SET UP Dialog
*/

function resetAddBox(){
	var collection = document.getElementsByClassName('mdl-textfield');
	for(var i = 0; i < collection.length; ++i){
		collection[i].MaterialTextfield.change();
	}
}

function hideAddBox(){
	if(!document.getElementById('add-dialog').classList.contains('hidden'))
		document.getElementById('add-dialog').classList.add('hidden');
	if(!document.getElementById('dialog-shade').classList.contains('hidden'))
		document.getElementById('dialog-shade').classList.add('hidden');
}

function showAddBox(mode, num){
	resetAddBox();
	document.getElementById('ex-done').parentNode.MaterialSwitch.off();

	if(document.getElementById('add-dialog').classList.contains('hidden'))
		document.getElementById('add-dialog').classList.remove('hidden');
	if(document.getElementById('dialog-shade').classList.contains('hidden'))
		document.getElementById('dialog-shade').classList.remove('hidden');

	if(mode == 'add') {
		if(document.getElementById('ex-submit').classList.contains('hidden'))
			document.getElementById('ex-submit').classList.remove('hidden');

		if(!document.getElementById('ex-replace').classList.contains('hidden'))
			document.getElementById('ex-replace').classList.add('hidden');
		if(!document.getElementById('ex-delete').classList.contains('hidden'))
			document.getElementById('ex-delete').classList.add('hidden');

	} else if(mode == 'replace'){
		var toEdit = userExams.exams[num];
		console.log(toEdit);
		document.getElementById('ex-title-text').textContent = 'Edit Assignment';
		if(toEdit.doneFlag == false) {
			document.getElementById('ex-done').parentNode.MaterialSwitch.off();
		} else if(toEdit.doneFlag == true) {
			document.getElementById('ex-done').parentNode.MaterialSwitch.on();
		}
		document.getElementById('ex-name').parentNode.MaterialTextfield.change(unescapeHtml(toEdit.name));
		document.getElementById('ex-date').parentNode.MaterialTextfield.change(unescapeHtml(toEdit.date));
		document.getElementById('ex-syllabus').parentNode.MaterialTextfield.change(unescapeHtml(toEdit.syllabus));
		document.getElementById('ex-teacher').parentNode.MaterialTextfield.change(unescapeHtml(toEdit.teacher));
		document.getElementById('ex-timing').parentNode.MaterialTextfield.change(unescapeHtml(toEdit.timing));
		document.getElementById('ex-location').parentNode.MaterialTextfield.change(unescapeHtml(toEdit.location));

		var collection = document.getElementsByClassName('color-container-item');
		for(var i = 0; i<collection.length; ++i) {
			if(collection[i].style.backgroundColor == toEdit.color){
				setColAdd.apply(collection[i]);
			}
		}
		if(!document.getElementById('ex-submit').classList.contains('hidden'))
			document.getElementById('ex-submit').classList.add('hidden');

		if(document.getElementById('ex-replace').classList.contains('hidden'))
			document.getElementById('ex-replace').classList.remove('hidden');

		if(document.getElementById('ex-delete').classList.contains('hidden'))
			document.getElementById('ex-delete').classList.remove('hidden');
	}
}

for(var i = 0; i < document.getElementsByClassName('color-container-item').length; ++i) {
	document.getElementsByClassName('color-container-item')[i].addEventListener('click', setColAdd);
}

function setColAdd(e) {
	if(this.children.length > 0){
		if(this.children[0].classList.contains('material-icons'));
	} else {
		var checked = document.getElementsByClassName('ex-col-selected')[0];
		checked.classList.remove('ex-col-selected');
		checked.removeChild(checked.children[0]);
		var ck = document.createElement('i');
		ck.classList.add('material-icons');
		ck.textContent ='checked';
		this.appendChild(ck);
		this.classList.add('ex-col-selected');
	};
	return true;
}

document.getElementById('addbtn').addEventListener('click', function(e){
	showAddBox('add');
});

document.getElementById('dialog-shade').addEventListener('click', function(e){
	hideAddBox();
});

document.getElementById('ex-cancel').addEventListener('click', function(e){
	hideAddBox();
});

document.getElementById('ex-submit').addEventListener('click', function(e){
	addAssignment('add');
});

document.getElementById('ex-delete').addEventListener('click', function(e){
	deleteAssignment(_toEdit); 
	resetAddBox();
	hideAddBox();
});

document.getElementById('ex-replace').addEventListener('click', function(e){
	addAssignment('replace', _toEdit);
});


var sampleAssignment = [{
	submitBy: 'August 17, 2018',
	name: 'Practical on Dig El',
	teacher: 'AG Sir',
	given: 'February 9, 2018',
	color: 'cornflowerblue',
	description:' Submit the practical lapjks si naoif odin dnvoanl naod nd oandv onavdinvae oadniv dno woy eopiut adskf cvnm dlakjf ',
	doneFlag: true
},{
	submitBy: 'August 17, 2018',
	name: 'Practical on Dig El',
	teacher: 'AG Sir',
	given: 'February 9, 2018',
	color: 'cornflowerblue',
	description:' Submit the practical lapjks si naoif odin dnvoanl naod nd oandv onavdinvae oadniv dno woy eopiut adskf cvnm dlakjf ',
	doneFlag: false
}, {
	submitBy: 'August 17, 2018',
	name: 'Practical on Dig El',
	teacher: 'AG Sir',
	given: 'February 9, 2018',
	color: 'cornflowerblue',
	description:' Submit the practical lapjks si naoif odin dnvoanl naod nd oandv onavdinvae oadniv dno woy eopiut adskf cvnm dlakjf ',
	doneFlag: false
}, {
	submitBy: 'August 17, 2018',
	name: 'Practical on Dig El',
	teacher: 'AG Sir',
	given: 'February 9, 2018',
	color: 'cornflowerblue',
	description:' Submit the practical lapjks si naoif odin dnvoanl naod nd oandv onavdinvae oadniv dno woy eopiut adskf cvnm dlakjf ',
	doneFlag: false
}, {
	submitBy: 'August 17, 2018',
	name: 'Practical on Dig El',
	teacher: 'AG Sir',
	given: 'February 9, 2018',
	color: 'cornflowerblue',
	description:' Submit the practical lapjks si naoif odin dnvoanl naod nd oandv onavdinvae oadniv dno woy eopiut adskf cvnm dlakjf ',
	doneFlag: false
}, {
	submitBy: 'August 21, 2018',
	name: 'Practical on Dig El',
	teacher: 'AG Sir',
	given: 'February 9, 2018',
	color: 'cornflowerblue',
	description:' Submit the practical lapjks si naoif odin dnvoanl naod nd oandv onavdinvae oadniv dno woy eopiut adskf cvnm dlakjf ',
	doneFlag: false
}]