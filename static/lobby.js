document.addEventListener('DOMContentLoaded', () => {

    // Set links up to load new pages.
    // document.querySelectorAll('.nav-link').forEach(link => {
    //     link.onclick = () => {
    //         const page = link.dataset.page;
    //         load_page(page);
    //         return false;
    //     };
    // });

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

    //creating chatrooms
    createchatroom = document.querySelector('#create');
    createchatroom.onclick = () => {
        namechatroom = document.querySelector('#namechatroom').value;
        const a = document.createElement('a');
        a.innerHTML = namechatroom;
        a.href = "#";
        document.querySelector('#activechatrooms').append(a);
        document.querySelector('#namechatroom').value = "";
    }
});

// Update text on popping state.
// window.onpopstate = e => {
//     const data = e.state;
//     document.title = data.title;
//     document.querySelector('#body').innerHTML = data.text;
// };

// // Renders contents of new page in main view.
// function load_page(name) {
//     const request = new XMLHttpRequest();
//     request.open('GET', `/${name}`);
//     request.onload = () => {
//         const response = request.responseText;
//         document.querySelector('#body').innerHTML = response;

//         // Push state to URL.
//         document.title = name;
//         history.pushState({'title': name, 'text': response}, name, name);
//     };
//     request.send();
// }