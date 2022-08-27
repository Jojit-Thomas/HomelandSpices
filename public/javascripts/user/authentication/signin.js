$(document).ready(function () {
  console.log('started')
  $("#signin").submit(function (form) {
    form.preventDefault();
    console.log(form);
    $.ajax({
      url: "/signin",
      data: $("#signin").serialize(),
      method: "POST",
      success: function (response) {
        window.location.reload();
      },
      error: function (err) {
        console.log(err);
        err = jQuery.parseJSON(err.responseText);
        console.log(err.message);
        $("#error").text(err.message);
      }
    });
  });
});
