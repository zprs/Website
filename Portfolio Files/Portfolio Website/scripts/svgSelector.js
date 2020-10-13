var svgLocations = ["VectorArt/bonsai.svg", "VectorArt/sword1.svg","VectorArt/Scroll.svg", "VectorArt/potion.svg","VectorArt/axe.svg"];

var svgPositions = [];
var svgScales = [];

function destroySVgSelector() {
    $(".svgSelectorContainer").html("");
}

function spawnSvgSelector()
{
    svgPositions = [];
    svgScales = [];

    var imagesOnScreen = 3;

    var slidesHTML = "";

    for (let i = 0; i < imagesOnScreen + 2; i++) {
        slidesHTML += `<img class="svgSelectorImg" src="${svgLocations[i]}">`
    }

    $(".svgSelectorContainer").html(slidesHTML);

    var svgSlides = $(".svgSelectorContainer").children();
    var width =  $(".svgSelectorContainer").width();
    var seperationFactor = width / (imagesOnScreen + 1);
    var imageWidth = $(svgSlides[0]).width();

    var edgePadding = 20;

    for (let i = 0; i < imagesOnScreen + 2; i++) {

        var posX = -imageWidth - edgePadding;

        if( i == 0)
            posX = -imageWidth - edgePadding;
        else if(i > 0 && i < imagesOnScreen + 1)
            posX = seperationFactor * i - (imageWidth / 2);
        else
            posX = width + edgePadding;

        svgPositions.push(posX);

        var centerX = posX + imageWidth / 2;
        var ceterPos = width / 2;
        var distanceToCenter = Math.abs(ceterPos - centerX)
        var furthestDistance = width / 2 + imageWidth + edgePadding;
        var scale = (furthestDistance - distanceToCenter) / furthestDistance * 1.2;
        svgScales.push(scale);


        $(svgSlides[i]).css("transform", `scale(${scale}, ${scale})`);
        $(svgSlides[i]).css("left", posX + "px");
    }
}

function nextSVG(dir)
{
    //dir == true -> to the right
    //dir == false -> to the left

    var svgSlides = $(".svgSelectorContainer").children();
    
    for (let i = 0; i < svgSlides.length; i++) {
        const slide = svgSlides[i];

        var nextPosition;
        
        if(dir)
            nextPosition = (i + 1) % svgPositions.length;
        else
        {
            if(i == 0)
                nextPosition = svgPositions.length - 1;
            else
                nextPosition = i - 1;
        }

        $(slide).css("left", svgPositions[nextPosition] + "px");
        $(slide).css("transform", `scale(${svgScales[nextPosition]}, ${svgScales[nextPosition]})`);
    }

    if(dir)
        $(svgSlides[svgSlides.length - 1]).prependTo(".svgSelectorContainer");
    else
        $(svgSlides[0]).appendTo(".svgSelectorContainer");
}