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

messages = {}
users = []
chatrooms = []

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
            messages["home"] = []

        return render_template("lobby.html", username=session['username'], messages=messages, date=date)
    else:
        return redirect(url_for('index'))


@app.route("/lobby_redirect", methods=["GET", "POST"])
def lobby_redirect():
    if request.method == 'POST':
        username = request.form.get("username")
        if username.lower() not in users:
            users.append(username.lower())
            session["username"] = username
            session["chatroom"] = "home"
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
        users.remove(session['username'].lower())
        users.remove(session['chatroom'])
    except:
        pass
    session.pop('username', None)
    session.pop('chatroom', None)

    return redirect(url_for('index'))


@socketio.on("submit message")
def message(data):
    now = datetime.now()
    today = datetime.now().date()
    time = now.strftime("%H:%M")
    date = today.strftime('%d%m%Y%b')
    
    if data["namechatroom"] not in messages:
        messages[data["namechatroom"]] = []
    messages[data["namechatroom"]].append({"message": data["msg"], "username": session['username'], "time":time, "date":date})

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
        messages[str(data["namechatroom"])] = []
    
    data = {
        "namechatroom": data["namechatroom"]
    }
    emit("announce chatroom", data, broadcast=True)

@app.route("/lobby/home")
def home():
    return jsonify(messages["home"])

@app.route("/lobby/<name>")
def chatroom(name):
    return jsonify(messages[name])

@socketio.on('join')
def on_join(data):
    username = session['username']
    room = data['room']
    session['chatroom'] = data['room']
    join_room(room)
    # send(username + ' has entered the room.', room=room)

@socketio.on('leave')
def on_leave(data):
    username = session['username']
    room = data['room']
    session['chatroom'] = "home"
    leave_room(room)
    # send(username + ' has left the room.', room=room)

