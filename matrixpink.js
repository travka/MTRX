var CNV = document.getElementById("c");
var CTX = CNV.getContext("2d");
var columns;
var fontSize = 25;
var drops = [];
var dropSpeeds = [];
var activeDrops = [];
var dropCooldowns = [];
const colr = {};
colr.h = 290;   // bright purple hue
colr.s = 100;
colr.l = 50;
let drawDelay = 33;
let trailAlpha = 0.028;
var chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";

let firstLoad = true;

// Global trail and spacing settings for debug info
var maxTrailLength = 10;
var trailSpacingFactor = 30;
var columnSpacing = 1;
/////////////////////////////////////////////////////////
chinese = [...chinese];
console.log(chinese);
// javascript: (function () {
// 	var script = document.createElement('script');
// 	script.onload = function () {
// 		var stats = new Stats();
// 		document.body.appendChild(stats.dom);
// 		requestAnimationFrame(function loop() {
// 			stats.update();
// 			requestAnimationFrame(loop)
// 		});
// 	};
// 	script.src = '//mrdoob.github.io/stats.js/build/stats.min.js';
// 	document.head.appendChild(script);
// })()
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
	columns = Math.round(CNV.width / fontSize); //number of columns for the rain
	console.log(columns);
	for (var x = 0; x < columns; x++) {
	    drops[x] = Math.floor(Math.random() * (CNV.height / fontSize));
	    dropSpeeds[x] = 0.90 + Math.random() * 0.1; // speed factor between 0.95 and 1.05
	    activeDrops[x] = [];
	    dropCooldowns[x] = 0; // cooldown timer for new drops

	    // Initialize with 1 drop per column
	    let numDrops = 1;
	    const spacing = 100; // increase this value to increase vertical space between drops
	    const jitter = 100;   // small random offset to avoid perfect alignment
	    for (let j = 0; j < numDrops; j++) {
	        activeDrops[x].push({
	            y: 0,
	            speed: 0.5 + Math.random() * 0.1
	        });
	    }
	}
}

function resize() {
	CNV.style.width = CNV.width = window.innerWidth;
	CNV.style.height = CNV.height = window.innerHeight;
	calcColumns();
	// CTX.fillStyle = "rgba(0, 0, 0, 0.07)";
	CTX.fillStyle = "#000";

	CTX.fillRect(0, 0, CNV.width, CNV.height);

}
resize();
window.addEventListener("resize", resize);

