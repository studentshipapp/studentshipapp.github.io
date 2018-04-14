// FirebaseUI Config
var uiConfig = {
	signInSuccessUrl: './app/attendance.html',
	signInFlow: 'popup',
	signInOptions: [
		firebase.auth.GoogleAuthProvider.PROVIDER_ID,
	],
	tosUrl: 'https://studentshipapp.github.io/tsandcs/index.html'
};

// Initialize FirebaseUI
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', uiConfig);

// Redirect on Log In
initApp = function() {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			window.location.href = 'http://studentshipapp.github.io/app/attendance.html';
		}
	}, function(error) {
		console.log(error);
	});
};
window.addEventListener('load', function() { initApp() });
