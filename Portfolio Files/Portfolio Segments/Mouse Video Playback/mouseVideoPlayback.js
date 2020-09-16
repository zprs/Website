var mouse = {
    x: undefined,
    y: undefined,
}

window.addEventListener('mousemove', 
    function(event){
    mouse.x = event.x;
    mouse.y = event.y;
})

let selectedVideo = 0;

let videos = [
    {
        folder: "testVideo",
        duration: 30,
    },
    {
        folder: "testVideo",
        duration: 60,
    }
]

var currentImgTag = 0;

$("#playbackDiv").on("mousemove", () => {
    if(mouse.x)
    {
        let duration = videos[selectedVideo].duration;
        let folder = videos[selectedVideo].folder;

        let img = document.getElementById("playbackDiv");
        let imgRect = img.getBoundingClientRect();
    
        let imgPercent = (mouse.x - imgRect.x) / imgRect.width;
        let imgNum = Math.round(imgPercent * duration);
        let imgString;
    
        if(imgNum > duration)
            imgNum = duration;
        else if(imgNum < 1)
            imgNum = 1;
    
        if(imgNum >= 10)
            imgString = "00" + imgNum;
        else
            imgString = "000" + imgNum;

        console.log(imgNum);
    
        $("#movieImage" + selectedVideo).attr("src", folder + "/" + imgString + ".png");
    }
});

function next(dir)
{
    $(".slideShowSwitchers").prop('disabled', true);

    let add = dir ? -1 : 1;

    if(selectedVideo + add < 0)
        selectedVideo = videos.length - 1;
    else
        selectedVideo = ((selectedVideo + add) % videos.length);

    console.log(selectedVideo);

    if(dir)
    {
        $("#movieImage" + currentImgTag).animate({
            width: 0,
            "marginLeft": "100%"
        }, 400, "easeOutCubic", function() {
            $(this).css("display", "none");
            $(this).css("width", "100%");
            $(this).css("marginLeft", "0");
        });
    }
    else 
    {
        $("#movieImage" + currentImgTag).animate({
            width: 0,
            "marginRight": "100%"
        }, 400, "easeOutCubic", function() {
            $(this).css("display", "none");
            $(this).css("width", "100%");
            $(this).css("marginRight", "0");
        });
    }

    currentImgTag = currentImgTag == 1 ? 0 : 1;

    let folder = videos[selectedVideo].folder;
    let m = dir ? "marginRight" : "marginLeft";

    $("#movieImage" + currentImgTag).attr("src", folder + "/0001.png");
    $("#movieImage" + currentImgTag).css(m, "100%");
    $("#movieImage" + currentImgTag).css("width", "0");
    $("#movieImage" + currentImgTag).css("display", "block");

    if(dir){
        $("#movieImage" + currentImgTag).animate({
            width: "100%",
            "marginRight": "0%"
        }, 400, "easeOutCubic");
    }
    else
    {
        $("#movieImage" + currentImgTag).animate({
            width: "100%",
            "marginLeft": "0%"
          }, 400, "easeOutCubic");
    }

    setTimeout(() => {$(".slideShowSwitchers").prop('disabled', false)}, 400);

};