$(document).ready(function(){
  if ($(".side_bar_container").hasClass("opened")){
    $("#menu-toggle").removeClass();
    $("#menu-toggle").addClass("fa-solid fa-xmark fs-4");
  } else {
    $("#menu-toggle").removeClass();
    $("#menu-toggle").addClass("fa-solid fa-bars fs-4");
  }
    $("#menu-toggle").click(function(){
      $("#menu").toggle();
      
      $(".admin_body").width()
      // $("#wrapper").toggleClass("menuDisplayed");
    });
  });
  //<i class="fa-solid fa-xmark"></i>