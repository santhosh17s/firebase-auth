var app = new Vue({
  el: "#app",
  data: {
    requests: [],
  },
  methods: {
    upVoteRequest(id) {
      //console.log(id)
      const upVotes = firebase.functions().httpsCallable('upvote');
      upVotes({ id })
        .catch( error => {
          //console.log(error.messsage);
          showingMessage(error.message);
        })
    }
  },
  mounted() {
    const ref = firebase.firestore().collection("requests");
    ref.onSnapshot((snapshot) => {
      let requests = [];
      snapshot.forEach((doc) => {
        requests.push({ ...doc.data(), id: doc.id });
      });
      this.requests = requests;
    });
  },
});
