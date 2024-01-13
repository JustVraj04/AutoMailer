import GoogleOAuthServices from "../../services/googleAuth/oauth2.js";
import dotenv from "dotenv";
dotenv.config();

class GoogleOAuthController {
  static async getAuthURL(req, res) {
    try {
      const url = await GoogleOAuthServices.getAuthURL();
      res.status(200).json({ url });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }

  static async getTokens(req, res) {
    try {
      const { code } = req.query;
      const tokens = await GoogleOAuthServices.getTokens(code);

      await GoogleOAuthServices.saveTokens(tokens);
      res.redirect(`http://localhost:${process.env.PORT || 3000}/done`);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }

  static async signIn(req, res) {
    try {
      const url = await GoogleOAuthServices.getAuthURL();

      res.redirect(url);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }

  static async getTokenFromDB(req, res) {
    try {
      const { email } = req.query;
      await GoogleOAuthServices.getTokenFromDB(email);

      res.status(200);
      //   res.status(200).json({ token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }

  static async signOut(req, res) {
    try {
      const { email } = req.query;

      const user = await GoogleOAuthServices.signOut(email);

      if (!user.email) {
        res
          .status(404)
          .json({
            error:
              "Either provided email not found or already removed from database",
          });
      } else {
        res.status(200).json({ message: "User removed successfully" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }
}

export default GoogleOAuthController;
