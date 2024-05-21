document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const boids = [];

    class Boid {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.dx = Math.random() * 2 - 1; // Random initial velocity
            this.dy = Math.random() * 2 - 1; // Random initial velocity
            this.minSpeed = .5;
            this.maxSpeed = 2;
        }

        update(boids) {
            const separationRadius = 20; // Radius within which separation behavior is applied
            const alignmentRadius = 10; // Radius within which alignment behavior is applied
            const cohesionRadius = 80; // Radius within which cohesion behavior is applied
            const separationForce = 0.05; // Strength of separation behavior
            const alignmentForce = 0.1; // Strength of alignment behavior
            const cohesionForce = 0.0005; // Strength of cohesion behavior

            const sideRadius = 10;
            const sideForce = 0.5;

            const mouseRadius = 300;
            const mouseForce = 0.8;

            // Calculate the average position and heading of local flockmates
            let avgX = 0;
            let avgY = 0;
            let avgDx = 0;
            let avgDy = 0;
            let separationCount = 0;
            let alignmentCount = 0;
            let cohesionCount = 0;

            boids.forEach(otherBoid => {
                if (otherBoid !== this) {

                    const distance = Math.sqrt((this.x - otherBoid.x) ** 2 + (this.y - otherBoid.y) ** 2);

                    const dx = this.x - otherBoid.x;
                    const dy = this.y - otherBoid.y;

                    if (distance < separationRadius) {
                        avgDx += dx * separationForce;
                        avgDy += dy * separationForce;
                    }

                    // if (distance < alignmentRadius) {
                    //     avgDx += otherBoid.dx * (alignmentRadius / safeDistance) * alignmentForce;
                    //     avgDy += otherBoid.dy * (alignmentRadius / safeDistance) * alignmentForce;
                    // }

                    if (distance < cohesionRadius) {
                        avgDx -= dx * cohesionForce;
                        avgDy -= dy * cohesionForce;
                    }
                }
            });


            // Find closest side and avoid it
            const topLeft = [0, 0];
            const bottomRight = [canvas.width, canvas.height];
            const point = [this.x, this.y];
            const { closestSide, distanceToClosestPoint } = closestSideDistance(topLeft, bottomRight, point);
                   
            // Go towards mouse
            const distanceToMouse = Math.sqrt((this.x - mouseX) ** 2 + (this.y - mouseY) ** 2);

            const mouseAngle = Math.atan2(mouseY - this.y, mouseX - this.x);

            if(distanceToMouse <= mouseRadius)
            {
                avgDx += Math.cos(mouseAngle) * mouseForce;
                avgDy += Math.sin(mouseAngle) * mouseForce;
            }
            else
            {
                avgDx += Math.cos(mouseAngle) * mouseForce * (1 / (distanceToMouse - mouseRadius));
                avgDy += Math.sin(mouseAngle) * mouseForce  * (1 / (distanceToMouse - mouseRadius));
            }

            if(distanceToClosestPoint < sideRadius)
            {
                if(closestSide == 0) //Left
                    avgDx += (sideRadius / distanceToClosestPoint) * sideForce;
                else if(closestSide == 1) //Right
                    avgDx -= (sideRadius / distanceToClosestPoint) * sideForce;
                else if(closestSide == 2) //Top
                    avgDy += (sideRadius / distanceToClosestPoint) * sideForce;
                else if(closestSide == 3) //Bottom
                    avgDy -= (sideRadius / distanceToClosestPoint) * sideForce;
            }

            this.dx += avgDx * .05;
            this.dy += avgDy * .05;

            // Limit the maximum velocity
            const speed = Math.sqrt(this.dx ** 2 + this.dy ** 2);

            if (speed > this.maxSpeed) {
                const ratio = this.maxSpeed / speed;
                this.dx *= ratio;
                this.dy *= ratio;
            }

            if(speed < this.minSpeed)
            {
                const ratio = this.minSpeed / speed;
                this.dx *= ratio;
                this.dy *= ratio;
            }

            // Update the position based on velocity
            this.x += this.dx;
            this.y += this.dy;




            // Limit the boid's position to within the canvas boundaries
            this.x = Math.max(0, Math.min(canvas.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height, this.y));
        }

        draw() {
        ctx.save(); 
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.dy, this.dx));
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 5);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.restore(); 
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        boids.forEach(boid => {
            boid.update(boids);
            boid.draw();
        });
    }

    function init() {
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            boids.push(new Boid(x, y));
        }
        animate();
    }

    $("#canvas").mousemove(function (e) {handleMouseMove(e)});

    init();
});



//--------------


function closestSideDistance(topLeft, bottomRight, point) {
    const [x1, y1] = topLeft; // Coordinates of the top-left corner of the square
    const [x2, y2] = bottomRight; // Coordinates of the bottom-right corner of the square
    const [px, py] = point; // Coordinates of the given point inside the square

    // Calculate the center of the square
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    // Calculate the closest side
    let closestSide;
    let minDistance;

    // Calculate distances to each side and find the minimum
    const distances = [
        Math.abs(px - x1), // Distance to the left side
        Math.abs(px - x2), // Distance to the right side
        Math.abs(py - y1), // Distance to the top side
        Math.abs(py - y2)  // Distance to the bottom side
    ];

    minDistance = Math.min(...distances);
    closestSide = distances.indexOf(minDistance);

    // Calculate the distance to the closest point on the closest side
    let distanceToClosestPoint;

    switch (closestSide) {
        case 0: // Left side
            distanceToClosestPoint = Math.abs(px - x1);
            break;
        case 1: // Right side
            distanceToClosestPoint = Math.abs(px - x2);
            break;
        case 2: // Top side
            distanceToClosestPoint = Math.abs(py - y1);
            break;
        case 3: // Bottom side
            distanceToClosestPoint = Math.abs(py - y2);
            break;
    }

    return { closestSide, distanceToClosestPoint };
}




let mouseX = -10;
let mouseY = -10;
var canvasOffset = $("#canvas").offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;


function handleMouseMove(e) {
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    $("#movelog").html("Move: " + mouseX + " / " + mouseY);

    transform: translate(42px, 18px);

    var element1 = $('#falling1');
    var element2 = $('#falling2');
    // Set the transform property using jQuery
    element1.css('transform', `translate(${}px, ${}px)`);
}

