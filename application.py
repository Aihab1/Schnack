import os

from flask import Flask, session, render_template, redirect, url_for, request, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room, leave_room

from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

#messages will be a dictionary of the form {"chatroomname": {"password": VAL, "allmessages": []}}
messages = {}
users = []
#chatrooms will be a dictionary of the form {"username": {"currentroom": VAL, "allrooms": []}}
chatrooms = {}

@app.route("/")
def index():
    if 'username' in session:
        return redirect(url_for('lobby'))
    return render_template("index.html")


@app.route("/lobby")
def lobby():
    if 'username' in session:
        today = datetime.now().date()
        date = today.strftime('%d%m%Y%b')

        if "home" not in messages:
            messages["home"] = {"password": None, "allmessages": []}

        return render_template("lobby.html", username=session['username'], messages=messages, date=date, mychatrooms = chatrooms[session['username']]["allrooms"])
    else:
        return redirect(url_for('index'))


@app.route("/lobby_redirect", methods=["GET", "POST"])
def lobby_redirect():
    if request.method == 'POST':
        username = request.form.get("username")
        if username.lower() not in users:
            users.append(username.lower())
            chatrooms[username.lower()] = {"currentroom": "home", "allrooms": ["home"]}
            session["username"] = username.lower()
        else:
            return "Username already taken"
        return redirect(url_for('lobby'))
    else:
        if 'username' in session:
            return redirect(url_for('lobby'))
        return redirect(url_for('index'))


@app.route("/logout")
def logout():
    try:
        del chatrooms[session['username']]
    except:
        pass
    try:
        users.remove(session['username'])
    except:
        pass
    session.pop('username', None)

    return redirect(url_for('index'))


@socketio.on("submit message")
def message(data):
    now = datetime.now()
    today = datetime.now().date()
    time = now.strftime("%H:%M")
    date = today.strftime('%d%m%Y%b')
    
    if "allmessages" not in messages[data["namechatroom"]]:
        messages[data["namechatroom"]]["allmessages"] = []
    messages[data["namechatroom"]]["allmessages"].append({"message": data["msg"], "username": session['username'], "time":time, "date":date})

    if len(messages[data["namechatroom"]]["allmessages"]) > 100:
        messages[data["namechatroom"]]["allmessages"].pop(0)

    data = {
        "msg": data["msg"],
        "username": session['username'],
        "time": time,
        "date": date,
        "namechatroom": data["namechatroom"]
    }
    emit("announce message", data, room=data["namechatroom"])

@socketio.on("submit chatroom")
def chatroom(data):
    if str(data["namechatroom"]) not in messages:
        messages[str(data["namechatroom"])] = {"password": data["password"], "allmessages": []}
    
    data = {
        "namechatroom": data["namechatroom"],
        "password": data["password"]
    }
    emit("announce chatroom", data, broadcast=True)

@app.route("/lobby/home")
def home():
    return jsonify(messages["home"]["allmessages"])

@app.route("/lobby/<name>")
def chatroom(name):
    return jsonify(messages[name]["allmessages"])

@app.route("/iwilltakeapotatochipandEATIT/<name>")
def reloadingfunction(name):
    return redirect(url_for('lobby'))

@socketio.on('join')
def on_join(data):
    username = session['username']
    room = data['room']
    chatrooms[username]["currentroom"] = room
    if room not in chatrooms[username]["allrooms"]:
        chatrooms[username]["allrooms"].append(room)
    join_room(room)

@socketio.on('leave')
def on_leave(data):
    username = session['username']
    room = data['room']
    leave_room(room)

@socketio.on('firstload')
def firstload():
    username = session['username']
    join_room(chatrooms[username]["currentroom"])
    emit('first loaded', { "room": chatrooms[username]["currentroom"] })

@socketio.on('load chatroom')
def loadchatroom(data):
    data = {
        "namechatroom": data["namechatroom"],
        "password": data["password"]
    }
    emit("load forme", data, broadcast=False)

@socketio.on('enter password')
def enterpassword(data):
    data = {
        'currentroom': data["currentroom"], 
        'joinroom': data["joinroom"],
        'password': messages[data["joinroom"]]["password"]
    }
    emit("password check", data, broadcast=False)