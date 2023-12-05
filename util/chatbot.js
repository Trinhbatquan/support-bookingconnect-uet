require("dotenv/config");
const https = require("https");
const request = require("request");
const dataTeacher = require("./dataTeacher");

// const image_started = require("/assets/image/department5.jpg");
// const uet_avatar1 = require("/assets/image/uet.jpg");
// const uet_avatar2 = require("/assets/image/department2.jpg");
// const uet_avatar3 = require("/assets/image/department1.jpg");
// const noavatar = require("/assets/image/noavatar.png");

// Sends response messages via the Send API
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

// Handles messages events
function handleMessage(sender_psid,received_message) {
  let response;

  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      text: `You sent the message: "${received_message.text}". Now send me an attachment!`,
    };
  } else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Đây có phải một bức ảnh?",
              subtitle: "Nhấn vào để trả lời.",
              image_url: attachment_url,
              buttons: [
                {
                  type: "postback",
                  title: "Có!",
                  payload: "yes",
                },
                {
                  type: "postback",
                  title: "Không!",
                  payload: "no",
                },
              ],
            },
          ],
        },
      },
    };
  }

  // Send the response message
  callSendAPI(sender_psid,response);
}

//get profile use
const getProfileUser = async (sender_psid) => {
  // Send the HTTP request to the Messenger Platform
  return new Promise(async (resolve,reject) => {
    request(
      {
        uri: `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${process.env.PAGE_ACCESS_TOKEN}`,
        method: "GET",
      },
      async (err,res,body) => {
        console.log(err);
        if (!err) {
          const profileUser = await JSON.parse(body);
          resolve(profileUser);
        } else {
          console.error("Not get profile user:" + err);
          reject(err);
        }
      }
    );
  });
};

//set template get started
const templateGetStarted = async (sender_psid) => {
  return new Promise(async (resolve,reject) => {
    try {
      const response = {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [
              {
                title: "Cảm ơn bạn đã sử dụng dịch vụ!",
                image_url: "/assets/image/department5.jpg",
                subtitle: "Hệ thống hỗ trợ sinh viên UET.",
                // default_action: {
                //   type: "postback",
                //   title: "MAIN PRODUCTS",
                //   payload: "MAIN_PRODUCTS",
                // },
                buttons: [
                  {
                    type: "postback",
                    title: "Hướng dẫn sử dụng bot",
                    payload: "INFORM_BOT"
                  },
                  {
                    type: "postback",
                    title: "Khởi động lại bot",
                    payload: "RESTART_BOT"
                  },
                  {
                    type: "postback",
                    title: "Giới thiệu về trường",
                    payload: "INFORM_SCHOOL"
                  },
                  {
                    type: "postback",
                    title: "Danh sách giảng viên",
                    payload: "LIST_TEACHER"
                  },
                  {
                    type: "postback",
                    title: "Danh sách khoa viện",
                    payload: "LIST_FACULTY"
                  },
                  {
                    type: "postback",
                    title: "Danh sách phòng ban",
                    payload: "LIST_DEPARTMENT"
                  },
                  {
                    type: "web_url",
                    url: process.env.URL_WEB_VIEW_ORDER,
                    title: "Góp ý, phản hồi",
                    webview_height_ratio: "tall",
                    message_extensions: true
                  }
                ],
              },
            ],
          },
        },
      };
      resolve(response);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

//handle click get started
const handleGetStarted = async (sender_psid) => {
  try {
    const profileUser = await getProfileUser(sender_psid);
    const responseTemplateGetStarted = await templateGetStarted(sender_psid);
    const response1 = {
      text: `Chào mừng sinh viên: ${profileUser.first_name} ${profileUser.last_name} đến với hệ thống hỗ trợ của chúng tôi. Chúc bạn một ngày tốt lành.`,
    };
    const response2 = responseTemplateGetStarted;
    return {
      response1,
      response2,
    };
  } catch (err) {
    console.log(err);
    return;
  }
};

//handle show main products

const templateInformSchool = () => {
  const data = [
    {
      title: "Thông tin liên hệ",
      image_url: "/assets/image/uet.jpg",
      subtitle: `Địa chỉ: E3, 144 Xuân Thủy, Cầu Giấy, Hà Nội
                     Điện thoại: 024.37548.864;
                     Fax: 024.37547.460;
                     Email: ctsv_dhcn@vnu.edu.vn`,
    },
    {
      title: "Thông tin chính",
      image_url: "/assets/image/department2.jpg",
      subtitle: `Trường Đại học Công nghệ, Đại học Quốc gia Hà Nội được thành lập theo Quyết định số 92/2004/QĐ-TTg ngày 25/05/2004 của Thủ tướng Chính phủ trên cơ sở Khoa Công nghệ và Trung tâm Hợp tác Đào tạo và Bồi dưỡng Cơ học trực thuộc Đại học Quốc gia Hà Nội`,
    },
    {
      title: "Nhiệm vụ trọng tâm",
      image_url: "/assets/image/department1.jpg",
      subtitle: `1. Đào tạo nguồn nhân lực trình độ đại học, sau đại học và bồi dưỡng nhân tài thuộc lĩnh vực khoa học, công nghệ;
                 2. Nghiên cứu và triển khai ứng dụng khoa học, công nghệ đáp ứng nhu cầu phát triển kinh tế - xã hội.`,
    },
  ];
  // new Array(3).fill(0).map((item) => {
  //   data.push({
  //     title: "Thông tin liên hệ",
  //     image_url: uet_avatar,
  //     subtitle: `Địa chỉ: E3, 144 Xuân Thủy, Cầu Giấy, Hà Nội
  //                Điện thoại: 024.37548.864;
  //                Fax: 024.37547.460;
  //                Email: ctsv_dhcn@vnu.edu.vn`,
  //     buttons: [
  //       {
  //         type: "postback",
  //         title: "Detail",
  //         payload: "DETAIL_PRODUCT",
  //       },
  //       {
  //         type: "postback",
  //         title: "Return",
  //         payload: "RESTART_BOT",
  //       },
  //     ],
  //   });
  // });
  return data;
};


const templateListTeacher = () => {
  const data = [
  ];
  dataTeacher.map((item) => {
    data.push({
      title: item.name,
      image_url: "/assets/image/noavatar.png",
      subtitle: item.detail,
      // buttons: [
      //   {
      //     type: "postback",
      //     title: "Detail",
      //     payload: "DETAIL_PRODUCT",
      //   },
      //   {
      //     type: "postback",
      //     title: "Return",
      //     payload: "RESTART_BOT",
      //   },
      // ],
    });
  });
  return data;
}

/*
templateProducts
*/

const handleTemplateInformSchool = () => {
  try {
    const response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: templateInformSchool(),
        },
      },
    };
    return response;
  } catch (e) {
    console.log(e);
    return false;
  }
};


