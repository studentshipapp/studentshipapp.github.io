var userAssignments = {};
var _justDeleted = {};
var _justDone = null;
var _toEdit = null;
var _flagDeleted = false;
var _flagMADone = false;

function initUI(){
	if(!document.getElementById('uiLoader').classList.contains('hidden'))
		document.getElementById('uiLoader').classList.add('hidden');

	firebase.firestore().collection('users').doc(currentUser.uid).collection('assignment').doc('all').get().then(function(doc){
		if(doc.exists) {
			userAssignments = doc.data();

			if(userAssignments.assignments.length > 0) {
				hideNoAssgn();
			} else {
				showNoAssgn();
			}

			if(!document.getElementById('done-label').classList.contains('hidden'))
				document.getElementById('done-label').classList.add('hidden');

			displayAssignments();
			console.log('Fetched routine');
		} else {
			showError('User data not found in database');
			console.log('Document not found in collection for user, contact admin @therdas');
			userAssignments = null;
		}
	}).catch(function(error){
		showError('Something went wrong');
		console.log(error);
		userAssignments = null;
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

function saveAssignments(assnobj){
	firebase.firestore().collection('users').doc(currentUser.uid).collection('assignment').doc('all').set({
		assignments: assnobj
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
	dateSubmission.innerHTML = 'Submit by ' + moment(obj.submitBy, 'D/M/YYYY').format('MMMM Do, YYYY');
	info.appendChild(dateSubmission);

	var name = document.createElement('h2');
	name.classList.add('name');
	name.innerHTML = obj.name;
	info.appendChild(name);

	var teacher = document.createElement('span');
	teacher.classList.add('teacher');
	teacher.innerHTML = obj.teacher;
	info.appendChild(teacher);

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
	givendate.innerHTML = 'Given on ' + moment(obj.given, 'D/M/YYYY').format('MMMM Do, YYYY') + ' ';
	givendate.style.opacity = '0.6';
	extrainfo.appendChild(givendate);

	var descp = document.createElement('span');
	descp.classList.add('description');
	descp.innerHTML = obj.description;
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

function displayAssignments() {
	var cont1 = document.getElementById('asn-container');
	var cont2 = document.getElementById('asn-done-container');
	while(cont1.firstChild)
		cont1.removeChild(cont1.firstChild);
	while(cont2.firstChild)
		cont2.removeChild(cont2.firstChild);

	userAssignments.assignments.sort(function(a, b){
		if( moment(a.submitBy, 'D/M/YYYY').isAfter(moment(b.submitBy, 'D/M/YYYY')))
			return 1;

		if( moment(a.submitBy, 'D/M/YYYY').isSame(moment(b.submitBy, 'D/M/YYYY')))
			return 0;

		if(moment(a.submitBy, 'D/M/YYYY').isBefore(moment(b.submitBy, 'D/M/YYYY')))
			return -1;

		return 0;
	})

	for(var i = 0; i<userAssignments.assignments.length; ++i)
		displayAssignment(userAssignments.assignments[i], i);
}
/*
**  Add and edit element
*/

function addAssignment(mode, index) {
	if(!moment(escapeHtml(document.getElementById('at-submit-on').value), 'D/M/YYYY').isValid()){
		showError('Date must be of format D/M/YYYY');
		return false;
	}

	if(!moment(escapeHtml(document.getElementById('at-given').value), 'D/M/YYYY').isValid()){
		showError('Date must be of format D/M/YYYY');
		return false;
	}

	var assignment = {};
	assignment.description = escapeHtml(document.getElementById('at-desc').value);
	assignment.doneFlag = document.getElementById('at-done').parentNode.classList.contains('is-checked');
	assignment.name = escapeHtml(document.getElementById('at-name').value);
	assignment.submitBy = moment(escapeHtml(document.getElementById('at-submit-on').value), 'D/M/YYYY').format('D/M/YYYY');
	assignment.given = moment(escapeHtml(document.getElementById('at-given').value), 'D/M/YYYY').format('D/M/YYYY');
	assignment.teacher = escapeHtml(document.getElementById('at-teacher').value);
	assignment.color = escapeHtml(document.getElementsByClassName('at-col-selected')[0].style.backgroundColor);

	if(assignment.description.length <= 0 || assignment.name.length <= 0 || assignment.submitBy.length <= 0 ||
	   assignment.given.length <= 0 || assignment.teacher.length <= 0) {
		showError('Feild cannot be empty, try again');
		return false;
	}


	console.log('Trying to add assignment...');

	if(mode == 'add'){
		userAssignments.assignments.push(assignment);
		saveAssignments(userAssignments.assignments);
		console.log('Added' + assignment);
	} else if(mode == 'replace') {
		var toReplace = arguments[1];
		console.log('Replaced period');
		userAssignments.assignments[toReplace] = assignment;
		saveAssignments(userAssignments.assignments);
	}

	resetAddBox();
	hideAddBox();
}

/*
**  Deletion and Undo
*/

function deleteAssignment(index) {
	_justDeleted = userAssignments.assignments[index];
	_flagDeleted = true;
	userAssignments.assignments.splice(index, 1);
	saveAssignments(userAssignments.assignments);
	console.log('Deleted Assignment');
	console.log(_justDeleted);
	document.getElementById('errorbar').MaterialSnackbar.showSnackbar({
		message: 'Deleted Assignment',
		timeout: 3000,
		actionHandler: redoDelete,
		actionText: 'Undo'
	});
}

function redoDelete(){
	if(!_flagDeleted)
		return false;

	userAssignments.assignments.push(_justDeleted);
	saveAssignments(userAssignments.assignments);
}

/*
**  Mark and unmark as undone
*/

function doneAssignment(index) {
	_flagMADone = true;
	_justDone = index;
	userAssignments.assignments[index].doneFlag = true;
	saveAssignments(userAssignments.assignments);
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

	userAssignments.assignments[_justDone].doneFlag = false;
	saveAssignments(userAssignments.assignments);
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
	document.getElementById('at-done').parentNode.MaterialSwitch.off();

	if(document.getElementById('add-dialog').classList.contains('hidden'))
		document.getElementById('add-dialog').classList.remove('hidden');
	if(document.getElementById('dialog-shade').classList.contains('hidden'))
		document.getElementById('dialog-shade').classList.remove('hidden');

	if(mode == 'add') {
		if(document.getElementById('at-submit').classList.contains('hidden'))
			document.getElementById('at-submit').classList.remove('hidden');

		if(!document.getElementById('at-replace').classList.contains('hidden'))
			document.getElementById('at-replace').classList.add('hidden');
		if(!document.getElementById('at-delete').classList.contains('hidden'))
			document.getElementById('at-delete').classList.add('hidden');

	} else if(mode == 'replace'){
		var toEdit = userAssignments.assignments[num];
		console.log(toEdit);
		document.getElementById('at-title-text').textContent = 'Edit Assignment';
		if(toEdit.doneFlag == false) {
			document.getElementById('at-done').parentNode.MaterialSwitch.off();
		} else if(toEdit.doneFlag == true) {
			document.getElementById('at-done').parentNode.MaterialSwitch.on();
		}
		document.getElementById('at-name').parentNode.MaterialTextfield.change(unescapeHtml(toEdit.name));
		document.getElementById('at-given').parentNode.MaterialTextfield.change(unescapeHtml(toEdit.given));
		document.getElementById('at-submit-on').parentNode.MaterialTextfield.change(unescapeHtml(toEdit.submitBy));
		document.getElementById('at-teacher').parentNode.MaterialTextfield.change(unescapeHtml(toEdit.teacher));
		document.getElementById('at-desc').parentNode.MaterialTextfield.change(unescapeHtml(toEdit.description));

		var collection = document.getElementsByClassName('color-container-item');
		for(var i = 0; i<collection.length; ++i) {
			if(collection[i].style.backgroundColor == toEdit.color){
				setColAdd.apply(collection[i]);
			}
		}
		if(!document.getElementById('at-submit').classList.contains('hidden'))
			document.getElementById('at-submit').classList.add('hidden');

		if(document.getElementById('at-replace').classList.contains('hidden'))
			document.getElementById('at-replace').classList.remove('hidden');

		if(document.getElementById('at-delete').classList.contains('hidden'))
			document.getElementById('at-delete').classList.remove('hidden');
	}
}

for(var i = 0; i < document.getElementsByClassName('color-container-item').length; ++i) {
	document.getElementsByClassName('color-container-item')[i].addEventListener('click', setColAdd);
}

function setColAdd(e) {
	if(this.children.length > 0){
		if(this.children[0].classList.contains('material-icons'));
	} else {
		var checked = document.getElementsByClassName('at-col-selected')[0];
		checked.classList.remove('at-col-selected');
		checked.removeChild(checked.children[0]);
		var ck = document.createElement('i');
		ck.classList.add('material-icons');
		ck.textContent ='checked';
		this.appendChild(ck);
		this.classList.add('at-col-selected');
	};
	return true;
}

document.getElementById('addbtn').addEventListener('click', function(e){
	showAddBox('add');
});

document.getElementById('dialog-shade').addEventListener('click', function(e){
	hideAddBox();
});

document.getElementById('at-cancel').addEventListener('click', function(e){
	hideAddBox();
});

document.getElementById('at-submit').addEventListener('click', function(e){
	addAssignment('add');
});

document.getElementById('at-delete').addEventListener('click', function(e){
	deleteAssignment(_toEdit); 
	resetAddBox();
	hideAddBox();
});

document.getElementById('at-replace').addEventListener('click', function(e){
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