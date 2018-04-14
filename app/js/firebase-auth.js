var currentUser;
var userData;
var db = firebase.firestore();
var variables = {
	site: 'https://studentshipapp.github.io',
	usernameContainer: 'dw-name',
	emailContainer: 'dw-email',
	profilePicConainer: 'dw-pic',
	logOutContainer: 'dw-signout'
}

initApp = function() {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			currentUser = firebase.auth().currentUser;
			displayUserInfoInDrawer(currentUser);
			//get User info
			var qr = firebase.firestore().collection('users').doc(currentUser.uid);
			qr.get().then(function(doc){
				if(doc.exists) {
					userData = doc.data();
					initUI();
					console.log('Fetched user data');
				} else {
					console.log('Trying to register user');

					firebase.firestore().collection('users').doc(currentUser.uid).set({
						attendanceArray: []
					}).then(function () {
						console.log('Registered new user');
						qr.get().then(function(doc){
							if(doc.exists){
								userData = doc.data();
							}
						});
						initUI();
						console.log('Fetched user data');
						showError('Registered as new user!');
					}).catch(function(error) {
						showError('Something went wrong');
						console.log('Error: ' + error);
						userData = null;
					});
					
					console.log('Creating Datastructures');
					qr.collection('routine').doc('all').set({periods: {}});
					qr.collection('exam').doc('all').set({exams: []});
					qr.collection('assignment').doc('all').set({assignments: []});
					console.log('Initiliazed Datastructures');
				}
			}).catch(function(error){
				userData = null;
				showError('Something went wrong');
				console.log(error);
			});
		} else {
			// User is signed out.
			currentUser = null;
			userData = null;
			showError('Logging Out');
			window.location.href = variables.site;
		}
	}, function(error) {
		showError('Something went wrong');
		console.log(error);
	});
};

function refreshUserData() {
	var qr = firebase.firestore().collection('users').doc(currentUser.uid);
	qr.get().then(function(doc){
		if(doc.exists) {
			userData = doc.data();
			initUI();
			console.log('Refreshed user data');
		} else {
			showError('Can\t find user data in database');
			console.log('User not properly registered');
		}
	}).catch(function(error){
		userData = null;
		console.log(error);
	});
}

function displayUserInfoInDrawer(user) {
	document.getElementById(variables.usernameContainer).textContent = user.displayName;
	document.getElementById(variables.emailContainer).textContent = user.email;
	document.getElementById(variables.profilePicConainer).src = user.photoURL;
}

window.addEventListener('load', function() {
	initApp();
	document.getElementById(variables.logOutContainer).addEventListener('click', function(event) {
		firebase.auth().signOut();
	});
});

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function unescapeHtml(text) {
	var map = {
    '&amp;' : '&',
    '&lt;' : '<',
    '&gt;' : '>',
    '&quot;' : '"',
    '&#039;': "'" 
  };

  return text.replace(/(&amp;|&lt;|&gt;|&#039;|&quot;)/g, function(m) { return map[m]; });
}

function showError(str) {
	document.getElementById('errorbar').MaterialSnackbar.showSnackbar({
		message: str
	});
}