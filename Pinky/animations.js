// $(function() {

//     $(document).scroll(function() {

//         let scrollAmount = $(document).scrollTop();
//         let maxScroll = 200;
//         let scrollPercent = scrollAmount / maxScroll;

//         let vw = window.innerWidth / 100;
//         let vh = window.innerHeight / 100;

//         let maxWidth = (20 * vw + 20 * vh);
//         let minWidth = 350;

//         let currentWidth = (maxWidth - minWidth) * scrollPercent + minWidth;


//         $("#pageTitle").css("width", currentWidth + "px");
//         $("#pageTitle").css("margin-left",(vw - currentWidth / 2) + " px");
//       });


//     $("body").scroll();
// });

$(function() {

    window.onscroll = function() {scrollFunction()};

    function scrollFunction() {
        if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
            $("#pageTitle").css("width", "150px");
            $("#pageTitle").css("margin-left", "calc((100vw - (150px)) / 2)");
            
        } else {
            $("#pageTitle").css("width","calc(20vw + 20vh)");
            $("#pageTitle").css("margin-left", "calc((100vw - (20vw + 20vh)) / 2)");
        }
    }

    scrollFunction();

});