import { Router } from "express";
import GoogleOAuthController from "../../controller/googleAuth/oauth2.js";

const router = Router();

router.get("/signIn", GoogleOAuthController.signIn);

router.get("/redirect", GoogleOAuthController.getTokens);

router.get("/signout", GoogleOAuthController.signOut);

// router.get("/auth-url", GoogleOAuthController.getAuthURL);

// router.get("/tokens", GoogleOAuthController.getTokens);

// router.get("/token", GoogleOAuthController.getTokenFromDB);

export default router;
