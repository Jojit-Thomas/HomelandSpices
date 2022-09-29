$(document).ready(function () {
  $("#maxAge").hide();
  $("#verifyBtn").prop("disabled", true);
  console.log("otp signin");
  $("#sendBtn").click(function () {
    // document.getElementById("timer").innerHTML = 05 + ":" + 00;

    // startTimer();
    // function startTimer() {
    //   var presentTime = document.getElementById("timer").innerHTML;
    //   var timeArray = presentTime.split(/[:]+/);
    //   var m = timeArray[0];
    //   var s = checkSecond(timeArray[1] - 1);
    //   if (s == 59) {
    //     m = m - 1;
    //   }
    //   if (m < 0) {
    //     return;
    //   }
    //   document.getElementById("timer").innerHTML = m + ":" + s;
    //   console.log(m);
    //   setTimeout(startTimer, 1000);
    // }
    // function checkSecond(sec) {
    //   if (sec < 10 && sec >= 0) {
    //     sec = "0" + sec;
    //   } // add zero in front of numbers < 10
    //   if (sec < 0) {
    //     sec = "59";
    //   }
    //   return sec;
    // }
    const phone = $("#phone").val();
    console.log("sendOtp clicked");
    $.ajax({
      url: "/otp/get",
      data: {
        phone: phone,
      },
      method: "POST",
      success: function (response) {
        console.log(response);
        console.log("success");
        $("#verifyBtn").prop("disabled", false);
        console.log(response.message);
        $("#success").text(response.message);
        $("#maxAge").show();
        $("#sendBtn").text('Resend Otp')
      },
      error: function (err) {
        console.log(err);
        err = jQuery.parseJSON(err.responseText);
        console.log(err.message);
        $("#error").text(err.message);
      },
    });
  });
  $("#verifyBtn").click(function () {
    const phone = $("#phone").val();
    const otp = $("#otp").val();
    console.log("verifyOtp clicked");
    $.ajax({
      url: "/otp/verify",
      data: {
        phone: phone,
        otp: otp,
      },
      method: "POST",
      success: function (response) {
        console.log(response);
        console.log("success");
        console.log(response.message);
        $("#success").text(response.message);
        window.location.reload();
      },
      error: function (err) {
        console.log(err);
        err = jQuery.parseJSON(err.responseText);
        console.log(err.message);
        $("#error").text(err.message);
      },
    });
  });
});
