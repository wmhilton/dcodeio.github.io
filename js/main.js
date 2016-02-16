// Hi, this is chaos.

var canvas = document.getElementById("canvas0"),
    ctx = canvas.getContext('2d');

var colors = ["#69F", "#6F9", "#F66"],
    scale = 10, halfScale = scale/2,
    cols = (window.innerWidth/scale)|0,
    rows = (window.innerHeight/scale)|0,
    game = dcodeIO.GameOfLife(cols, rows, colors.length),
    universe = game.universe;

// Handle resize

function onResize () {
    cols = (window.innerWidth/scale)|0;
    rows = (window.innerHeight/scale)|0;
    canvas.width = (cols+1)*scale;
    canvas.height = (rows+1)*scale;
    game.resize(cols, rows);
};
window.onresize = onResize

// Renderer

var TWO_PI = 2*Math.PI;

function light(x, y, color) {
    var sy = y*scale+halfScale,
        sx = x*scale+halfScale;
    ctx.fillStyle = color;
    /* ctx.globalAlpha = 0.075;
    ctx.beginPath();
    ctx.arc(sx, sy, scale-0.5, 0, TWO_PI, false);
    ctx.fill();
    ctx.globalAlpha = 1.0; */
    ctx.beginPath();
    ctx.arc(sx, sy, halfScale-0.5, 0, TWO_PI, false);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(sx-1,sy-1, halfScale/2, 0, TWO_PI, false);
    ctx.fill();
}

function render() {
    var width = cols*scale,
        // halfWidth = width/2,
        height = rows*scale;
        // halfHeight = height/2;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(14,14,14,0.5)";
    ctx.lineHeight = 1;
    for (var y=0; y<height; y+=scale)
        ctx.beginPath(),
            ctx.moveTo(0, y+0.5),
            ctx.lineTo(width, y+0.5),
            ctx.stroke();
    for (var x=0; x<width; x+=scale)
        ctx.beginPath(),
            ctx.moveTo(x+0.5, 0),
            ctx.lineTo(x+0.5, height),
            ctx.stroke();
    var colorIndex;
    for (y=0; y<rows; ++y)
        for (x=0; x<cols; ++x)
            if ((colorIndex = universe[y][x]) !== -1)
                light(x, y, colors[colorIndex]);
    /* var grd = ctx.createRadialGradient(halfWidth, halfHeight, 200, halfWidth, halfHeight, halfWidth);
    grd.addColorStop(0, "rgba(0,0,0,0.0)");
    grd.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height); */
    ctx.restore();
}

// Text utility - removed from screensaver version

// Step update

function update() {
    // Render
    render();
    // Step
    if (running) game.step();
    update.count++;
}
update.count = 0;

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function tap(x, y) {
    var key, structure;
    key = randomStructure();
    structure = structures[key[0]][key[1]];
    var color;
    color = (Math.random()*colors.length)|0;
    game.set(x, y, structure, color, !running);
    update.count = 0;
}

function randomTap() {
    var x, y;
    x = getRandomInt(0, cols);
    y = getRandomInt(0, rows);
    tap(x,y);
    setTimeout(randomTap, getRandomInt(1,15)*1000);
}

canvas.onmousedown = function(e) {
    if (!e) e = window.event;
    tap((e.pageX/scale)|0, (e.pageY/scale)|0);
    return false;
};

// Controls

var running = true;

function toggleRunning() {
  running = !running;
  if (running) {
    document.getElementById('toggleRunning').innerHTML = '<i class="icon-pause"></i>';
  } else {
    document.getElementById('toggleRunning').innerHTML = '<i class="icon-play"></i>';
  }
  return false;
}

var lastState = null;

function saveGame() {
    lastState = [];
    for (var y=0; y<game.universe.length; ++y)
        lastState[y] = game.universe[y].slice();
}

function resetGame() {
    if (lastState === null) return false;
    while (game.universe.length > 0)
        game.universe.shift();
    for (var y=0; y<lastState.length; ++y) {
        game.universe[y] = lastState[y].slice();
    }
    window.onresize();
    return false;
}

function clearGame() {
    game.clear();
    return false;
}

(function() {
    var select = document.getElementById('structures'),
        keys = Object.keys(structures);
    for (var i=0; i<keys.length; ++i) {
        var group = document.createElement('optgroup');
        group.label = keys[i];
        select.appendChild(group);
        var subKeys = Object.keys(structures[keys[i]]);
        for (var j=0; j<subKeys.length; ++j) {
            var elem = document.createElement('option');
            elem.value = keys[i]+";"+subKeys[j];
            elem.innerHTML = subKeys[j];
            group.appendChild(elem);
        }
    }
    /* var continuous = document.getElementById('continuous-cb');
    continuous.onchange = function() {
        game.continuous = !!continuous.checked;
    };
    var scaleSelect = document.getElementById('scale');
    scaleSelect.onchange = function() {
        scale = parseInt(scaleSelect.value, 10);
        halfScale = scale/2;
        window.onresize();
    };
    scaleSelect.onchange(); */
})();

// Initialize

game.set((cols/2+12)|0, (rows/2)|0, structures["Oscillators"]["Unknown A"], 2);
game.set((cols/2-12)|0, (rows/2)|0, structures["Oscillators"]["Unknown A"], 0);
document.addEventListener("DOMContentLoaded", function(event) { 
  setTimeout(onResize, 5000);
  setInterval(update, 50);
  setTimeout(randomTap, getRandomInt(1,15)*1000);
})
