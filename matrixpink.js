var CNV = document.getElementById("c");
var CTX = CNV.getContext("2d");
var columns;
var fontSize = 24;
var drops = [];
var dropSpeeds = [];
var activeDrops = [];
const colr = {};
colr.h = 290;
colr.s = 100;
colr.l = 50;
let drawDelay = 50;
let trailAlpha = 0.02;
var chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";
/////////////////////////////////////////////////////////

var columnDelays = [];
var columnCounters = [];
chinese = [...chinese];
console.log(chinese);

let viewDebugData = false;

if (localStorage.getItem('colr') != null) {
	let cc = JSON.parse(localStorage.getItem('colr'));
	console.log(cc);
	colr.h = cc.h;
	colr.s = cc.s;
	colr.l = cc.l;
} else {
	localStorage.setItem('colr', JSON.stringify(colr));
}
if (localStorage.getItem('drawDelay') != null) {
	drawDelay = JSON.parse(localStorage.getItem('drawDelay'));
} else {
	localStorage.setItem('drawDelay', drawDelay);
}
if (localStorage.getItem('fontSize') != null) {
	fontSize = JSON.parse(localStorage.getItem('fontSize'));
} else {
	localStorage.setItem('fontSize', fontSize);
}

function calcColumns() {
	columns = Math.round(CNV.width / fontSize);
	console.log(columns);
	for (var x = 0; x < columns; x++) {
	    drops[x] = Math.floor(Math.random() * (CNV.height / fontSize));
	    dropSpeeds[x] = 0.95 + Math.random() * 0.1;
	    activeDrops[x] = [];
	    columnDelays[x] = 10 + Math.floor(Math.random() * 200); // 00 ms delay
	    columnCounters[x] = 0;
	    let numDrops = 1 + Math.floor(Math.random() * 3);
	    for (let j = 0; j < numDrops; j++) {
	        activeDrops[x].push({
	            y: Math.random() * (CNV.height / fontSize),
	            speed: 0.95 + Math.random() * 0.1
	        });
	    }
	}
}

function resize() {
	CNV.style.width = CNV.width = window.innerWidth;
	CNV.style.height = CNV.height = window.innerHeight;
	calcColumns();
	CTX.fillStyle = "#000";
	CTX.fillRect(0, 0, CNV.width, CNV.height);
}
resize();
window.addEventListener("resize", resize);

let timer = performance.now();
let timerArray = [];

requestAnimationFrame(function draw() {
    setTimeout(() => {
        requestAnimationFrame(draw);
    }, drawDelay);

    let minAlpha = trailAlpha;
    for (let i = 0; i < activeDrops.length; i++) {
        for (let j = 0; j < activeDrops[i].length; j++) {
            if (activeDrops[i][j].trailAlpha !== undefined) {
                minAlpha = Math.min(minAlpha, activeDrops[i][j].trailAlpha);
            }
        }
    }
    CTX.fillStyle = `rgba(0, 0, 0, ${minAlpha})`;
    CTX.fillRect(0, 0, CNV.width, CNV.height);
    CTX.fillStyle = `hsl(${colr.h},${colr.s}%,${colr.l}%)`;
    CTX.font = fontSize + "px arial";

    for (var i = 0; i < drops.length; i++) {
        columnCounters[i] += drawDelay;
        if (columnCounters[i] < columnDelays[i]) {
            continue; // skip update for this column
        }
        columnCounters[i] = 0; // reset counter

        if (Math.random() > 0.98) {
            let lastDrop = activeDrops[i][activeDrops[i].length - 1];
            if (!lastDrop || lastDrop.y * fontSize > CNV.height / 2) {
                let speed = 0.95 + Math.random() * 0.1;
                let baseAlpha = 0.2;
                let maxSpeed = 1.05;
                let minAlpha = 0.05;
                let maxAlpha = 0.3;
                let trailAlphaDrop = baseAlpha * (maxSpeed / speed);
                trailAlphaDrop = Math.max(minAlpha, Math.min(maxAlpha, trailAlphaDrop));

                activeDrops[i].push({
                    y: 0,
                    speed: speed,
                    trailAlpha: trailAlphaDrop
                });
            }
        }

        for (let j = 0; j < activeDrops[i].length; j++) {
            let drop = activeDrops[i][j];
            var text = chinese[Math.floor(Math.random() * chinese.length)];
            CTX.fillText(text, i * fontSize, drop.y * fontSize);

            drop.y += drop.speed;

            if (drop.y * fontSize > CNV.height) {
                activeDrops[i].splice(j, 1);
                j--;
            }
        }
    }

    if (viewDebugData) {
        let debugFontSize = 30;
        CTX.font = debugFontSize + "px arial";
        CTX.fillStyle = "#000";
        CTX.strokeStyle = "#fff";
        CTX.lineWidth = 2;
        CTX.fillRect(0, 0, 300, 300);
        CTX.strokeRect(0, 0, 300, 300);

        CTX.fillStyle = "#fff";
        CTX.fillText(`drawDelay  - ${drawDelay}`, 10, debugFontSize);
        CTX.fillText(`Hue        - ${colr.h}`, 10, debugFontSize * 2);
        CTX.fillText(`Saturation - ${colr.s}`, 10, debugFontSize * 3);
        CTX.fillText(`Luminance  - ${colr.l}`, 10, debugFontSize * 4);
        CTX.fillText(`fontSize   - ${fontSize}`, 10, debugFontSize * 5);

        let now = performance.now();
        timerArray.push(now - timer);
        if (timerArray.length > 20) timerArray.shift();
        let sum = timerArray.reduce((a, b) => (a + b)) / timerArray.length;
        CTX.fillText(`performance- ${Math.floor(1000 / (now - timer))}fps`, 10, debugFontSize * 6);
        CTX.fillText(`               - ${Math.floor(now - timer)}ms`, 10, debugFontSize * 7);
        CTX.fillText(`               - ${Math.round(sum)}`, 10, debugFontSize * 9);

        timer = now;
    }
});

