const socket = io();

const displayMessagesDiv = document.getElementById('response-messages')

socket.emit('admin-messages')
socket.on('display-messages',allMessages=>{
    allMessages.forEach(message => {
        appendMessage(message)
    });
    console.log(allMessages);
})

function appendMessage(message){
    let myDiv = document.createElement('div');
    myDiv.innerText = message;
    displayMessagesDiv?.append(myDiv); 
}
