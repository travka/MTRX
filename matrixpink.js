var CNV = document.getElementById("c");
var CTX = CNV.getContext("2d");
var columns;
var fontSize = 15;
var drops = [];
var dropSpeeds = [];
var activeDrops = [];
const colr = {};
colr.h = 290;
colr.s = 100;
colr.l = 50;
let drawDelay = 40;
let trailAlpha = 0.05;
var chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";
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
	    dropSpeeds[x] = 0.95 + Math.random() * 0.1; // speed factor between 0.95 and 1.05
	    activeDrops[x] = [];
	    // Initialize with 1-3 drops per column
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
	// CTX.fillStyle = "rgba(0, 0, 0, 0.07)";
	CTX.fillStyle = "#000";

	CTX.fillRect(0, 0, CNV.width, CNV.height);

}
resize();
window.addEventListener("resize", resize);

let timer = performance.now();
let timerArray = [];
//drawing the characters
requestAnimationFrame(function draw() {
    setTimeout(() => {
        requestAnimationFrame(draw);
    }, drawDelay);
	
	   CTX.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
	   CTX.fillRect(0, 0, CNV.width, CNV.height);
	CTX.fillStyle = `hsl(${colr.h},${colr.s}%,${colr.l}%)`; //green text
	CTX.font = fontSize + "px arial";
	//looping over drops
	for (var i = 0; i < drops.length; i++) {
		// Occasionally add a new drop at the top
		if (Math.random() > 0.98) {
			activeDrops[i].push({
				y: 0,
				speed: 0.95 + Math.random() * 0.1
			});
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
		CTX.font = debugFontSize + "px arial"
		CTX.fillStyle = "#000";
		CTX.strokeStyle = "#fff";
		CTX.lineWidth = 2;
		CTX.fillRect(0, 0, 300, 300);
		CTX.strokeRect(0, 0, 300, 300);

		CTX.fillStyle = "#fff";
		CTX.fillText(`drawDelay  - ${drawDelay}`, 10, debugFontSize);
		CTX.fillText(`Hue	     - ${colr.h}`, 10, debugFontSize * 2);
		CTX.fillText(`Saturation - ${colr.s}`, 10, debugFontSize * 3);
		CTX.fillText(`Luminance  - ${colr.l}`, 10, debugFontSize * 4);
		CTX.fillText(`fontSize   - ${fontSize}`, 10, debugFontSize * 5);
		// CTX.fillStyle = "#fff";
		let now = performance.now();
		timerArray.push(now-timer);
		if (timerArray.length > 20) timerArray.shift();
		let sum = timerArray.reduce((a, b) => (a + b)) / timerArray.length;
		CTX.fillText(`performance- ${Math.floor(1000/(now-timer))}fps`, 10, debugFontSize * 6);
		CTX.fillText(`               - ${Math.floor(now-timer)}ms`, 10, debugFontSize * 7);
CTX.fillText(`               - ${Math.round(sum)}`, 10, debugFontSize * 9);

		timer = now;
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
	        drawDelay = 50;
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
    drawDelay = 40;
    trailAlpha = 0.06;
    fontSize = 15;
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
                speed: 0.95 + Math.random() * 0.1
            });
        }
        dropSpeeds[i] = 0.95 + Math.random() * 0.1;
    }

    localStorage.setItem('drawDelay', drawDelay);
    localStorage.setItem('colr', JSON.stringify(colr));
    localStorage.setItem('fontSize', fontSize);
}

document.getElementById('resetBtn').onclick = resetDefaults;