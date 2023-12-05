const express = require("express");
require("dotenv/config");
const cors = require("cors");
const { handleMessage,handlePostback } = require("./util/chatbot");
let router = express.Router();
// const config = require("./config/staticFile");

const app = express();
app.use(cors({ origin: true }));
app.use((req,res,next) => {
  res.header("Access-Control-Allow-Origin","*"); // Cho phép truy cập từ mọi nguồn
  res.header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb",extended: true }));

app.get("/",(req,res) => {
  return res.json("hello chatbot");
});


//config view engine
// app.use('/assets',express.static(path.join(__dirname,'..','public','assets')))
app.use(express.static("public"))
app.set('view engine','ejs');
app.set("views","views");

app.post("/webhook",async (req,res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid,webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid,webhook_event.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Add support for GET requests to our webhook
app.get("/webhook",(req,res) => {
  let VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

//router
function callSendAPI(sender_psid,response) {
  const agentOptions = {
    rejectUnauthorized: false,
  };

  const agent = new https.Agent(agentOptions);
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
      agent: agent,
    },
    (err,res,body) => {
      console.log(body);
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}


app.get('/feedback',(req,res) => {
  // console.log(3)
  return res.render("feedback.ejs");
  // return res.json("hello chatbot1");

})

app.post('/post-feedback',async (req,res) => {
  try {
    let response1 = {
      text: "Thành công. Phản hồi của bạn đã được thu thập. Cảm ơn ý kiến đóng góp của bạn."
    }
    await callSendAPI(req.body.psid,response1);
    return res.status(200).json({
      mess: "success"
    })

  } catch (e) {
    console.log(e);
    return res.status(500).json({
      mess: "Feedback Error"
    })
  }

})


//config
// config(app);

app.listen(5000,() => {
  console.log("server chatbot running....");
});

module.exports = app;
