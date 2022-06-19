const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://server-auth-41acc.firebaseio.com",
});

const csrfMiddleware = csrf({ cookie: true });

const PORT = process.env.PORT || 3000;
const app = express();

app.engine("html", require("ejs").renderFile);
app.use(express.static("static"));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

app.use("/static", express.static('./static/'));

app.get("/", function (req, res) {
  res.redirect("/login");
});

app.get("/login", function (req, res) {
  // res.redirect("/dashboard");


  const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      res.userData = userData
      console.log("login: render /dashboard")
      res.redirect("/dashboard");
    })
    .catch((error) => {
      console.log("login: render /login")
      res.render("login.html");
    });


});

app.get("/signup", function (req, res) {
  console.log("signup")
  res.render("signup.html");
});

app.get("/resetPassword", function (req, res) {
  console.log("resetPassword")
  res.render("resetPassword.html");
});


app.get("/profile", verifySession, function (req, res) {
  // console.log("profile: render /profile", res.userData.email)
  console.log("profile: render /profile")
  res.render("profile.ejs");
});




app.get("/dashboard", function (req, res) {
  const sessionCookie = req.cookies.session || "";
  console.log("dashboard")


  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in 2:", userData.email)
      res.render("dashboard.ejs");
    })
    .catch((error) => {
      // console.log(error)
      res.redirect("/login");
    });
});



app.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();
  console.log("sessionLogin")

  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  // const expiresIn = 60 * 30 *  1000;

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        console.log("sessionLogin: success")
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        console.log("sessionLogin: error")
        console.log(error.message)
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});





const routeDbServer = require('./routes/routeDbServer')
app.use('/dbServer', verifySession, routeDbServer);




const routeQueries = require('./routes/routeQueries')
app.use('/queries', verifySession, routeQueries);


const routeJsonToCsv = require('./routes/routeJsonToCsv')
app.use('/jsonToCsv', verifySession, routeJsonToCsv)


function verifySession(req, res, next) {
  const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      res.userData = userData;
      res.isVerifySession = true;
      console.log("verifySession: next")
      next();
    })
    .catch((error) => {
      res.isVerifySession = false;
      console.log("verifySession: redirect /login")
      res.render("/login");
    });
    console.log("verifySession",res.isVerifySession = true);
}

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
