const socket = io();

// function to print your own message
function outputMessage(message) {
  const create_div = document.createElement('div')
  create_div.classList.add('message');
  create_div.innerHTML =
    `<div class="message-container">
    <p> ${message} </p>
  </div>`;
  document.querySelector('.chat-container')?.appendChild(create_div);
}

// function to print your message to everyone
function outputMessageOther(message) {
  const create_div = document.createElement('div')
  create_div.classList.add('message');
  create_div.innerHTML =
    `<div class="message-container user-message">
  <p> ${message} </p>
</div>`
  document.querySelector('.chat-container')?.appendChild(create_div);
}

function outputConnectionMessage(message) {
  const create_div = document.createElement('div')
  create_div.classList.add('message');
  create_div.innerHTML =
    `<div class="message-container connection-message">
  <p> ${message} </p>
</div>`
  document.querySelector('.chat-container')?.appendChild(create_div);
}
function main() {
  socket.on('join-message', message => {
    outputConnectionMessage(message);
  });
  socket.on('message-received', message => {
    outputMessage(message);
  });

  socket.on('message-other-received', message => {
    outputMessageOther(message);
  });

  let roomName = "channel1"
  socket.emit('join-room', roomName)
}
function getMessageFromChat() {
  const formulaire = document.getElementById('chat-form') as HTMLFormElement;

  const button = document.getElementById('send-btn');
  button?.addEventListener('click', function (event) {
    event.preventDefault();

    // prend la valeur du text écrit
    const input = formulaire.elements.namedItem("message-input") as HTMLInputElement;
    const real_input = input.value

    // Emit message toward server
    socket.emit('message-chat', real_input);
    input.value = "";
  })
 }

function getSignUpInfos() {
  const formulaire = document.getElementById('signup-form') as HTMLFormElement;

  const button = document.getElementById('signup-btn');
  button?.addEventListener('click', function (event) {
    //permet de ne pas refresh la page 
    // event.preventDefault();

    const name = formulaire.elements.namedItem("name") as HTMLInputElement;
    const username = formulaire.elements.namedItem("username") as HTMLInputElement;
    const password = formulaire.elements.namedItem("user-password") as HTMLInputElement;

    const real_name = name.value
    const real_username = username.value
    const real_password = password.value

    const object = {
      name: real_name,
      username: real_username,
      password: real_password
    }

    socket.emit('user-information', object);
  })
 }

// getting the info for creating private groups

function getPrivateGroupInfo() {
  const formulaire = document.getElementById('group-creation') as HTMLFormElement;

  const button = document.getElementById('group-btn');
  button?.addEventListener('click', function (event) {
    event.preventDefault();

    const gName = formulaire.elements.namedItem("group-name") as HTMLInputElement;

    const firstID = formulaire.elements.namedItem("firstID") as HTMLInputElement;
    const secondID = formulaire.elements.namedItem("secondID") as HTMLInputElement;
    const thirdID = formulaire.elements.namedItem("thirdID") as HTMLInputElement;
    const fourthID = formulaire.elements.namedItem("fourthID") as HTMLInputElement;

    const gNameValue = gName.value;

    const firstIDValue = firstID.value;
    const secondIDValue = secondID.value;
    const thirdIDValue = thirdID.value;
    const fourthIDValue = fourthID.value;

    const object = {
      groupName: gNameValue,
      firstId: firstIDValue,
      secondId: secondIDValue,
      thirdId: thirdIDValue,
      fourthId: fourthIDValue
    }
    socket.emit('grNameAndId', object);
  })
}

// getting the login connection information

function getLoginInfo() {
  const formulaire = document.getElementById('login-form') as HTMLFormElement;

  const button = document.getElementById('login-btn');
  button?.addEventListener('click', function (event) {
    // event.preventDefault()

    const username = formulaire.elements.namedItem("username") as HTMLInputElement;
    const password = formulaire.elements.namedItem("user-password") as HTMLInputElement;

    const real_username = username.value
    const real_password = password.value

    const object = {
      username: real_username,
      password: real_password
    }

    socket.emit('checkIfAccountExist', object);
  })
}


function getGroupInfos() {
  const formulaire = document.getElementById('group-creation') as HTMLFormElement;

  const button = document.getElementById('group-btn');
  button?.addEventListener('click', function (event) {
    event.preventDefault();

    // prend la valeur du text écrit
    const input = formulaire.elements.namedItem("group-name") as HTMLInputElement;
    const username_private = input.value

    // Emit message toward server
    socket.emit('username-private', username_private);
  })
}



// Action avec le boutton submit
document.addEventListener('DOMContentLoaded', function () {
  getMessageFromChat();
  getSignUpInfos();
  getLoginInfo();
  
});



main();