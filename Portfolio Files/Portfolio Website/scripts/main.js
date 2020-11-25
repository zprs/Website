var rtime;
var timeout = false;
var delta = 200;
var randomColors = ["#ff8585", "#ffbe73", "#9bf27e", "#75efff", "#8a9fff", "#bc8cff", "#e994ff", "#ff8fbc"];
var headerColor;

$(window).resize(function() {
    $("#unityGames").height($("#unityGames").width() * 108 / 192);

    rtime = new Date();
    if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
    }

    divSelector.destroy();
});

function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;

        createSliders();
        centerSpaceBaseImage();
        divSelector.spawn(true);
        gameIndex = 1;

        console.log("resize " + gameIndex);

        //Reset the caption
        enableChild("gameCaptions", gameIndex);
    }               
}

function createSliders()
{
    stopSliders();
    
    var slider1 = createSlider($("#pixelArtSlider"), true);
    var slider2 = createSlider($("#pixelArtSlider1"), false);
    var slider3 = createSlider($("#svgArtSlider"), false, window.innerWidth / 4.5);
    
    sliders = [slider1, slider2, slider3];
}

function nextContent(contentParentId, captionParentId, currentIndex, numberOfItems, next){

    var newIndex;

    if(next)
        newIndex = (currentIndex + 1) % numberOfItems;
    else
        {
            if(currentIndex == 0)
                newIndex = numberOfItems - 1;
            else
                newIndex = currentIndex - 1;
        }

    enableChild(contentParentId, newIndex);
    enableChild(captionParentId, newIndex);

    return newIndex;
}

function enableChild(id, index)
{
    var children = $("#" + id).children().toArray();

    for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if(i == index)
            $(child).show();
        else
            $(child).hide();
    }
}

var divSelector = new DivSelector(".svgSelectorContainer");

var gameIndex = 0;

function divSelectorRight()
{
    gameIndex = divSelector.nextDiv(true);
    enableChild("gameCaptions", gameIndex);

    console.log(gameIndex);
}

function divSelectorLeft()
{
    gameIndex = divSelector.nextDiv(false);
    enableChild("gameCaptions", gameIndex);
}


$(document).ready(() => {
    gameIndex = divSelector.spawn();

    //Reset the caption
    enableChild("gameCaptions", gameIndex);

    createSliders();
    centerSpaceBaseImage();
    
    $(window).resize();

    headerColor = randomColors[ Math.floor(Math.random() * randomColors.length)], 60;

    let root = document.documentElement;
    
    root.style.setProperty('--accentColor', headerColor);

    $("#header").css("text-shadow", "4px 4px " + headerColor);
    $("#subHeader").css("opacity", 1);

    // spawSVGCurves();

    setTimeout(function(){ loadIframes(); }, 1500);
});

function loadIframes()
{
    $("#covidVisualization").attr('src', "https://zacharyrichards.com/COVID-19_Data/index.html");
    setTimeout(() => $("#tetris99Iframe").attr('src', "https://zprs-tetris99.glitch.me"), 1000);
}

function centerSpaceBaseImage()
{
    $("#webContent>img").each(function(i, img) {
        $(img).css({
            position: "relative",
            left: ($(img).parent().parent().width() - $(img).width()) / 2
        });
    });

}
