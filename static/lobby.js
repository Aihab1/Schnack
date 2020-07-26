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

    document.querySelectorAll('.mychatroom-links').forEach(link => {
        link.onclick = () => {
            socket.emit('leave', { 'room': document.title });
            socket.emit('join', { 'room': link.innerHTML });
            load_page(link.innerHTML);

            return false;
        }
    });

    // Set links up to load new pages.
    document.querySelectorAll('.chatroom-links').forEach(link => {
        link.onclick = () => {
            var page = link.innerHTML;
            socket.emit('enter password', { 'currentroom': document.title, 'joinroom': page });
            // socket.emit('load chatroom', { 'namechatroom': page })

            return false;
        };
    });

    socket.on('password check', data => {
        submitbutton = document.querySelector("#passwordenter");

        if (!data["password"]) {
            document.querySelector('#joinlobbytitle').innerHTML = "This is a public room";
            document.querySelector('#joinlobbypasswordheading').innerHTML = "We discourage you to share any sensitive information such as passwords, credit card, bank details etc.";
        }
        else {
            document.querySelector('#joinlobbytitle').innerHTML = "Tryna break in?";
            if (document.querySelector('#joinlobbypasswordheading').innerHTML === "We discourage you to share any sensitive information such as passwords, credit card, bank details etc.") {
                document.querySelector('#joinlobbypasswordheading').innerHTML = "";
                h6 = document.createElement('h6');
                h6.innerHTML = "Password";
                passwordfield = document.createElement('input');
                passwordfield.className = "form-control";
                passwordfield.setAttribute('type', 'password');
                passwordfield.setAttribute('id', 'checkpassword');
                passwordfield.setAttribute('placeholder', 'Password');
                document.querySelector('#joinlobbypasswordheading').append(h6);
                document.querySelector('#joinlobbypasswordheading').append(passwordfield);
            }
        }

        //Adding link to #mychatrooms div
        var exists = false;
        mychatrooms = document.querySelector('#mychatrooms').querySelectorAll('*');
        for (var cat of mychatrooms) {
            // console.log(cat.innerHTML);
            if (cat.innerHTML.toLowerCase() === data["joinroom"].toLowerCase().trim()) {
                exists = true;
                break;
            }
            else {
                exists = false;
            }
        }

        submitbutton.onclick = () => {
            if (data["password"]) {
                enteredpassword = document.querySelector("#checkpassword").value;
                if (enteredpassword === data["password"]) {
                    socket.emit('leave', { 'room': data["currentroom"] });
                    socket.emit('join', { 'room': data["joinroom"] });
                    load_page(data["joinroom"]);
                    document.querySelector("#checkpassword").value = "";
                    if (exists === false) {
                        var mychatrooms = document.querySelector('#mychatrooms');
                        var a = document.createElement('a');
                        var li = document.createElement('li');
                        li.className = 'list-unstyled mychatrooms-li-element';
                        a.href = "";
                        a.className = 'mychatroom-links';
                        a.innerHTML = data["joinroom"];
                        li.appendChild(a);
                        mychatrooms.append(li);
                        // return false;
                    }
                }
                else {
                    alert("Attempt to break-in failed. Enter the correct password!");
                    document.querySelector("#checkpassword").value = "";
                }
            }
            else {
                socket.emit('leave', { 'room': data["currentroom"] });
                socket.emit('join', { 'room': data["joinroom"] });
                load_page(data["joinroom"]);
                if (exists === false) {
                    var mychatrooms = document.querySelector('#mychatrooms');
                    var a = document.createElement('a');
                    var li = document.createElement('li');
                    li.className = 'list-unstyled mychatrooms-li-element';
                    a.href = "";
                    a.className = 'mychatroom-links';
                    a.innerHTML = data["joinroom"];
                    li.appendChild(a);
                    mychatrooms.append(li);
                    // return false;
                }
            }

            document.querySelectorAll('.mychatroom-links').forEach(link => {
                link.onclick = () => {
                    socket.emit('leave', { 'room': document.title });
                    socket.emit('join', { 'room': link.innerHTML });
                    load_page(link.innerHTML);

                    return false;
                }
            });

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
        li.innerHTML = `<b>${data.username.toUpperCase()}</b> Today at ${data.time}: ${data.msg}`;
        document.querySelector('#messages').append(li);
        var scrollingElement = document.querySelector('#messages-container');
        if (scrollingElement.scrollTop > scrollingElement.scrollHeight - scrollingElement.clientHeight - 100) {
            scrollingElement.scrollTop = scrollingElement.scrollHeight;
        }
    });

    //disable enable functioning for create button inside modal
    document.querySelector('#create').disabled = true;
    document.querySelector('#namechatroom').onkeyup = () => {

        let exists = false;
        namechatroom = document.querySelector('#namechatroom').value;
        allchatrooms = document.querySelectorAll('.chatroom-links');
        for (var cat of allchatrooms) {
            // console.log(cat.innerHTML);
            if (cat.innerHTML.toLowerCase() === namechatroom.toLowerCase().trim()) {
                exists = true;
                break;
            }
            else {
                exists = false;
            }
        }

        if (document.querySelector('#namechatroom').value.length > 0 && exists === false) {
            document.querySelector('#create').disabled = false;
            document.querySelector('#namechatroom').style.border = "3px solid green";
        }
        else {
            document.querySelector('#create').disabled = true;
            document.querySelector('#namechatroom').style.border = "3px solid red";
        }

    };
    //creating chatrooms
    createchatroom = document.querySelector('#create');

    checkprivate = document.querySelector('#checkprivate');
    privatediv = document.querySelector('#private-div');
    checkprivate.onclick = () => {
        if (checkprivate.checked) {
            inputpass = document.createElement('input');
            label = document.createElement('h6');
            inputpass.setAttribute('type', 'text');
            inputpass.setAttribute('autocomplete', 'off');
            inputpass.setAttribute('spellcheck', 'false');
            inputpass.className = 'password4chatroom form-control';
            label.innerHTML = 'Password';
            privatediv.append(label);
            privatediv.append(inputpass);
        }
        else {
            privatediv.innerHTML = "";
        }
    };

    createchatroom.onclick = () => {
        let exists = false;
        var password = null;
        namechatroom = document.querySelector('#namechatroom').value.trim();
        allchatrooms = document.querySelectorAll('.chatroom-links');
        if (checkprivate.checked) {
            password = document.querySelector('.password4chatroom').value;
            // console.log(password);
        }
        for (var cat of allchatrooms) {
            // console.log(cat.innerHTML);
            if (cat.innerHTML.toLowerCase() === namechatroom.toLowerCase()) {
                exists = true;
                break;
            }
            else {
                exists = false;
            }
        }
        // console.log(exists);
        if (exists === false) {
            socket.emit('submit chatroom', { 'namechatroom': namechatroom, 'password': password });
            socket.emit('load chatroom', { 'namechatroom': namechatroom, 'password': password });
        }
    };

    socket.on('announce chatroom', data => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.innerHTML = `${data.namechatroom}`;
        a.href = "";
        li.setAttribute('class', 'list-unstyled');
        a.setAttribute('class', 'chatroom-links');
        a.setAttribute('data-dismiss', 'modal');
        a.setAttribute('data-toggle', 'modal');
        a.setAttribute('data-target', '#verifypassword');
        li.appendChild(a);
        document.querySelector('#activechatrooms').append(li);

        document.querySelectorAll('.mychatroom-links').forEach(link => {
            link.onclick = () => {
                socket.emit('leave', { 'room': document.title });
                socket.emit('join', { 'room': link.innerHTML });
                load_page(link.innerHTML);

                return false;
            }
        });

        // Set links up to load new pages.
        document.querySelectorAll('.chatroom-links').forEach(link => {
            link.onclick = () => {
                var page = link.innerHTML;
                socket.emit('enter password', { 'currentroom': document.title, 'joinroom': page });
                // socket.emit('load chatroom', { 'namechatroom': page })

                return false;
            };
        });
    });

    socket.on('load forme', data => {
        socket.emit('leave', { 'room': document.title });
        socket.emit('join', { 'room': data.namechatroom });
        load_page(data.namechatroom);
        document.querySelector('#namechatroom').value = "";

        var mychatrooms = document.querySelector('#mychatrooms');
        var a = document.createElement('a');
        var li = document.createElement('li');
        li.className = "list-unstyled mychatrooms-li-element";
        a.href = "";
        a.setAttribute('class', 'mychatroom-links');
        a.innerHTML = data.namechatroom;
        li.appendChild(a);
        mychatrooms.append(li);

        document.querySelectorAll('.mychatroom-links').forEach(link => {
            link.onclick = () => {
                socket.emit('leave', { 'room': document.title });
                socket.emit('join', { 'room': link.innerHTML });
                load_page(link.innerHTML);

                return false;
            }
        });

        document.querySelectorAll('.chatroom-links').forEach(link => {
            link.onclick = () => {
                var page = link.innerHTML;
                socket.emit('enter password', { 'currentroom': document.title, 'joinroom': page });
                // socket.emit('load chatroom', { 'namechatroom': page })

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
    document.querySelector('#messages').innerHTML = "";
    document.querySelector('#chatroom-heading').innerHTML = `# ${document.title}`;
    data_temp.forEach(data => {
        const li = document.createElement('li');
        li.innerHTML = `<b>${data.username.toUpperCase()}</b> Today at ${data.time}: ${data.message}`;
        document.querySelector('#messages').append(li);
    });
};

// Renders contents of new page in main view.
function load_page(name) {
    const request = new XMLHttpRequest();
    request.open('POST', `/lobby/${name}`);
    request.onload = () => {
        const data_temp = JSON.parse(request.response);
        // console.log(data_temp);
        // data_list = data_temp["home"]
        document.querySelector('#messages').innerHTML = "";
        document.querySelector('#chatroom-heading').innerHTML = `# ${name}`;
        document.querySelector('#create').disabled = true;

        data_temp.forEach(data => {
            const li = document.createElement('li');
            li.innerHTML = `<b>${data.username.toUpperCase()}</b> Today at ${data.time}: ${data.message}`;
            document.querySelector('#messages').append(li);
        });

        scrollingElement = document.querySelector('#messages-container');
        scrollingElement.scrollTop = scrollingElement.scrollHeight;

        // Push state to URL.
        document.title = name;
        history.pushState({ 'title': name, 'text': data_temp }, name, `/iwilltakeapotatochipandEATIT/${name}`);
    };
    request.send();
    return false;
}