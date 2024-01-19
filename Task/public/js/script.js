//User Registration Function
function saveData() {
    let userName = $("#name").val();
    let password = $("#password").val();

    userDetails = JSON.parse(localStorage.getItem("users")) || [];
    if (userDetails.some((user) => user.name === userName)) {
        alert("Name Already Exists");
    } else if (userName === "" || password === "") {
        alert("Invalid Credentials");
    } else {
        userDetails.push({
            "name": userName,
            "password": password
        })
        localStorage.setItem("users", JSON.stringify(userDetails));
    }
    $("#name").val("");
    $("#password").val("");

    window.location.href = "login.html";
}

//Login Functionality
function onLogin() {
    let loginName = $("#loginName").val();
    let loginPassword = $("#loginPassword").val();

    // If data is found in localStorage it retrieves the data values otherwise it returns an empty array
    let userDetails = JSON.parse(localStorage.getItem("users")) || [];

    let foundUser = userDetails.find((user) => user.name === loginName);
    let foundPassword = userDetails.find((user) => user.password === loginPassword);
    if (foundUser && foundPassword) {
        alert(`Found user ${loginName}`);


        localStorage.setItem("name", foundUser.name);

        window.location.href = "index.html";
    } else {
        alert("username or password is Not Found");
    }
    $("#loginName").val("");
    $("#loginPassword").val("");

}
//logout functionality
let logoutUser = document.getElementById("logoutUserAcc");
logoutUser.onclick = function () {
    localStorage.removeItem("name");
    window.location.href = "login.html";
}

// if the user is not logged in -> redirecting to login.html
let loggedInUser = localStorage.getItem("name");

if (!loggedInUser) {
    window.location.href = "login.html";
}

//Message Functionality
document.addEventListener("DOMContentLoaded", function () {
    loadUser();
    loadMessages();
    showChatHeadingName();
});


let selectedUserDiv = null;
function loadUser() {
    let userDetails = JSON.parse(localStorage.getItem("users")) || [];
    let usersContainer = document.getElementById("usersContainer");

    userDetails.forEach((user) => {
        let userDiv = document.createElement("div");
        userDiv.className = "userDiv";
        userDiv.className = "userDiv userItem "+user.name;
        userDiv.textContent = user.name;
        
        
        userDiv.addEventListener("click", function () {
            showchatBox(user.name);
            showChatHeadingName(userDiv);

        });
        if(user.name === loggedInUser){}
        else usersContainer.appendChild(userDiv);

    });
}

function loadMessages(userName) {
    let loggedInUser = localStorage.getItem("name");
    let userDetails = JSON.parse(localStorage.getItem("users")) || [];
    let selectedUser = localStorage.getItem("selectedUser");
    let user = userDetails.find((user) => user.name === selectedUser);

    if (user) {
        if(user.name === loggedInUser){}
        else displayMessages(user.messages, selectedUser);
    }
}

function displayMessages(messages, userName) {
    let chatBoxId = userName === "" ? "userChatBox" : "recipientChatBox";
    let chatBox = document.getElementById(chatBoxId);
    chatBox.innerHTML = "";

    if (messages && messages.length > 0) {
        let exchangeMessages = messages.filter((message) =>
            (message.sender === userName && message.receiver === loggedInUser) ||
            (message.sender === loggedInUser && message.receiver === userName)
        );
        if (exchangeMessages.length > 0) {
            exchangeMessages.forEach((message) => {
                let messageElement = document.createElement("div");
                if (message.sender === loggedInUser) messageElement.className = "sendMsgDiv";
                else messageElement.className = "recieveMsgDiv";
                
                messageElement.innerHTML = `<strong>${message.sender}</strong><br> ${message.message}`;

                let timeElement = document.createElement("span");
                timeElement.className = "time";
                timeElement.textContent = message.time;
                messageElement.appendChild(timeElement);
                chatBox.appendChild(messageElement);
                
            });
        } else {
            let noMessageElement = document.createElement("div");
            noMessageElement.innerHTML = "No messages exchanged";
            chatBox.appendChild(noMessageElement);
        }
    } else {
        let noMessageElement = document.createElement("div");
        noMessageElement.innerHTML = "No messages";
        chatBox.appendChild(noMessageElement);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

function showchatBox(userName) {
    let usersContainer = document.getElementById("usersContainer");

    usersContainer.value = userName;
    localStorage.setItem("selectedUser",userName);
    
    document.getElementById("userChatBox").style.display = "none";
    document.getElementById("recipientChatBox").style.display = "none";

    if (userName === "") {
        document.getElementById("userChatBox").style.display = "block";
    } else {
        document.getElementById("recipientChatBox").style.display = "block";
    }
    loadMessages(userName);
}

function sendMessage() {
    let loggedInUser = localStorage.getItem("name");
    let usersContainer = document.getElementById("usersContainer");
    let receiverName = usersContainer.value;

    let messageInput = document.getElementById("messageInput");
    let message = messageInput.value;


    if (message.trim() === "") {
        return;
    }

    let userDetails = JSON.parse(localStorage.getItem("users")) || [];
    let sender = userDetails.find((user) => user.name === loggedInUser);
    let receiver = userDetails.find((user) => user.name === receiverName);

    if (sender && receiver) {
        //showing the message sent time
        let dateTime = new Date();
        let currTime = dateTime.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});

        // Adding the message to both sender and receiver
        sender.messages = sender.messages || [];
        sender.messages.push({ sender: loggedInUser, receiver: receiverName, message: message,time:currTime});

        receiver.messages = receiver.messages || [];
        receiver.messages.push({ sender: loggedInUser, receiver: receiverName, message: message,time:currTime});

        localStorage.setItem("users", JSON.stringify(userDetails));
        loadMessages(receiverName); // Passing the receiverName to loadMessages

    } else {
        alert("Sender or recipient not found");
    }

    // Clearing the message input
    messageInput.value = "";
}

function showChatHeadingName(userDiv){
    let chatHeadingName = document.getElementById("chatHeadingName");
    chatHeadingName.textContent = localStorage.getItem("selectedUser");

    if (selectedUserDiv) {
        selectedUserDiv.style.backgroundColor = "";
        selectedUserDiv.style.color = "#000"
    }

    // Set background color for the currently selected user div
    if (userDiv) {
        userDiv.style.backgroundColor = "green";
        userDiv.style.color = "#fff";
        selectedUserDiv = userDiv;
        localStorage.setItem("selectedUserColor", "green");
    }

    window.addEventListener('load', function () {
        let selectedUserColor = localStorage.getItem("selectedUserColor");
        if (selectedUserColor && selectedUserDiv) {
            selectedUserDiv.style.backgroundColor = selectedUserColor;
        }
        let selectedUserName = localStorage.getItem("selectedUser");
    let userDiv = document.querySelector(".userItem." + selectedUserName);
    showChatHeadingName(userDiv);
    });
}

document.getElementById("messageInput").addEventListener("keydown",function(event){
    if(event.key === "Enter"){
        sendMessage();
    }
});

