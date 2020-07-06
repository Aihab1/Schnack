document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    // When connected, configure buttons
    socket.on('connect', () => {
        // Each button should emit a "submit message" event
        button = document.querySelector('#send')
        input = document.querySelector('#msg')
        button.onclick = () => {
            const msg = input.value;
            socket.emit('submit message', { 'msg': msg });
        };
    });

    // When a new message is announced, add to the unordered list
    socket.on('announce message', data => {
        const li = document.createElement('li');
        li.innerHTML = `${data.username}: ${data.msg}`;
        document.querySelector('#messages').append(li);
    });
});
