## Amazon Clone Backend

This is the backend folder of a realtime chat application.
I created it using react native for the frontend and nodejs and express for the backend. I used mongoDB for the database.
Nodejs is the runtime used and expressjs is the framework used. This provides the server-side functionality for managing the Application.

# Features

1. RESTful API endpoints for user management(register user, email verification, login user, forgot password, reset password, get all users except the logged in user, show friend request, delete friend request, accept friend request, get friends) and also for creating, fetching and deleting messages.

1. Authentication and Authorization of users using JSON Web Tokens.

1. MongoDB integration for data storage.

1. Express.js for handling HTTP request and routing.

1. Nodemailer for sending mails.

1. Bcryptjs for hashing and comparing of password.

1. Cors for cross-origin resource sharing.

1. Dotenv for saving secret keys.

# Prerequisites

Before running the project, make sure you have the following packages installed:

1. Node.js
1. MongoDB
1. npm or yarn package manager

# Installation

1. Clone the repository.

1. Install dependencies.

1. Configure environment variables

# Usage

1. Start the MongoDB server
1. Start the server

## API Endpoints

# user routes

1. `POST /api/users/forgot-password`: forgot password

1. `POST /api/users/reset-password`: reset password

1. `POST /api/users/friend-request`: send friend request

1. `GET /api/users/friends/:userId`: getFriends

1. `GET /api/users/friend-request/sent/:userId`: sent friend request

1. `GET /api/users/get-friendIds/:userId`: user friends

1. `GET /api/users/get-recipient/:recipientId`: get recipient by id

1. `POST /api/users/delete-friend-request`: delete friend request

1. `GET /api/users/show-friend-request/:userId`: show friend requests

1. `POST /register`: register user

1. `GET /api/users/getAllUserExceptLoggedInUser/:userId`:
   get all users except logged in user

1. `POST /api/users/register`: register user

1. `POST /api/users/login`: login and authenticate user

1. `GET /api/users/verify-user/:token`: verify user's email address

# message routes

1. `GET /api/messages/get-messages/:senderId/:recipientId`: get messages between two users

1. `POST /api/messages/post-text`: post message

1. `POST /api/messages/delete-messages`: delete messages
