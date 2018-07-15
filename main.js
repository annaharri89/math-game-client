$(function() {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $usernameInput = $('#username'); // Input for username

    var $loginPage = $('#login'); // The login page
    var $mathGame = $('#math-game');
    var $submitUsername = $('#submit-username');
    var $scoreBoard = $('#score-board');
    var $problem = $('#problem');
    var $requestNewProblem = $('#new-problem');
    var $isCorrect = $('#is-correct');
    var $answer = $('#answer');
    var $submitAnswer = $('#submit-answer');

    // Prompt for setting a username
    $mathGame.hide();
    var username;
    var connected = false;
    var $currentInput = $usernameInput.focus();

    var socket = io('http://127.0.0.1:3000/');

    // Sets the client's username
    var setUsername = function () {
        username = cleanInput($usernameInput.val().trim());

        // If the username is valid
        if (username) {
            $loginPage.fadeOut();
            $mathGame.show();
            $loginPage.off('click');
            $currentInput = $answer.focus();

            // Tell the server your username
            socket.emit('add user', username);
            getNewProblem()
        }
    };

    $submitUsername.on('click', setUsername);

    const getNewProblem = function () {
        socket.emit('new problem');
    }

    $requestNewProblem.on('click', getNewProblem);

    // Adds the visual chat message to the message list
    const addScore = function (data) {
        console.log(data);
        var $userScoreDiv = $('#' + data.username);
        if ($userScoreDiv !== undefined && $userScoreDiv !== null) {
            $userScoreDiv.remove();
        } 

        $userScoreDiv = $('<span id="'+ data.username +'"/><br/>')
            .text(`${data.username}'s score has gone up to ${data.score}`)
            .css('color', getUsernameColor(data.username));

        $scoreBoard.prepend($userScoreDiv);
        $scoreBoard.prepend('<br />')
    };

    // Prevents input from having injected markup
    const cleanInput = function (input) {
        return $('<div/>').text(input).html();
    };

    // Gets the color of a username through our hash function
    const getUsernameColor = function (username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    };

    $submitAnswer.on('click', function() {
        socket.emit('answer', $answer.val());
    });

    // Click events

    // Focus input when clicking anywhere on login page
    $loginPage.click(function () {
        $currentInput.focus();
    });

    // Focus input when clicking on the answer input's border
    $answer.click(function () {
        $answer.focus();
    });

    // Socket events

    // Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
        connected = true;
        // Display the welcome message
        var message = "Welcome to Socket.IO Math Game – ";
        console.log(message);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
        console.log(`${data.username}  joined`);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
        console.log(`${data.username} left`);
    });

    socket.on('disconnect', function () {
        console.log('you have been disconnected');
    });

    socket.on('reconnect', function () {
        console.log('you have been reconnected');
        if (username) {
            socket.emit('add user', username);
        }
    });

    socket.on('reconnect_error', function () {
        console.log('attempt to reconnect has failed');
    });

    socket.on('evaluation', function (data) {
        if (data.isCorrect) {
            $isCorrect.text("You got the problem right!");
        } else {
            $isCorrect.text("You got the problem wrong. Try again.")
        }
    });

    socket.on('new problem', function(data) {
        $problem.text(`${data.firstInt} + ${data.secondInt}`);
    });

    socket.on('user score',  addScore);

});