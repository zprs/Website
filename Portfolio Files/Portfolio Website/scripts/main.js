var rtime;
var timeout = false;
var delta = 200;
var randomColors = ["#ff8585", "#ffbe73", "#9bf27e", "#75efff", "#8a9fff", "#bc8cff", "#e994ff", "#ff8fbc"];
var headerColor;
let numberOfCircles = 100;
let circleYPos = [];
let circleScrollSpeed = 2;

$(window).resize(function() {
    $("#unityGames").height($("#unityGames").width() * 108 / 192);

    rtime = new Date();
    if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
    }

    divSelector.destroy();
});

// $(window).scroll(function () {
//     var scroll_position = $(window).scrollTop();
//     var object_position_top = window.innerHeight * (scroll_position / window.innerHeight);

//     // console.log(object_position_top);

//     for (let i = 0; i < circleYPos.length; i++) {
//         const circle = $("#circle" + i);

//         let yPos = circleYPos[i].y - object_position_top * circleYPos[i].scrollSpeed;

//         $(circle).css('top', yPos);
//         $(circle).css('opacity', circleYPos[i].opacity * (yPos / circleYPos[i].y));
//     }
// });

function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;

        createSliders();
        centerSpaceBaseImage();
        divSelector.spawn(true);
        gameIndex = 1;

        // console.log("resize " + gameIndex);

        //Reset the caption
        enableChild("gameCaptions", gameIndex);
    }               
}

function drawCircles(color){

    let circlesHTML = "";
    let circles = [];

    for (let i = 0; i < numberOfCircles; i++) {
        
        let x = 0;
        let y = 0;
        let radius = 0;

        let itterations = 0;
        let maxitterations = 100;
        
        do {
            x = Math.random() * window.innerWidth;
            y = Math.random() * window.innerHeight;
            radius = Math.random() * 50 + 50;
            itterations++;
        } while(checkCollisions(circles, x, y, radius) && itterations < maxitterations);
        
        if(itterations >= maxitterations)
            continue;
        
        let scrollSpeed = Math.random() * circleScrollSpeed * (y / window.innerHeight);
        let opacity = 0.75 * (radius / 150);

        // console.log(scrollSpeed);

        circleYPos.push({y: y, scrollSpeed: scrollSpeed, opacity:opacity});

        circles.push({x: x, y: y, radius: radius});
        circlesHTML += '<div id="circle' + i + '" class="circles" style="width:' + radius + 'px; height: ' + radius +'px; top: ' + y + 'px; left: ' + x + 'px; background-color:' + color + '; opacity:' + opacity + '"></div>'
    }

    $("#siteWrapper").html(circlesHTML + $("#siteWrapper").html());
}

function checkCollisions(circles, x, y, radius)
{
    let collision = false;

    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        let dist = Math.sqrt(Math.pow(circle.x - x, 2) + Math.pow(circle.y - y, 2))

        if(dist < (radius + circle.radius))
            collision = true;
    }

    return collision;
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

    drawCircles(headerColor);

    let root = document.documentElement;
    
    root.style.setProperty('--accentColor', headerColor);

    $("#header").css("text-shadow", "4px 4px " + headerColor);
    $("#subHeader").css("opacity", 1);

    spawSVGCurves();

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
