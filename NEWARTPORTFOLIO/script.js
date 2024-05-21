const cursor = new MouseFollower();
const el = document.querySelector('.header-image');

// el.addEventListener('mouseenter', () => {
//     cursor.setText('Hello!');
// });

// el.addEventListener('mouseleave', () => {
//     cursor.removeText();
// });


$(()=> {
    $("body").mousemove(function (e) {handleMouseMove(e)});
    window.requestAnimationFrame(updateParalax);

})

let dx1 = 0;
let dy1 = 0;

let dx2 = 0;
let dy2 = 0;


let mouseX = 0;
let mouseY = 0;

function handleMouseMove(e) {
    mouseX = parseInt(e.clientX);
    mouseY = parseInt(e.clientY);
}

function updateParalax()
{
    let element1 = $('#falling1');
    let element2 = $('#falling2');

    let viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    let viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Calculate the middle coordinates
    let middleX = viewportWidth / 2;
    let middleY = viewportHeight / 2;

    // let maxDist = Math.sqrt(Math.pow(middleX, 2) + Math.pow(middleY, 2));
    // let distanceFromMiddle = Math.sqrt(Math.pow(middleX - mouseX, 2) + Math.pow(middleY - mouseY, 2));

    let scalar = 25;
    let timeDelay = 10;

    let targetDx1 = (mouseX - middleX) / scalar;
    let targetDy1 = (mouseY - middleY) / scalar;
    let targetDx2 = (mouseX - middleX) / -scalar;
    let targetDy2 = (mouseY - middleY) / -scalar;

    dx1 += (targetDx1 - dx1) / timeDelay;
    dy1 += (targetDy1 - dy1) / timeDelay;
    dx2 += (targetDx2 - dx2) / timeDelay;
    dy2 += (targetDy2 - dy2) / timeDelay;
    
    element2.css('transform', `translate(${dx1}px, ${dy1}px)`);
    element1.css('transform', `translate(${dx2}px, ${dy2}px)`);
    window.requestAnimationFrame(updateParalax);
}