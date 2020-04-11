const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

//request 1
exports.randomNumber = functions.https.onRequest((request, response) => {
  const number = Math.round(Math.random() * 100);
  console.log(number);
  response.send(number.toString());
});

//request 2
exports.toTheDojo = functions.https.onRequest((request, response) => {
  response.redirect("https://www.google.com/");
});

//http callable functions
exports.sayHello = functions.https.onCall((data, context) => {
  const name = data.name;
  return `Hello, ${name}`;
});

//Auth trigger (new user signup)
exports.newUserSignup = functions.auth.user().onCreate((user) => {
  //console.log('New User signup', user.email, user.uid);
  return admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    upVotedOn: [],
  });
});

//Auth trigger (user delete)
exports.userDelete = functions.auth.user().onDelete((user) => {
  //console.log('User Delete', user.email, user.uid);
  const doc = admin.firestore().collection("users").doc(user.uid);
  return doc.delete();
});

//http callable function (adding request)
exports.addRequest = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can add requests"
    );
  }
  if (data.text.length > 30) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "request must be no more than 29 char"
    );
  }
  return admin.firestore().collection("requests").add({
    text: data.text,
    upVotes: 0,
  });
});

// // upvote callable function
exports.upvote = functions.https.onCall(async (data, context) => {
  // check auth state
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can vote up requests"
    );
  }
  // get refs for user doc & request doc
  const user = admin.firestore().collection("users").doc(context.auth.uid);
  const request = admin.firestore().collection("requests").doc(data.id);

  const doc = await user.get();

  // check thew user hasn't already upvoted
  //console.log(doc.data());
  if (doc.data().upVotedOn.includes(data.id)) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "You can only vote something up once"
    );
  }

  // update the array in user document
  await user.update({
    upVotedOn: [...doc.data().upVotedOn, data.id],
  });

  // update the votes on the request
  return request.update({
    upVotes: admin.firestore.FieldValue.increment(1),
  });
});

//Firestore trigger for tracking activity
exports.logActivities = functions.firestore
  .document("/{collection}/{id}")
  .onCreate((snap, context) => {
    console.log(snap.data());

    const collection = context.params.collection;
    const id = context.params.id;

    const activities = admin.firestore().collection("activities");

    if (collection === "requests") {
      return activities.add({ text: "a new tutorial requests was added" });
    }
    if (id === "users") {
      return activities.add({ text: "a new user was added" });
    }

    return null;
  });
