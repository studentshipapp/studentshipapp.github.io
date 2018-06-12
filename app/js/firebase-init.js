var config = {
	apiKey: "AIzaSyANT4EpshJExss64j6_ZPL-ehLOyQPgOxQ",
	authDomain: "st-info.firebaseapp.com",
	databaseURL: "https://st-info.firebaseio.com",
	projectId: "st-info",
	storageBucket: "st-info.appspot.com",
	messagingSenderId: "64383851995"
};

firebase.initializeApp(config);

firebase.firestore().enablePersistence()
  .then(function() {
      // Initialize Cloud Firestore through firebase
      var db = firebase.firestore();
  })
  .catch(function(err) {
      if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
      } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
      }
  });