let timer = performance.now();
let frameCounter = 0;
let currentFPS = 60;
let speedFactor = 0.2; // slow speed factor for smooth slow motion
let timerArray = [];
//drawing the characters
requestAnimationFrame(function draw() {
    setTimeout(() => {
        requestAnimationFrame(draw);
    }, drawDelay);

    frameCounter++;

    CTX.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
    CTX.fillRect(0, 0, CNV.width, CNV.height);
    CTX.fillStyle = `hsl(${colr.h},${colr.s}%,${colr.l}%)`; //green text
    CTX.font = fontSize + "px arial";

    for (var i = 0; i < drops.length; i++) {
        // Occasionally add a new drop at the top
        // Decrease cooldown timer
        if (dropCooldowns[i] > 0) {
            dropCooldowns[i]--;
        }

        if ((firstLoad || Math.random() > 0.98) && dropCooldowns[i] <= 0) {
            if (activeDrops[i].length === 0) { // only add new drop if none active
                activeDrops[i].push({
                    y: 0,
                    speed: 0.95 + Math.random() * 0.1,
                    char: chinese[Math.floor(Math.random() * chinese.length)],
                    changeRate: 0.98 + Math.random() * 0.02, // 0.98 - 1.0
                    trailAlpha: 0.01 + Math.random() * 0.09  // 0.01 - 0.1
                });
            }
        }

        for (let j = Math.max(0, activeDrops[i].length - maxTrailLength); j < activeDrops[i].length; j++) {
            let drop = activeDrops[i][j];
            let changeLetter = false;
            // Change letter if close to head (within 2 font heights)
            if (drop.y * fontSize - drop.y * fontSize % fontSize < CNV.height) {
                if (drop.y * fontSize - drop.y * fontSize % fontSize - drop.y * fontSize < 2 * fontSize) {
                    changeLetter = true;
                }
            }
            // Or randomly flicker with low chance
            if (Math.random() > drop.changeRate) {
                changeLetter = true;
            }
            if (currentFPS > 100) {
                changeLetter = (frameCounter % 3 === 0);
            }
            if (changeLetter) {
                drop.char = chinese[Math.floor(Math.random() * chinese.length)];
            }
            var text = drop.char || chinese[Math.floor(Math.random() * chinese.length)];
            
            let yPos;
            const defaultColor = `hsl(${colr.h},${colr.s}%,${colr.l}%)`;
            CTX.fillStyle = defaultColor;

            if (j === activeDrops[i].length - 1) {
                // Head: no extra spacing
                yPos = drop.y * fontSize;
            } else {
                // Trail: apply spacing
                yPos = (drop.y + j * trailSpacingFactor) * fontSize;
                CTX.fillStyle = defaultColor;
            }
            CTX.fillText(text, i * fontSize * columnSpacing, yPos);
    
            drop.y += drop.speed * speedFactor;
    
            if (drop.y * fontSize > CNV.height) {
                activeDrops[i].splice(j, 1);
                j--;
                dropCooldowns[i] = 30; // cooldown frames before new drop
            }
        }
    }

    if (firstLoad) {
        firstLoad = false;
    }

    if (viewDebugData) {
        let debugFontSize = 30;
        CTX.font = debugFontSize + "px arial"
        CTX.fillStyle = "#000";
        CTX.strokeStyle = "#fff";
        CTX.lineWidth = 2;
        CTX.fillRect(0, 0, 400, 500);
        CTX.strokeRect(0, 0, 400, 500);

        CTX.fillStyle = "#fff";
        CTX.fillText(`drawDelay  - ${drawDelay}`, 10, debugFontSize);
        CTX.fillText(`Hue	     - ${colr.h}`, 10, debugFontSize * 2);
        CTX.fillText(`Saturation - ${colr.s}`, 10, debugFontSize * 3);
        CTX.fillText(`Luminance  - ${colr.l}`, 10, debugFontSize * 4);
        CTX.fillText(`fontSize   - ${fontSize}`, 10, debugFontSize * 5);

        // New debug info
        CTX.fillText(`Columns    - ${drops.length}`, 10, debugFontSize * 6);

        let dropCounts = activeDrops.map(d => d.length);
        let minDrops = Math.min(...dropCounts);
        let maxDrops = Math.max(...dropCounts);
        let avgDrops = (dropCounts.reduce((a,b)=>a+b,0)/dropCounts.length).toFixed(2);

        CTX.fillText(`Drops/Col  - min:${minDrops} max:${maxDrops} avg:${avgDrops}`, 10, debugFontSize * 7);
        CTX.fillText(`Trail Len  - ${typeof maxTrailLength !== 'undefined' ? maxTrailLength : 'N/A'}`, 10, debugFontSize * 8);
        CTX.fillText(`Trail Spc  - ${typeof trailSpacing !== 'undefined' ? trailSpacing : 'N/A'}`, 10, debugFontSize * 9);
        CTX.fillText(`Col Spc    - ${typeof columnSpacing !== 'undefined' ? columnSpacing : 'N/A'}`, 10, debugFontSize * 10);

        let now = performance.now();
        let fps = 1000 / (now - timer);
        currentFPS = fps;
        timerArray.push(now - timer);
        if (timerArray.length > 20) timerArray.shift();
        let sum = timerArray.reduce((a, b) => (a + b)) / timerArray.length;
        CTX.fillText(`performance- ${Math.floor(fps)}fps`, 10, debugFontSize * 11);
        CTX.fillText(`               - ${Math.floor(now - timer)}ms`, 10, debugFontSize * 12);
        CTX.fillText(`               - ${Math.round(sum)}`, 10, debugFontSize * 13);

        timer = now;

        // Adjust trailAlpha based on FPS
        if (currentFPS > 60) {
            trailAlpha = 0.01; // longer trails at high FPS
        } else if (currentFPS < 30) {
            trailAlpha = 0.1; // shorter trails at low FPS
        } else {
            trailAlpha = 0.03; // default
        }
        // Clamp to minimum to avoid endless trails
        trailAlpha = Math.max(trailAlpha, 0.03);
    }
})

