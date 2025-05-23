require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const jwt = require("jsonwebtoken");
const user = require("./userModel");
const authRouter = require("./authRoute").router;
const accessToken = require("./authRoute").accessToken;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser);

const authenticate = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    const accessPayload = jwt.verify(accessToken, process.env.Access_token_key);
    const userInstance = await user.findOne(accessPayload.username);
    if (accessPayload.tokenVersion !== userInstance.tokenVersion) {
      return res.status(201).json({ msg: "Unauthorised" });
    }
    req.username = accessPayload.username;
    return next();
  } catch (e) {
    if (e.name === "JsonWebTokenError") {
      return res.status(201).json({ msg: "Unauthorised" });
    } else if (e.name === "TokenExpiredError") {
      try {
        //refreshing access token
        const refreshPayload = jwt.verify(
          refreshToken,
          process.env.Refresh_token_key
        );
        const userInstance = user.findOne({
          username: refreshPayload.username,
        });
        if (userInstance.tokenVersion !== refreshPayload.tokenVersion) {
          return res.status(401).json({ msg: "Unauthorised" });
        }
        res.clearCookie("accessToken");
        res.cookie(
          "accessToken",
          accessToken({
            username: refreshPayload.username,
            tokenVersion: refreshPayload.tokenVersion,
          })
        );
        return authenticate(req,res,next)
      } catch (e) {
        if (e.name === "JsonWebTokenError") {
          return res.status(401).json({ msg: "Unauthorised" });
        } else if (e.name === "TokenExpiredError") {
          return res.status(400).jsonn({ msg: "Please login again" });
        }
      }
    }
  }
};

app.use("/auth" , authRouter)
app.use("/note" , authenticate , noteRouter)
