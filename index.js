import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

const app = express();

dotenv.config();
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(express.static("public"));

const port = process.env.PORT;
const host = process.env.HOST;




app.get("/simulation/", (req, res) => {
  res.render("simulation", {name: process.env.NAME});
});


app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});