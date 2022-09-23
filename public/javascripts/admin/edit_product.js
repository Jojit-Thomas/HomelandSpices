f// $(document).ready(function () {
//     console.log("started");
//     $("#editProduct").validate({
//       rules: {
//         title: {
//           required: true,
//           minlength: 4,
//         },
//         description: {
//           required: true,
//           minlength: 4,
//         },
        
//         category: {
//           required: true,
//         },
//         price: {
//           required: true,
//           digits: true,
//         },
//         stocks: {
//           required: true,
//           digits: true,
//         },
//         image: {
//           required: true,
//         },
//       },
//       submitHandler: function (form) {
//         // form.preventDefault();
//         console.log(form);
//         console.log("recieved");
//         $.ajax({
//           url: "/admin/editProduct",
//           data: $("#editProduct").serialize(),
//           method: "POST",
//           success: function (response) {
//             window.location.reload();
//           },
//           error: function (err) {
//             console.log(err);
//             err = jQuery.parseJSON(err.responseText);
//             console.log(err.message);
//             $("#error").text(err.message);
//           },
//         });
//       },
//     });
//   });
  