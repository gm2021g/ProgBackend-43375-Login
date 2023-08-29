import express from "express";
import Manager from "../dao/managers/index.js";
import bcrypt from "bcrypt";
const saltRounds = 10;

const Router = express.Router();

const sessionMiddleware = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/home/products");
  }

  return next();
};

// Vista del login
Router.get("/login", sessionMiddleware, (req, res) => {
  res.render("login", {});
});

// Enviando solicitud de log
Router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
      req.session.user = {
        first_name: "admin",
      };
      req.session.user.role = "admin";

      return res.redirect("/home/products");
    }

    const user = await Manager.UsersManager.userLogin(email);

    if (!user) {
      res.status(401, { error: "Usuario incorrecto" });
      console.log("Usuario incorrecto");
      return res.render("login", {});
    }

    if (!bcrypt.compareSync(password, user.password)) {
      res.status(401, { error: "Password incorrecto" });
      console.log("Password incorrecto");
      return res.render("login", {});
    }

    req.session.user = user;

    res.redirect("/home/products");
    
  } catch (error) {
    console.log(error);
  }
});

// Enviando solicitud de logout
Router.get("/logout", (req, res) => {
  req.session.destroy();

  res.redirect("/login");
});

// Vista de registro
Router.get("/register", sessionMiddleware, (req, res) => {
  res.render("register", {});
});

// Enviando solicitud de registro
Router.post("/create", async (req, res) => {
  try {
    let newUser = req.body;

    const hash = bcrypt.hashSync(newUser.password, saltRounds);
    newUser.password = hash;

    const user = await Manager.UsersManager.userCreate(newUser);

    if (!user) {
      return res.redirect("/register");
    }

    res.redirect("/login");
  } catch (error) {
    console.log(error);

    res.redirect("/register");
  }
});

//Vista administrador de usuarios
Router.get("/admin", async (req, res) => {
  try {
    const role = req.session.user.role;

    const users = await Manager.UsersManager.getAllUser();

    if (role === "admin") {
      return res.render("admin", {
        style: "styles.css",
        users,
      });
    }

    return res.redirect("/home/products");
  } catch (error) {}
});

export default Router;
