import os

from flask import Flask, session, render_template, redirect, url_for, request, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit

from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

messages = {"1":{}}
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

        if "home" not in messages["1"]:
            messages["1"]["home"] = []

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
    
    if "home" not in messages["1"]:
        messages["1"]["home"] = []
    messages["1"]["home"].append({"message": data["msg"], "username": session['username'], "time":time, "date":date})

    data = {
        "msg": data["msg"],
        "username": session['username'],
        "time": time,
        "date": date
    }
    emit("announce message", data, broadcast=True)

@socketio.on("submit chatroom")
def chatroom(data):
    if str(data["namechatroom"]) not in messages["1"]:
        messages["1"][str(data["namechatroom"])] = []
    
    data = {
        "namechatroom": data["namechatroom"]
    }
    emit("announce chatroom", data, broadcast=True)

@app.route("/lobby/home")
def home():
    return jsonify(messages["1"]["home"])

@app.route("/lobby/<name>")
def chatroom(name):
    return jsonify(messages["1"][name])