const handleTemplateListTeacher = () => {
  try {
    const response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: templateListTeacher(),
        },
      },
    };
    return response;
  } catch (e) {
    console.log(e);
    return false;
  }
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid,received_postback) {
  let response;
  console.log("received_postback");
  console.log(received_postback);

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  switch (payload) {
    case "yes":
      // code block
      response = { text: "Thanks!" };
      break;
    case "no":
      // code block
      response = { text: "Oops, try sending another image." };
      break;
    case "RESTART_BOT":
    case "GET_STARTED":
      //handle
      const response = await handleGetStarted(sender_psid);
      if (response.response1 && response.response2) {
        await callSendAPI(sender_psid,response.response1);
        await callSendAPI(sender_psid,response.response2);
      } else {
        await callSendAPI(sender_psid,{
          text: "Có lỗi. Vui lòng liên hệ với quản trị viên của hệ thống.",
        });
      }
      return;
    case "INFORM_BOT":
      break;
    case "INFORM_SCHOOL":
      const responseInformSchool = await handleTemplateInformSchool();
      if (responseInformSchool) {
        await callSendAPI(sender_psid,responseInformSchool);
      } else {
        await callSendAPI(sender_psid,{
          text: "Error. Please try again or contact with admin.",
        });
      }
      return;
    case "LIST_TEACHER":
      const responseListTeacher = await handleTemplateListTeacher();
      if (responseListTeacher) {
        await callSendAPI(sender_psid,responseListTeacher);
      } else {
        await callSendAPI(sender_psid,{
          text: "Error. Please try again or contact with admin.",
        });
      }
      return;
    case "LIST_DEPARTMENT":
      response = { text: `Ồ, tôi chưa được thiết lập để trả lời cho kết quả: ${payload}` };
      break;
    case "LIST_FACULTY":
      response = { text: `Ồ, tôi chưa được thiết lập để trả lời cho kết quả: ${payload}` };
      break;
    // case "FEEDBACK":
    //   break;

    default:
      // code block
      response = {
        text: `Ồ, tôi chưa được thiết lập để trả lời cho kết quả: ${payload}`,
      };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid,response);
}

module.exports = {
  handleMessage,
  handlePostback,
};
