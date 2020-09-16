var rtime;
var timeout = false;
var delta = 200;

$(window).resize(function() {
    destroySVgSelector();

    rtime = new Date();
    if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
    }
});

function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;

        spawnSvgSelector();
        createSliders();
        centerSpaceBaseImage();
    }               
}


function createSliders()
{
    stopSliders();
    
    var slider1 = createSlider($("#pixelArtSlider"), true);
    var slider2 = createSlider($("#pixelArtSlider1"), false);
    
    sliders = [slider1, slider2];
}

var gameIndex = 0; 

function nextGame(direction)
{
    gameIndex = nextContent("unityGames", "gameCaptions", gameIndex, 2, direction);
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

$(document).ready(() => {
    spawnSvgSelector();
    createSliders();
    centerSpaceBaseImage();
});


function centerSpaceBaseImage()
{
    $("#webContent>img").each(function(i, img) {
        $(img).css({
            position: "relative",
            left: ($(img).parent().width() - $(img).width()) / 2
        });
    });

}