import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();

dotenv.config();
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(express.static("public"));

const port = process.env.PORT;
const host = process.env.HOST;

const name = "SandboxJS";

app.get("/", (req, res) => {
  res.render("index", {name: name});
});

app.get("/simulation/", (req, res) => {
  res.render("simulation", {name: name});
});


app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});