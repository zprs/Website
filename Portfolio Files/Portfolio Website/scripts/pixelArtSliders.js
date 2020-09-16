var mouse = {
    x: undefined,
    y: undefined,
}

window.addEventListener('mousemove', 
    function(event){
    mouse.x = event.x;
    mouse.y = event.y;
})

$(window).on('focus', function() {

    sliders.forEach(slider => {
        createSliders();
    });
});

$(window).on('blur', function() {
    stopSliders();
});

function stopSliders()
{
    sliders.forEach(slider => {
        slider.stop();
    });
}


function createSlider(div, rightToLeft){
    var padding = window.innerWidth / 10;

    let direction = rightToLeft ? -1 : 1;
    var velocity = direction * 1 / 20;

    let slides = div.children().toArray();

    let slideWidth = parseInt($(slides[0]).css("width").slice(0, -2));
    let numberOnScreen = Math.round((window.innerWidth - padding) / (slideWidth + padding));

    let thresholdX;
    var resetPoint = rightToLeft ? (window.innerWidth / (numberOnScreen + 1) * (numberOnScreen + 2)) - (slideWidth / 2): window.innerWidth / (numberOnScreen + 1) * -1 - (slideWidth / 2);

    for (let i = slides.length - 1; i >= 0; i--) {
        
        const slide = slides[i];
        let centerX = window.innerWidth / (numberOnScreen + 1) * i;
        
        if(rightToLeft)
            centerX = window.innerWidth - centerX;
        
        let left = centerX - slideWidth / 2;

        if(i == slides.length - 1)
            thresholdX = left;

        $(slide).css("left", left + "px");

        $(slide).on("mouseenter", () => {
            let customMouseDistance = mouse.x - (getSlidePosition(slide) + slideWidth / 2);

            let velocity = Math.sign(customMouseDistance) / 15;
            changeSpeedSmooth(velocity, slides, false, "easeOutQuad", thresholdX, resetPoint, rightToLeft, Math.abs(customMouseDistance));
        });

        $(slide).on("mouseleave", () => {
            changeSpeedSmooth(velocity, slides, true, "linear", thresholdX, resetPoint, rightToLeft);
        });

        moveImgLeft(velocity, slide, true, "linear", thresholdX, resetPoint, rightToLeft);
    }

    return {
        start: () => {changeSpeedSmooth(velocity, slides, true, "linear", thresholdX, resetPoint, rightToLeft)},
        stop: () => {slides.forEach(slide => {
            $(slide).stop();
        })}
    }

}

function getSlidePosition(slide)
{
    return parseInt($(slide).css("left").slice(0, -2));
}

function changeSpeedSmooth(velocity, slides, loop, easing, thresholdX, resetPoint, rightToLeft, customDistance)
{
    for (let x = 0; x < slides.length; x++) {
        const slide = slides[x];
        $(slide).stop();
    
        moveImgLeft(velocity, slide, loop, easing, thresholdX, resetPoint, rightToLeft, customDistance);
    }
}

function moveImgLeft(velocity, slide, loop, easing, thresholdX, resetPoint, rightToLeft, customDistance)
{
    let left = getSlidePosition(slide);
    let direction = Math.sign(velocity);
    let distance = customDistance != null ? customDistance : Math.round(Math.abs(thresholdX - left) + 1);

    let duration = distance / Math.abs(velocity);

    $(slide).animate({
        left: "+=" + direction * distance + "px",
    }, 
    {   
        easing: easing,
        duration: duration,
        complete: function() {
            let currentLeft = getSlidePosition(slide);

            //gone past?
            if(currentLeft <= thresholdX && rightToLeft || currentLeft >= thresholdX && !rightToLeft)
            {
                let dif = rightToLeft ? thresholdX - currentLeft: currentLeft - thresholdX;
                $(slide).css("left", resetPoint + dif);
            }
            
            if(loop)
                moveImgLeft(velocity, slide, loop, "linear", thresholdX, resetPoint, rightToLeft);
        }
    }
);
}

var sliders = [];