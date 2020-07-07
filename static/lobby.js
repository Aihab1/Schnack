document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    // When connected, configure buttons
    socket.on('connect', () => {
        // Each button should emit a "submit message" event
        button = document.querySelector('#send')
        input = document.querySelector('#msg')

        input.addEventListener("keyup", function (event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                event.preventDefault();
                button.click();
            }
        });

        button.onclick = () => {
            const msg = input.value;
            document.querySelector('#msg').value = "";
            socket.emit('submit message', { 'msg': msg });
        };
    });

    // When a new message is announced, add to the unordered list
    socket.on('announce message', data => {
        const li = document.createElement('li');
        li.innerHTML = `<b>${data.username}</b> Today at ${data.time}: ${data.msg}`;
        document.querySelector('#messages').append(li);
    });
});
