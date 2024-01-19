        document.addEventListener('DOMContentLoaded', () => {
            const loginForm = document.getElementById('loginForm');
            const loginContainer = document.getElementById('loginContainer');
            const messagingContainer = document.getElementById('messagingContainer');
            const welcomeMessage = document.getElementById('welcomeMessage');
            const userListContainer = document.getElementById('userListContainer');
            const messageList = document.getElementById('messageList');
            const messageInput = document.getElementById('messageInput');
            const messageForm = document.getElementById('messageForm');
            const loginButton = document.getElementById('loginButton');
            const sendMessageButton = document.getElementById('sendMessageButton');
            const userList = document.getElementById('userList');

            loginForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevent form submission
                login();
            });

            let currentUser = null;

            const storedUser = JSON.parse(localStorage.getItem('currentUser'));
            if (storedUser) {
                currentUser = storedUser;
                displayMessages();
            }

            loginButton.addEventListener('click', login);
            sendMessageButton.addEventListener('click', sendMessage);
            logoutButton.addEventListener('click', logout);

            function login() {
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                if (username.trim() === '' || password.trim() === '') {
                    console.log("Please enter both username and password.");
                    return;
                }
                // Check if user exists in localStorage
                let storedUser = JSON.parse(localStorage.getItem(username));
                if (storedUser && storedUser.password === password) {
                    currentUser = storedUser;
                    console.log("User successfully logged in:", currentUser);
                    displayMessages();
                    displayUserList();
                    loginContainer.style.display = 'none';
                    messagingContainer.style.display = 'block';
                    // Periodically check for new messages
                    setInterval(() => {
                        displayMessages();
                    }, 1000); // Check every 5 seconds (adjust as needed)
                } else {
                    console.log("Login failed. Creating a new user.");
                    // If the user does not exist, create a new user
                    storedUser = {
                        username,
                        password,
                        messages: []
                    };
                    localStorage.setItem(username, JSON.stringify(storedUser));
                    currentUser = storedUser;
                    console.log("New user created:", currentUser);
                    displayMessages();
                    displayUserList();
                    loginContainer.style.display = 'none';
                    messagingContainer.style.display = 'block';
                    // Periodically check for new messages
                    setInterval(() => {
                        displayMessages();
                    }, 1000); // Check every 5 seconds (adjust as needed)
                }
                // Save user information to local storage
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                // Display welcome message and user list
                displayLoggedInState();

                // Display welcome message
                welcomeMessage.innerHTML = <p>Welcome, ${currentUser.username}!</p>;
                // Display user list
                displayUserListContainer();
                // Clear input fields
                $('#username').val("");
                $('#password').val("");
                // Display messages for the selected user
                displayMessages();
            }

            function displayLoggedInState() {
                welcomeMessage.innerHTML = <p>Welcome, ${currentUser.username}!</p>;
                displayUserListContainer();
                loginContainer.style.display = 'none';
                messagingContainer.style.display = 'block';
                // Display messages for the selected user
                displayMessages();
            }

            // Add an event listener for the userList dropdown
            userList.addEventListener('change', () => {
                const selectedUser = userList.value;
                if (selectedUser) {
                    openChat(selectedUser);
                }
            });

            function displayUserListContainer() {
                userListContainer.innerHTML = '<h1 class="contact">Contacts</h1>';
                const userListDiv = document.createElement('div');
                userListDiv.id = 'userListDiv';

                // Get all users from localStorage
                for (let i = 0; i < localStorage.length; i++) {
                    const username = localStorage.key(i);

                    // Exclude the current user from the user list
                    if (username !== currentUser.username) {
                        const userItem = document.createElement('div');
                        userItem.className = 'user-list-item';
                        userItem.textContent = username;
                        userItem.addEventListener('click', () => openChat(username));
                        userListDiv.appendChild(userItem);
                    }
                }

                userListContainer.appendChild(userListDiv);
            }

            function sendMessage() {
                const recipient = userList.value;
                const messageText = messageInput.value;
                if (recipient && messageText.trim() !== '') {
                    const newMessage = {
                        sender: currentUser.username,
                        receiver: recipient,
                        text: messageText,
                        timestamp: new Date().toLocaleString()
                    };

                    // Retrieving the stored message from the localStorage for the recipient
                    const recipientUser = JSON.parse(localStorage.getItem(recipient));
                    if (!recipientUser.messages) {
                        recipientUser.messages = [];
                    }

                    recipientUser.messages.push(newMessage);
                    localStorage.setItem(recipient, JSON.stringify(recipientUser));

                    // Store the message in localStorage for the sender (for a chat-like experience)
                    currentUser.messages.push(newMessage);
                    localStorage.setItem(currentUser.username, JSON.stringify(currentUser));
                    // Clear previous messages
                    messageList.innerHTML = '';
                    // Display messages for the selected user
                    displayMessages();
                    messageInput.value = '';
                }
            }

            function openChat(recipient) {
                // Clear previous messages
                messageList.innerHTML = '';
                displayMessages();

                // Display messages between the logged-in user and the selected user
                const currentUserMessages = currentUser.messages.filter(message =>
                    (message.sender === recipient && message.receiver === currentUser.username) ||
                    (message.sender === currentUser.username && message.receiver === recipient)
                );

                currentUserMessages.forEach((message) => {
                    const messageItem = document.createElement('div');
                    messageItem.className = 'message-list-item';
                    messageItem.innerHTML = <strong>${message.sender}</strong>: ${message.text} (${message.timestamp});
                    messageList.appendChild(messageItem);
                });

                // Show the messages for the selected recipient
                messageList.classList.add('active');
                // Update the recipient in the message form dropdown
                userList.value = recipient;
                displayMessages();
            }

            function displayMessages() {
                // Clear previous messages
                messageList.innerHTML = '';

                // Check if currentUser is not null or undefined
                if (currentUser) {
                    const recipient = userList.value; // Assuming userList is a select element
                    const sender = currentUser.username;

                    // Display messages for the selected user (both as sender and recipient)
                    displayUserMessages(recipient, sender);
                    displayUserMessages(sender, recipient);

                    // Show the messages for the logged-in user
                    messageList.classList.add('active');
                }
            }

            function displayUserMessages(sender, recipient) {
                const user = JSON.parse(localStorage.getItem(sender));

                // Clear previous messages
                messageList.innerHTML = '';

                if (user && user.messages) {
                    user.messages.forEach((message) => {
                        if (
                            (message.receiver === recipient && message.sender === sender) ||
                            (message.sender === recipient && message.receiver === sender)
                        ) {
                            const messageItem = document.createElement('li');
                            messageItem.className = 'message-list-item';
                            messageItem.dataset.timestamp = message.timestamp;

                            // Check if the message is sent by the logged-in user (sender)
                            const isSender = message.sender === currentUser.username;

                            // Apply different styles based on sender/receiver
                            if (isSender) {
                                messageItem.innerHTML = <div class="msg-right"><strong>${message.sender}</strong> <br /> ${message.text} (${message.timestamp})</div> <hr class="line" />;

                            } else {
                                messageItem.innerHTML = <div class="msg-left"><strong>${message.sender}</strong> <br /> ${message.text} (${message.timestamp})</div> <hr class="line" />;
                            }

                            messageList.appendChild(messageItem);
                        }
                    });
                }
            }
            
            function displayUserList() {
                userList.innerHTML = '<option value="" disabled selected>Select user</option>';

                // Get all users from localStorage
                for (let i = 0; i < localStorage.length; i++) {
                    const username = localStorage.key(i);

                    // Exclude the current user from the user list
                    if (username !== currentUser.username) {
                        const option = document.createElement('option');
                        option.value = username;
                        option.textContent = username;
                        userList.appendChild(option);
                    }
                }
            }

            function logout() {
                currentUser = null;
                loginContainer.style.display = 'block';
                messagingContainer.style.display = 'none';
                $('#username').val("");
                $('#password').val("");
            }
        });