// function draw() {
// 	setTimeout(function () {
// 		requestAnimationFrame(draw);
// 	}, drawDelay)
// 	// requestAnimationFrame(draw);
// 	//Black BG for the canvas
// 	//translucent BG to show trail
// 	CTX.fillStyle = "rgba(0, 0, 0, 0.1)";
// 	CTX.fillRect(0, 0, CNV.width, CNV.height);
// 	CTX.fillStyle = `hsl(${colr.h},${colr.s}%,${colr.l}%)`; //green text
// 	CTX.font = fontSize + "px arial";
// 	//looping over drops
// 	for (var i = 0; i < drops.length; i++) {
// 		//a random chinese character to print
// 		var text = chinese[Math.floor(Math.random() * chinese.length)];
// 		//x = i*font_size, y = value of drops[i]*font_size
// 		CTX.fillText(text, i * fontSize, drops[i] * fontSize);

// 		//sending the drop back to the top randomly after it has crossed the screen
// 		//adding a randomness to the reset to make the drops scattered on the Y axis
// 		if (drops[i] * fontSize > CNV.height && Math.random() > 0.99) {
// 			drops[i] = 0;
// 		}
// 		//incrementing Y coordinate
// 		drops[i]++;
// 	}
// 	if (viewDebugData) {
// 		let debugFontSize = 30;
// 		CTX.font = debugFontSize + "px arial"
// 		CTX.fillStyle = "#000";
// 		CTX.strokeStyle = "#fff";
// 		CTX.lineWidth = 2;
// 		CTX.fillRect(0, 0, 300, 300);
// 		CTX.strokeRect(0, 0, 300, 300);

// 		CTX.fillStyle = "#fff";
// 		CTX.fillText(`drawDelay  - ${drawDelay}`, 10, debugFontSize);
// 		CTX.fillText(`Hue	     - ${colr.h}`, 10, debugFontSize * 2);
// 		CTX.fillText(`Saturation - ${colr.s}`, 10, debugFontSize * 3);
// 		CTX.fillText(`Luminance  - ${colr.l}`, 10, debugFontSize * 4);
// 		CTX.fillText(`fontSize   - ${fontSize}`, 10, debugFontSize * 5);
// 		// CTX.fillStyle = "#fff";
// 		let now = performance.now();
// 		CTX.fillText(`performance- ${Math.floor(1000/(now-timer))}fps`, 10, debugFontSize * 6);
// 		CTX.fillText(`               - ${Math.floor(now-timer)}ms`, 10, debugFontSize * 7);


// 		timer = now;
// 	}
// }
// draw();


CNV.addEventListener('click', fullScreen)

function fullScreen() {

	if (!document.fullscreen) {
		document.documentElement.requestFullscreen();
		document.documentElement.style.cursor = 'none';
	} else {
		document.exitFullscreen();
		document.documentElement.style.cursor = 'auto';
	}
}

document.addEventListener("keyup", keybHandler, false);

function keybHandler(event) {
	let keyPush = event.code.toUpperCase();
	console.log(keyPush);
	switch (keyPush) {
	    case "DIGIT1":
	        fullScreen();
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
	        colr.h += 10;
	        break;
	    case "DIGIT5":
	        colr.h -= 10;
	        break;
	    case "DIGIT6":
	        colr.s += 10;
	        break;
	    case "DIGIT7":
	        colr.s -= 10;
	        break;
	    case "DIGIT8":
	        drawDelay -= 1;
	        break;
	    case "DIGIT9":
	        drawDelay += 1;
	        break;
	    case "MINUS":
	        trailAlpha -= 0.01;
	        break;
	    case "EQUAL":
	        trailAlpha += 0.01;
	        break;
	    case "BACKQUOTE":
	        viewDebugData = !viewDebugData;
	        const popup = document.getElementById('popup');
	        if (popup.style.display === 'flex') {
	            popup.style.display = 'none';
	        } else {
	            popup.style.display = 'flex';
	        }
	        const debugElem = document.getElementById('debugInfo');
	        if (debugElem) debugElem.style.display = viewDebugData ? 'block' : 'none';
	        break;
	    case "KEYL":
	        trailAlpha = 0.05; // long trail
	        break;
	    case "KEYK":
	        trailAlpha = 0.3; // short trail
	        break;
	    case "KEYS":
	        colr.s += 5;
	        break;
	    case "KEYA":
	        colr.s -= 5;
	        break;
	    case "KEYR":
	        resetDefaults();
	        break;
	    case "KEYG":
	        colr.h = 120; colr.s = 100; colr.l = 50; // green
	        break;
	    case "KEYP":
	        colr.h = 320; colr.s = 100; colr.l = 50; // pink
	        break;
	    case "KEYB":
	        colr.h = 240; colr.s = 100; colr.l = 50; // blue
	        break;
	    case "KEYW":
	        colr.s = 0; colr.l = 100; // white
	        break;
	    case "KEYD":
	        colr.h = 290; colr.s = 100; colr.l = 50; // default pink
	        break;
	    case "KEYM":
	        colr.h = 120;
	        colr.s = 100;
	        colr.l = 50;
	        drawDelay = 30;
	        trailAlpha = 0.06;
	        break;
	    default:
	        break;
	}
	colr.h %= 360;
	colr.h < 0 ? colr.h = 350 : false;
	colr.s > 100 ? colr.s = 100 : false;
	colr.s < 0 ? colr.s = 0 : false;
	colr.l > 100 ? colr.l = 100 : false;
	colr.l < 0 ? colr.l = 0 : false;
	drawDelay > 200 ? drawDelay = 200 : false;
	drawDelay < 5 ? drawDelay = 5 : false;
	trailAlpha > 1 ? trailAlpha = 1 : false;
	trailAlpha < 0 ? trailAlpha = 0 : false;
	localStorage.setItem('drawDelay', drawDelay);
	localStorage.setItem('colr', JSON.stringify(colr));
	localStorage.setItem('fontSize', fontSize);
	console.log(colr)

	fontSize < 5 ? fontSize = 5 : false;
	// resize();
}