// Hotkeys
document.addEventListener("keyup", keybHandler, false);

function keybHandler(event) {
	let keyPush = event.code.toUpperCase();
	console.log(keyPush);
	switch (keyPush) {
	    case "DIGIT1":
	        if (!document.fullscreenElement) {
	            document.documentElement.requestFullscreen();
	        } else {
	            document.exitFullscreen();
	        }
	        break;
	    case "DIGIT2":
	        fontSize--;
	        calcColumns();
	        break;
	    case "DIGIT3":
	        fontSize++;
	        calcColumns();
	        break;
	    case "DIGIT4":
	        colr.h = (colr.h + 10) % 360;
	        break;
	    case "DIGIT5":
	        colr.h = (colr.h - 10 + 360) % 360;
	        break;
	    case "DIGIT6":
	        colr.s = Math.min(colr.s + 10, 100);
	        break;
	    case "DIGIT7":
	        colr.s = Math.max(colr.s - 10, 0);
	        break;
	    case "DIGIT8":
	        drawDelay = Math.max(drawDelay - 1, 5);
	        break;
	    case "DIGIT9":
	        drawDelay = Math.min(drawDelay + 1, 200);
	        break;
	    case "MINUS":
	        trailAlpha = Math.max(trailAlpha - 0.01, 0);
	        break;
	    case "EQUAL":
	        trailAlpha = Math.min(trailAlpha + 0.01, 1);
	        break;
	    case "BACKQUOTE":
	        viewDebugData = !viewDebugData;
	        break;
	    default:
	        break;
	}
	localStorage.setItem('drawDelay', drawDelay);
	localStorage.setItem('colr', JSON.stringify(colr));
	localStorage.setItem('fontSize', fontSize);
	console.log(colr);
}

// Every minute, update 20% of column delays randomly
setInterval(() => {
    if (!columns) return;
    let count = Math.floor(columns * 0.2);

    // Calculate current median delay
    let sorted = [...columnDelays].sort((a, b) => a - b);
    let medianDelay = sorted[Math.floor(sorted.length / 2)];

    for (let n = 0; n < count; n++) {
        let idx = Math.floor(Math.random() * columns);
        // Vary around median ±50ms, clamp to 20-200ms
        let newDelay = medianDelay + (Math.random() - 0.5) * 100;
        columnDelays[idx] = Math.max(20, Math.min(200, newDelay));
    }
    console.log("Updated delays for", count, "columns, median approx", medianDelay);
}, 60000);