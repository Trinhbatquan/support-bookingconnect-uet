//only run once time, use postman, curl or code (if use code, use package request)

//appear button get started:
/*

url: https://graph.facebook.com/v18.0/me/messenger_profile?access_token=<PAGE_ACCESS_TOKEN>
POST
body : {
    "get_started": {"payload": "GET_STARTED"},
    "whitelisted_domains": ["a","b",...]
}

*/

//appear persistent menu:
/*

url: https://graph.facebook.com/v18.0/me/messenger_profile?access_token=<PAGE_ACCESS_TOKEN>
POST
body : {
    "persistent_menu": [
        {
            "locale": "default",
            "composer_input_disabled": false,
            "call_to_actions": [
                {
                   "type": "web_url",
                    "title": "Github URL",
                    "url": "https://github.com/Trinhbatquan/facebook-chatbot-demo",
                    "webview_height_ratio": "full"
                },
                {
                    "type": "postback",
                    "title": "Restart bot",
                    "payload": "RESTART_BOT"
                },
            ]
        }
    ]
}

I use postman for both above options
*/