document.getElementById('openPopupBtn').addEventListener('click', function() {
    document.getElementById('popup').style.display = 'flex';
});

document.getElementById('closePopupBtn').addEventListener('click', function() {
    document.getElementById('popup').style.display = 'none';
});

// Ensure hotkeys work even when popup is focused
window.addEventListener("keyup", keybHandler, true);

// Update debug info every frame
function updateDebugInfo() {
    let totalDrops = 0;
    let minDrops = Infinity;
    let maxDrops = 0;
    for (let arr of activeDrops) {
        totalDrops += arr.length;
        if (arr.length < minDrops) minDrops = arr.length;
        if (arr.length > maxDrops) maxDrops = arr.length;
    }
    let avgDrops = (columns > 0) ? (totalDrops / columns).toFixed(2) : 0;

    let avgSpeed = 0;
    if (dropSpeeds.length > 0) {
        avgSpeed = dropSpeeds.reduce((a, b) => a + b, 0) / dropSpeeds.length;
    }

    const info = `
Time: ${new Date().toLocaleTimeString()}
drawDelay: ${drawDelay}
trailAlpha: ${trailAlpha.toFixed(3)}
fontSize: ${fontSize}
Hue: ${colr.h}
Saturation: ${colr.s}
Luminance: ${colr.l}
Columns: ${columns}
Active Drops: ${totalDrops}
Drops per Column: min ${minDrops}, max ${maxDrops}, avg ${avgDrops}
Avg Drop Speed: ${avgSpeed.toFixed(3)}
Fullscreen: ${!!document.fullscreenElement}
`;
    const debugElem = document.getElementById('debugInfo');
    if (debugElem) {
        debugElem.textContent = info;
        debugElem.style.display = viewDebugData ? 'block' : 'none';
    }
    requestAnimationFrame(updateDebugInfo);
}
requestAnimationFrame(updateDebugInfo);

// Reset button functionality
function resetDefaults() {
    drawDelay = 30;
    trailAlpha = 0.029;
    fontSize = 25;
    colr.h = 290;
    colr.s = 100;
    colr.l = 50;
    viewDebugData = false;

    calcColumns();

    // Reset active drops and speeds
    for (let i = 0; i < columns; i++) {
        activeDrops[i] = [];
        let numDrops = 1 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numDrops; j++) {
            activeDrops[i].push({
                y: Math.random() * (CNV.height / fontSize),
                speed: 0.95 + Math.random() * 0.13
            });
        }
        dropSpeeds[i] = 0.95 + Math.random() * 0.1;
    }

    localStorage.setItem('drawDelay', drawDelay);
    localStorage.setItem('colr', JSON.stringify(colr));
    localStorage.setItem('fontSize', fontSize);
}

document.getElementById('resetBtn').onclick = resetDefaults;