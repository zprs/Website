// var svgLocations = ["VectorArt/bonsai.svg", "VectorArt/sword1.svg","VectorArt/Scroll.svg", "VectorArt/potion.svg","VectorArt/axe.svg"];
var slidePositions = [];
var slideScales = [];

function destroySlideSelector() {
    // $(".svgSelectorContainer").html("");
}

function spawnSlideSelector()
{
    slidePositions = [];
    slideScales = [];

    var slidesOnScreen = 3;
    var slides = $(".slideSelectorContainer").children();
    var width =  $(".slideSelectorContainer").width();
    var seperationFactor = width / (slidesOnScreen + 1);
    var slideWidth = $(slides[0]).width();

    var edgePadding = 20;

    
    for (let i = 0; i < slidesOnScreen + 2; i++) {
        var posX = -slideWidth - edgePadding;

        if(i == 0)
            posX = -slideWidth - edgePadding;

        if( i == 0)
            posX = -slideWidth - edgePadding;
        else if(i > 0 && i < slidesOnScreen + 1)
            posX = seperationFactor * i - (slideWidth / 2);
        else
            posX = width + edgePadding;

        slidePositions.push(posX);

        var centerX = posX + slideWidth / 2;
        var ceterPos = width / 2;
        var distanceToCenter = Math.abs(ceterPos - centerX)
        var furthestDistance = width / 2 + slideWidth + edgePadding;
        var scale = (furthestDistance - distanceToCenter) / furthestDistance * 1.2;
        slideScales.push(scale);

        $(slides[i]).css("transform", `scale(${scale}, ${scale})`);
        $(slides[i]).css("left", posX + "px");
    }
}

function nextSVG(dir)
{
    //dir == true -> to the right
    //dir == false -> to the left

    var slides = $(".svgSelectorContainer").children();
    
    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        var nextPosition;
        
        if(dir)
            nextPosition = (i + 1) % slidePositions.length;
        else
        {
            if(i == 0)
                nextPosition = slidePositions.length - 1;
            else
                nextPosition = i - 1;
        }

        $(slide).css("left", slidePositions[nextPosition] + "px");
        $(slide).css("transform", `scale(${slideScales[nextPosition]}, ${slideScales[nextPosition]})`);
    }

    if(dir)
        $(slides[slides.length - 1]).prependTo(".svgSelectorContainer");
    else
        $(slides[0]).appendTo(".svgSelectorContainer");
}