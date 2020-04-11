const requestModal = document.querySelector(".new-request");
const requestLink = document.querySelector(".add-request");
const requestForm = document.querySelector(".new-request form");

// open request modal
requestLink.addEventListener("click", () => {
  requestModal.classList.add("open");
});

// close request modal
requestModal.addEventListener("click", (e) => {
  if (e.target.classList.contains("new-request")) {
    requestModal.classList.remove("open");
  }
});

//request callable function
const btn = document.querySelector(".call");
btn.addEventListener("click", () => {
  const sayHello = firebase.functions().httpsCallable("sayHello");
  sayHello({ name: "santhosh" }).then((result) => {
    console.log(result.data);
  });
});

requestForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const addRequest = firebase.functions().httpsCallable("addRequest");
  addRequest({
    text: requestForm.request.value,
  })
    .then(() => {
      requestForm.reset();
      requestForm.querySelector(".error").textContent = "";
      requestModal.classList.remove("open");
    })
    .catch((error) => {
      requestForm.querySelector(".error").textContent = error.message;
    });
});


const notify = document.querySelector('.notifications');

let showingMessage = (message) => {
  notify.textContent = message;
  notify.classList.add('active');

  setTimeout( ()=> { 
    notify.classList.remove('active');
  }, 4000)
}

