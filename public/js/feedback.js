require("dotenv/config");



(function (d,s,id) {
    var js,fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/messenger.Extensions.js";
    fjs.parentNode.insertBefore(js,fjs);
}(document,'script','Messenger'));

window.extAsyncInit = function () {
    // the Messenger Extensions JS SDK is done loading 

    MessengerExtensions.getContext(process.env.APP_ID_FACEBOOK,
        function success(thread_context) {
            // success
            //set psid to input
            $("#psid").val(thread_context.psid);
            handleClickButtonReserveTable();
        },
        function error(err) {
            // error
            console.log('Lỗi feedback',err);
        }
    );
};

//validate inputs
function validateInputFields() {
    // const EMAIL_REG = /[a-zA-Z][a-zA-Z0-9_\.]{1,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}/g;

    let customerName = $("#customerName");
    let mssv = $("#mssv");
    let subject = $("#subject");
    let detail = $("#detail");

    // if (!email.val().match(EMAIL_REG)) {
    //     email.addClass("is-invalid");
    //     return true;
    // } else {
    //     email.removeClass("is-invalid");
    // }

    if (customerName.val() === "") {
        customerName.addClass("is-invalid");
        return true;
    } else {
        customerName.removeClass("is-invalid");
    }

    if (mssv.val() === "") {
        mssv.addClass("is-invalid");
        return true;
    } else {
        mssv.removeClass("is-invalid");
    }

    if (subject.val() === "") {
        subject.addClass("is-invalid");
        return true;
    } else {
        subject.removeClass("is-invalid");
    }

    if (detail.val() === "") {
        detail.addClass("is-invalid");
        return true;
    } else {
        detail.removeClass("is-invalid");
    }

    return false;
}


function handleClickButtonReserveTable() {
    $("#btnReserveTable").on("click",function (e) {
        let check = validateInputFields(); //return true or false

        let data = {
            psid: $("#psid").val(),
            customerName: $("#customerName").val(),
            mssv: $("#mssv").val(),
            subject: $("#subject").val(),
            detail: $("#detail").val(),
        };

        if (!check) {
            //close webview
            MessengerExtensions.requestCloseBrowser(function success() {
                // webview closed
            },function error(err) {
                // an error occurred
                console.log(err);
            });

            //send data to node.js server 
            $.ajax({
                url: `${window.location.origin}/post-feedback`,
                method: "POST",
                data: data,
                success: function (data) {
                    console.log(data);
                },
                error: function (error) {
                    console.log(error);
                }
            })
        }
    });
}