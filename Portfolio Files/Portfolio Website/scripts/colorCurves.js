function generateSVGPath(numPoints, startPos, endPos, width, height, horizontal, flip, padding)
{
  let maxAngle = Math.PI / 4;
  let magnitude = horizontal ? width / (numPoints + 8): height / (numPoints + 8);

  let points = generatePoints(numPoints, startPos, endPos, magnitude, maxAngle, width, height, horizontal, flip, padding);

  let returnObj =
  {
    svgObj:
    {
      points: points,
      startPos: startPos,
      endPos: endPos,
      width: width,
      height: height,
      flip: flip,
      horizontal: horizontal
    }
  }

  returnObj.svg = generateSVG(returnObj.svgObj);
  return returnObj;
}

function generatePoints(numPoints, startPos, endPos, magnitude, maxAngle, width, height, horizontal, flip, padding)
{
  let points = [];
  let zeroAngle = horizontal ? 0 : Math.PI / 2;

  let startPointX = horizontal ? 0 : startPos;
  let startPointY = horizontal ? startPos : 0;

  let flipNeg = flip ? 1: -1;

  points.push({x:startPointX, y:startPointY, m: magnitude, a: flipNeg * maxAngle * Math.random() + zeroAngle});

  for (let i = 1; i <= numPoints; i++) {

    let neg = i % 2 == 0 ? -1 : 1;

    let x = horizontal ? width / (numPoints + 1) * i : (width - 2 * padding) * Math.random() + padding;
    let y = horizontal ? (height - 2 * padding) * Math.random() + padding: height / (numPoints + 1) * i;

    let a = maxAngle * Math.random();

    let point = {
      x: x,
      y: y,
      m: magnitude,
      a: a * neg + zeroAngle
    }

    points.push(point);
  }

  let endPointX = horizontal ? width : endPos;
  let endPointY = horizontal ? endPos : height;

  points.push({x:endPointX, y:endPointY, m: magnitude, a: -1 * flipNeg * maxAngle * Math.random() + zeroAngle});
  return points;
}

function pointsToSVG(points)
{
  let svg = ""

  points.forEach((point, i) => {
    let handle1X = Math.cos(point.a + Math.PI) * point.m;
    let handle1Y = Math.sin(point.a + Math.PI) * point.m;

    if(i > 0)
      svg += `C ${prevPoint.hx} ${prevPoint.hy} ${handle1X + point.x} ${handle1Y + point.y} ${point.x} ${point.y}, `;

    prevPoint = {hx: point.x - handle1X, hy: point.y - handle1Y};
  });

  return svg;
}

function generateSVG(obj)
{
  let svg = obj.horizontal ? `M 0 ${obj.startPos},` : `M ${obj.startPos} 0,`;
  let prevPoint;

  svg += pointsToSVG(obj.points);

  if(obj.flip && obj.horizontal)
  {
    svg += `L ${obj.width} 0,`;
    svg += "L 0 0,";
    svg += "Z";
  }
  else if(obj.horizontal)
  {
    svg += `L ${obj.width} ${obj.height},`;
    svg += `L 0 ${obj.height},`;
    svg += "Z";
  }
  else if(obj.flip && !obj.horizontal)
  {
    svg += `L 0 ${obj.height},`;
    svg += "L 0 0,";
    svg += "Z";
  }
  else if(!obj.horizontal)
  {
    svg += `L ${obj.width} ${obj.height},`;
    svg += `L ${obj.width} 0,`;
    svg += "Z";
  }

  return svg;
}

function spawSVGCurves()
{
  let path1 = generateSVGPath(3, 0, 0, 200, window.innerHeight, false, true, 30);
  let path1R = generateSVGPath(2, 300, 300, 300, window.innerHeight, false, false, 30);
  
  document.getElementById("curvePath1").setAttribute("d", path1.svg);
  document.getElementById("curvePath1").setAttribute("fill", headerColor);
  
  document.getElementById("curvePath1R").setAttribute("d", path1R.svg);
  document.getElementById("curvePath1R").setAttribute("fill", headerColor);
  
  var paths = [];
  
  paths.push(path1);
  paths.push(path1R);

  //requestAnimationFrame(update);
}

let intensity = 1.1;
let t = 0;

function update(){

  t++;

  for (var i = 0; i < paths.length; i++) {
    let path = paths[i];

    for (var x = 0; x < path.svgObj.points.length; x++) {
      let tx = (t / 20) + 20;
      path.svgObj.points[i].x += intensity * Math.sin(tx);
    }

    path.svg = generateSVG(path.svgObj);

    var pathIDNum = (i + 1);

    document.getElementById("curvePath" + pathIDNum).setAttribute("d", path.svg);
  }

  //requestAnimationFrame(update);

}

var checkScrollSpeed = (function(settings){
    settings = settings || {};

    var lastPos, newPos, timer, delta,
        delay = settings.delay || 50; // in "ms" (higher means lower fidelity )

    function clear() {
      lastPos = null;
      delta = 0;
    }

    clear();

    return function(){
      newPos = window.scrollY;
      if ( lastPos != null ){ // && newPos < maxScroll
        delta = newPos -  lastPos;
      }
      lastPos = newPos;
      clearTimeout(timer);
      timer = setTimeout(clear, delay);
      return delta;
    };
})();
