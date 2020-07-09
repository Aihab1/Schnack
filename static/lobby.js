function remove_spaces(string) {
    var processed = string.replace(/ /g, '');
    return processed;
}


document.addEventListener('DOMContentLoaded', () => {
    //load home lobby
    load_page("home");

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
            load_page(page);
            return false;
        };
    });

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
            const namechatroom = document.title;
            document.querySelector('#msg').value = "";
            document.querySelector('#send').disabled = true;
            socket.emit('submit message', { 'msg': msg, "namechatroom": namechatroom });
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
    };

    socket.on('announce chatroom', data => {
        const a = document.createElement('a');
        a.innerHTML = `${data.namechatroom}`;
        a.href = "#";
        a.setAttribute('class', 'chatroom-links');
        document.querySelector('#activechatrooms').append(a);
        document.querySelector('#namechatroom').value = "";

        document.querySelectorAll('.chatroom-links').forEach(link => {
            link.onclick = () => {
                var page = link.innerHTML;
                load_page(page);
                return false;
            };
        });
    });
});

// Update text on popping state.
window.onpopstate = e => {
    const data = e.state;
    document.title = data.title;
    data_temp = data.text;
    document.querySelector('#messages').innerHTML="";
    data_temp.forEach(data => {
        const li = document.createElement('li');
        li.innerHTML = `<b>${data.username}</b> Today at ${data.time}: ${data.message}`;
        document.querySelector('#messages').append(li);
    });
};

// Renders contents of new page in main view.
function load_page(name) {
    // name = remove_spaces(name);
    const request = new XMLHttpRequest();
    request.open('GET', `/lobby/${name}`);
    request.onload = () => {
        const data_temp = JSON.parse(request.response);
        // console.log(data_temp);
        // data_list = data_temp["home"]
        document.querySelector('#messages').innerHTML="";

        data_temp.forEach(data => {
            const li = document.createElement('li');
            li.innerHTML = `<b>${data.username}</b> Today at ${data.time}: ${data.message}`;
            document.querySelector('#messages').append(li);
        });
        // Push state to URL.
        document.title = name;
        history.pushState({'title': name, 'text': data_temp}, name, `/lobby/${name}`);
    };
    request.send();
}