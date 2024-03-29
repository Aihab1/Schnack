<h1 align="center">
  <a href="https://derschnack.herokuapp.com/">Derschnack</a>
</h1>
<p align="center">
Derschnack is a chatting web application similar to Slack created using Flask & Socket-IO.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Socket.io-010101?&style=for-the-badge&logo=Socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" />
  <img src="https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=darkgreen" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white" />
</p>

![Screenshot1](https://user-images.githubusercontent.com/55903466/88714582-a54fcc00-d13a-11ea-916b-9927cd3ff574.jpg)

# Features
* ### I am Single. Page. Application.
  With the help of Socket-IO, the server-side application listens and emits data to the client-side. This feature makes it a fast and responsive site. No need to reload the page for new messages to appear or to join a new chat room. **Real. Time. Chatting.**
* ### Anonymity Protection & Display Name
  You don't need to sign up or link an email. Just enter a username and you are good to go. You can also change your username anytime. The username is remembered if you close the website and return to it later (Unless you log out).
* ### Sending Messages
  Once in a channel, users would be able to send text messages to others in the channel. When a user sends a message, their display name and the timestamp of the message would be associated with the message. All users in the channel would then see the new message appear on their channel page. Sending and receiving messages does NOT require reloading the page.
> This website uses free dynos on heroku which means all the messages will be cleared every 24 hours.
* ### Channel Creation
  A channel is called a chatroom. A chatroom can store a maximum of 100 messages on the server-side memory, the earlier ones are automatically deleted. You can create unlimited number of chatrooms (public/private) to continue chatting.
* ### Private Chat room Support
  You can always create a private chat room and set a password of your choice. Only the ones knowing the password can join.
> Working with security issues. It is advisable not to share any private or sensitive information such as payment methods, credit cards, passwords etc.
* ### Remembering the Channel
  If you close your browser window and get back to the application at a later time, the channel you were in will be remembered and will be opened automatically.
* ### Log out Feature
  You can log out to change your username. Logging out will clear all the chat rooms under "My Chatrooms" including the private ones. You'll need to re-enter passwords to join private chat rooms.
* ### Responsive Website
  The website is responsive and works well on all device resolutions.
 
> Bonus: Schnack is a german word which means "to chat".

# Some images from the site
![Screenshot2](https://user-images.githubusercontent.com/55903466/88714596-a8e35300-d13a-11ea-8cbd-6e2a1f6594d0.jpg)
![Screenshot3](https://user-images.githubusercontent.com/55903466/88714601-aa148000-d13a-11ea-8c3e-bbddcd64f5e8.jpg)
![Screenshot4](https://user-images.githubusercontent.com/55903466/88714603-aaad1680-d13a-11ea-9c72-9ea06d0a4ff6.jpg)
![Screenshot5 (1)](https://user-images.githubusercontent.com/55903466/88795930-7713d000-d1be-11ea-8703-0b8bb0d0a0a1.jpg)
![Screenshot5 (2)](https://user-images.githubusercontent.com/55903466/88795938-79762a00-d1be-11ea-86af-7591e2d8ca86.jpg)
