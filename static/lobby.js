function remove_spaces(string) {
    var processed = string.replace(/ /g, '');
    return processed;
}

$(document).ready(function () {
    var socket = io();
    socket.emit('firstload');
});

document.addEventListener('DOMContentLoaded', () => {
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('first loaded', data => {
        //load lobby which the user last left
        load_page(data['room']);
    });

    //button disable enable functioning
    document.querySelector('#send').disabled = true;
    document.querySelector('#msg').onkeyup = () => {
        if (document.querySelector('#msg').value.length > 0)
            document.querySelector('#send').disabled = false;
        else
            document.querySelector('#send').disabled = true;
    };

    // Set links up to load new pages.
    document.querySelectorAll('.chatroom-links').forEach(link => {
        link.onclick = () => {
            var page = link.innerHTML;
            socket.emit('leave', { 'room': document.title });
            socket.emit('join', { 'room': page });
            load_page(page);
            return false;
        };
    });

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
            const namechatroom = document.title;
            document.querySelector('#msg').value = "";
            document.querySelector('#send').disabled = true;
            if (namechatroom != "Lobby") {
                socket.emit('submit message', { 'msg': msg, "namechatroom": namechatroom });
            }
        };

    });

    // When a new message is announced, add to the unordered list
    socket.on('announce message', data => {
        const li = document.createElement('li');
        li.innerHTML = `<b>${data.username}</b> Today at ${data.time}: ${data.msg}`;
        document.querySelector('#messages').append(li);
    });

    //disable enable functioning for create button inside modal
    document.querySelector('#create').disabled = true;
    document.querySelector('#namechatroom').onkeyup = () => {
        if (document.querySelector('#namechatroom').value.length > 0)
            document.querySelector('#create').disabled = false;
        else
            document.querySelector('#create').disabled = true;
    };
    //creating chatrooms
    createchatroom = document.querySelector('#create');
    createchatroom.onclick = () => {
        namechatroom = document.querySelector('#namechatroom').value;
        socket.emit('submit chatroom', { 'namechatroom': namechatroom });
        socket.emit('load chatroom', { 'namechatroom': namechatroom })
    };

    socket.on('announce chatroom', data => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.innerHTML = `${data.namechatroom}`;
        a.href = "/";
        li.setAttribute('class', 'list-unstyled');
        a.setAttribute('class', 'chatroom-links');
        a.setAttribute('data-dismiss', 'modal');
        li.appendChild(a);
        document.querySelector('#activechatrooms').append(li);
        document.querySelector('#namechatroom').value = "";

        // Set links up to load new pages.
        document.querySelectorAll('.chatroom-links').forEach(link => {
            link.onclick = () => {
                var page = link.innerHTML;
                socket.emit('leave', { 'room': document.title });
                socket.emit('join', { 'room': page });
                load_page(page);
                return false;
            };
        });
    });

    socket.on('load forme', data => {
        socket.emit('leave', { 'room': document.title });
        socket.emit('join', { 'room': data.namechatroom });
        load_page(data.namechatroom);
    });
});

// Update text on popping state.
window.onpopstate = e => {
    const data = e.state;
    document.title = data.title;
    data_temp = data.text;
    document.querySelector('#messages').innerHTML = "";
    data_temp.forEach(data => {
        const li = document.createElement('li');
        li.innerHTML = `<b>${data.username}</b> Today at ${data.time}: ${data.message}`;
        document.querySelector('#messages').append(li);
    });
};

// Renders contents of new page in main view.
function load_page(name) {
    const request = new XMLHttpRequest();
    request.open('GET', `/lobby/${name}`);
    request.onload = () => {
        const data_temp = JSON.parse(request.response);
        // console.log(data_temp);
        // data_list = data_temp["home"]
        document.querySelector('#messages').innerHTML = "";

        data_temp.forEach(data => {
            const li = document.createElement('li');
            li.innerHTML = `<b>${data.username}</b> Today at ${data.time}: ${data.message}`;
            document.querySelector('#messages').append(li);
        });
        // Push state to URL.
        document.title = name;
        history.pushState({ 'title': name, 'text': data_temp }, name, `/lobby/${name}`);
    };
    request.send();

}