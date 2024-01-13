import process from "process";
import { google } from "googleapis";
import dotenv from "dotenv";
import Redis from "../../redis.js";
dotenv.config();

class GoogleOAuthServices {
  static SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
  ];

  static oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Function to get the auth url
  static getAuthURL = async () => {
    const url = GoogleOAuthServices.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: GoogleOAuthServices.SCOPES,
    });

    return url;
  };

  // Function to create the tokens from the code
  static getTokens = async (code) => {
    try {
      const token = await GoogleOAuthServices.oauth2Client.getToken(code);

      // get user info from id_token
      const idToken = token.tokens.id_token;

      const ticket = await GoogleOAuthServices.oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const LoginTicket = { ...ticket };
      const email = LoginTicket.payload.email;

      const name = LoginTicket.payload.name;
      return {
        access_token: token.tokens.access_token,
        refresh_token: token.tokens.refresh_token,
        email,
        name,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  // Function to save the tokens in the redis db
  static saveTokens = async (tokens) => {
    let userCount = await Redis.instance.get("counter");
    const key = `user:${userCount}`;
    const fieldsAdded = await Redis.instance.hSet(key, tokens);
    userCount++;
    await Redis.instance.set("counter", userCount);

    console.log(`Number of fields added: ${fieldsAdded}`);
    return;
  };

  // Function to get the tokens from the redis db
  static getTokenFromDB = async () => {
    const usersCounter = await Redis.instance.get("counter");

    let users = [];

    for (let i = 0; i < usersCounter; i++) {
      const key = `user:${i}`;
      const user = await Redis.instance.hGetAll(key);
      users.push(user);
    }

    return users;
  };

  // Function to sign out a user and delete the tokens from the redis db
  static signOut = async (email) => {
    let usersCounter = await Redis.instance.get("counter");
    let userFound;
    if (!usersCounter) {
      return "No users in DB";
    }
    let i;
    for (i = 0; i < usersCounter; i++) {
      const key = `user:${i}`;
      const user = await Redis.instance.hGetAll(key);
      if (user.email === email) {
        userFound = user;
        break;
      }
    }

    if (!userFound) {
      return "User not found";
    }

    const key = `user:${i}`;
    const deleted = await Redis.instance.del(key);

    if (deleted) {
      usersCounter--;
      await Redis.instance.set("counter", usersCounter);
      Redis.counter = usersCounter;
      return userFound;
    }
  };
}

export default GoogleOAuthServices;
