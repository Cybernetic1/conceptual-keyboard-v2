// TODO:
// * 'gg' record in history also

// DONE:
// * 'do-shell' takes a circuitous route

// ******************************* Menu buttons ********************************

// * Already defined:
// const white_box = document.getElementById("white-box");

// Key pressed on White-Box
white_box.onkeypress = function(e) {
	if (!e)
		e = window.event;

	var keyCode = e.keyCode || e.which;

	// console.log("Ctrl=", e.ctrlKey);
	// console.log("keyCode=", keyCode);

	if (keyCode === 13) {		// enter key = 13 or 10
		if (e.shiftKey)			// if shift, process as normal enter
			return true;
		// Don't know why but enter = 13, ctrl + enter = 10
		if (dreamState.value == "all")
			// normally, ctrlKey causes to send to Dream
			shortsend(e.ctrlKey);
		else
			shortsend(!e.ctrlKey);
		return false;
	}
};

// This button controls where to send messages: UT stream or Firefox stream
// As the universal stream is now working perfectly, this function is not
// needed.
// UT Stream = UT-room.py 网际空间
// Firefox = HK Chatroom (and other 寻梦园's) = universal
var dreamState = document.getElementById('UT-or-all');
dreamState.onclick = function () {
	if (this.value == "UT") {
		this.value = "all";
		this.innerText = "∀";
		}
	else {
		this.value = "UT";
		this.innerText = "UT";
		}
	};

var last_dream = ""
function send2Chat(str, dream=false) {
	if (dream || document.getElementById('UT-or-all').value == 'UT') {
		// **** Send to UT-room.py UT-网际空间 only, old method using Selenium
		if (str == last_dream)
			str = "..." + str;
		last_dream = str;
		
		// send to UT-room
		$.ajax({
			method: "POST",
			url: "./UT-room",
			data: str,
			success: function(resp) {
				console.log("UT-room: " + str);
				}
			});
		}
	else {
		// **** This is to Firefox (eg. Chatroom.HK, 寻梦园)
		var str2 = str.replace(/\//g, "|");
		str = str2.replace(/\'/g, "`");
		
		$.ajax({
			method: "POST",
			url: "./fireFox",
			data: str,
			success: function(resp) {
				console.log("Firefox: " + str);
				}
			});
		}
}

// ************* This is used when 'enter' is pressed or '↵' button is clicked:
function shortsend(dream = false) {
	str = document.getElementById("white-box").value;

	// **** If input ends with 'gg' ---> go to Google search
	if (str.endsWith('gg')) {
		window.open("https://www.google.com/search?q=" + str.slice(0,-2));
		return;
	}

	// **** If input ends with 'cc' ---> Google search with 中文
	if (str.endsWith('cc')) {
		window.open("https://www.google.com/search?q=" + str.slice(0,-2) + "%20中文");
		return;
	}

	// **** If input ends with 'yy' ---> Google search with 粤语
	if (str.endsWith('yy')) {
		window.open("https://www.google.com/search?q=" + str.slice(0,-2) + "%20粤语");
		return;
	}

	str = simplify(str);			// when sending to chat rooms, no simplify
	str = replaceYKY(str);

	/*
	if (to_skype) {			// Try to send text to Skype chat dialog
		Skype.ui({				// don't know how to do it yet...
			name: "",
			element: "",
			participants: [""]
		});
	}
	*/

	recordHistory(str);
	display_pinyin(str);

	/***** Send to Pidgin #0?
	if ($("#to-pidgin0").prop("checked") === true) {
		var userName = document.getElementsByName("pidgin-who0")[0].value;
		sendPidgin(userName, str);
		return;
	}

	// Send to Pidgin #1?
	if ($("#to-pidgin1").prop("checked") === true) {
		var userName = document.getElementsByName("pidgin-who1")[0].value;
		sendPidgin(userName, str);
		return;
	}
	*****/

	send2Chat(str, dream);

	// clear input box
	document.getElementById("white-box").value = "";

	var audio = new Audio("sending.ogg");
	audio.play();
}

document.getElementById("carriage-return").addEventListener("click", shortsend.bind(null, false), false);

document.getElementById("quick-simplify").addEventListener("click", function() {
	var whiteBox = document.getElementById("white-box");
	str = whiteBox.value;
	str = simplify(str, forcing=true);	// true means force simplify
	str = replaceYKY(str);
	whiteBox.value = str;

	whiteBox.focus();
	whiteBox.select();
	try {
		var successful = document.execCommand('copy');
		// var msg = successful ? 'success' : 'failure';
		// console.log('Copying text:' + msg);
	} catch (err) {
		console.error('Oops, unable to copy:', err);
	}

	// Copy to clipboard, by sending to Chrome Extension Content Script first
	// The window.postMessage commmand seems obsolete:
	//window.postMessage({type: "CLIPBOARD", text: str}, "*");

	recordHistory(str);

	// clear input box
	whiteBox.value = "";

	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

document.getElementById("quick-complex").addEventListener("click", function() {
	var whiteBox = document.getElementById("white-box");
	str = whiteBox.value;
	str = traditionalize(str);
	str = replaceYKY(str);
	whiteBox.value = str;

	whiteBox.focus();
	whiteBox.select();
	try {
		var successful = document.execCommand('copy');
		// var msg = successful ? 'success' : 'failure';
		// console.log('Copying text:' + msg);
	} catch (err) {
		console.error('Oops, unable to copy:', err);
	}

	// Copy to clipboard, by sending to Chrome Extension Content Script first
	// The window.postMessage commmand seems obsolete:
	//window.postMessage({type: "CLIPBOARD", text: str}, "*");

	recordHistory(str);

	// clear input box
	whiteBox.value = "";

	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

document.getElementById("clear-white").addEventListener("click", function() {
	document.getElementById("pinyin-box").innerHTML = "";
	white_box.value = "";
	white_box.focus();
	upperLevels.innerHTML = ""
	main_list = [];
	current_pinyin = "";
	pinyin_bar.innerText = "";
	history_view_index = -1;		// No longer in history mode
}, false);

document.getElementById("smile").addEventListener("click", function() {
	document.getElementById("white-box").value += " :)";
}, false);

document.getElementById("smile").oncontextmenu = function(ev) {
//	document.getElementById("white-box").value += " :)";
	send2Chat(" :)");
	// console.log("I'm sending something");
	var audio = new Audio("sending.ogg");
	audio.play();
	return false;
};

document.getElementById("quotes").addEventListener("click", function(e) {
	str = white_box.value;
	var quoted = "「" + str + "」";
	if (e.altKey || e.ctrlKey || e.shiftKey)
		quoted = "『" + str + "』";
	white_box.value = quoted;
}, false);

document.getElementById("parentheses").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	document.getElementById("white-box").value = "（" + str + "）";
}, false);

var butt1 = document.getElementById("paste1");
butt1.title = "妳好 :)";
butt1.addEventListener("click", function() {
	send2Chat(butt1.title);
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

var butt2 = document.getElementById("paste2");
butt2.title = "喜歡玩文字網愛嗎?";
butt2.addEventListener("click", function() {
	send2Chat(butt2.title);
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

var butt3 = document.getElementById("paste3");
butt3.title = "晚上好 :)";
butt3.addEventListener("click", function() {
	send2Chat(butt3.title);
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);
butt3.oncontextmenu = function() {
	butt3.title = document.getElementById("white-box").value;
	document.getElementById("white-box").value = "";
	var audio = new Audio("sending.ogg");
	audio.play();
	return false;	// suppress context menu
};

// Send message to DreamLand
// document.getElementById("to-dream").addEventListener("click", shortsend.bind(null, true), false);

// ==== For dealing with Drop-down menu ====

/* When the user clicks on the button, toggle between hiding and showing the dropdown content */
function onDropDown() {
    document.getElementById("dropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

var menuShowing = false;
// These are copied from below:
document.getElementById("upperLevels").style.display = "none";
document.getElementById("mid-levels").style.display = "initial";
document.getElementById("bottom").style.display = "initial";

document.getElementById("▼").addEventListener("click", function() {
	if (menuShowing) {
		document.getElementById("mid-levels").style.display = "none";
		document.getElementById("bottom").style.display = "none";
		document.getElementById("upperLevels").style.height = "350px";
		document.getElementById("upperLevels").style.display = "initial";
		}
	else {
		document.getElementById("upperLevels").style.display = "none";
		document.getElementById("mid-levels").style.display = "initial";
		document.getElementById("bottom").style.display = "initial";
		}

	menuShowing = !menuShowing;
	var audio = new Audio("sending.ogg");
	audio.play();
});

document.getElementById("do-log").addEventListener("click", function() {
	// **** No need to get date & time -- server will do that automatically
	// Get date and time
	// var date = new Date();
	// var logName = date.toDateString().replace(/ /g,"-");
	const fname = document.getElementById("white-box").value;
	if (fname.length == 0)
		send2Chat("!log quick");
	else
		send2Chat("!log " + fname);
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

document.getElementById("do-history").addEventListener("click", function() {
	send2Chat("!his");
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

document.getElementById("do-shell").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	// old method is inefficient: send2Chat("!sh " + str);
	$.ajax({
		method: "POST",
		url: "http://localhost:8484/shellCommand/" + str,
		contentType: "application/json; charset=utf-8",
		// dataType: "text",	// This affects the data to be received
		processData: false,
		data: "nil",
		success: function(resp) {
			console.log("Sent command:", str);
		}
	});
}, false);

document.getElementById("do-URL-unescape").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	str2 = decodeURIComponent(str);
	document.getElementById("white-box").value = str2;
}, false);

document.getElementById("do-URL-escape").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	str2 = encodeURIComponent(str);
	document.getElementById("white-box").value = str2;
}, false);

document.getElementById("do-traditionalize").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	str2 = traditionalize(str);
	document.getElementById("white-box").value = str2;
}, false);

document.getElementById("do-Google").addEventListener("click", function() {
	// Open browser and search Google
	str = document.getElementById("white-box").value;
	window.open("https://www.google.com/search?q=" + str);
}, false);

document.getElementById("do-Mandarin").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	// Copy to Red Box
	//document.getElementById("pinyin-box").value = str;
	$.ajax({
		method: "POST",
		url: "./speakMandarin",
		contentType: "application/json; charset=utf-8",
		processData: false,
		data: str,
		success: function(resp) {
			console.log("Mandarin: " + str);
		}
	});
}, false);

document.getElementById("do-Cantonese").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	// Copy to Pink Box
	// document.getElementById("pink-box").value = str;
	// cantonize(str);
	// Pronunciate it
	$.ajax({
		method: "POST",
		url: "/speakCantonese",
		contentType: "application/json; charset=utf-8",
		processData: false,
		data: str,
		success: function(resp) {
			console.log("Mandarin: " + str);
			}
	});
}, false);

document.getElementById("do-pinyin").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	display_pinyin(str);
	// Pronunciate it
	$.ajax({
		method: "POST",
		url: "/speakMandarin/",
		data: str,
		success: function(resp) {
			// nothing
			}
	});
}, false);

document.getElementById("do-Russian-1").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	var str2 = translateRussianToEnglish(str);
	document.getElementById("pinyin-box").innerHTML = str2;
}, false);

document.getElementById("do-Russian").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	var str2 = translateEnglishToRussian(str);
	document.getElementById("pinyin-box").innerHTML = str2;
}, false);

// For 中文
document.getElementById("do-rotate").addEventListener("click", function() {
	str = document.getElementById("white-box").value;

	const rotatedChars = {
	  '「': '﹁',
	  '」': '﹂',
	  '﹁':'「',
	  '﹂':'」'
	};

	str = str.replace(/[「」]/g, m => rotatedChars[m]);
	// break str into lines
	strs = str.split('\n');
	const numlines = strs.length;
	console.log(numlines);
	const maxlen = strs.reduce((m,x) => x.length > m ? x.length : m, 0);
	// for each line, pad to max length
	const strs2 = strs.map(function(line) {
		return line.padEnd(maxlen, '　');	// note: this is a double-width space
		});
	console.log(strs2);
	var strs3 = [];
	for (var j = 0; j < maxlen; ++j)
		strs3.push("");
	console.log(strs3);
	//console.log(strs2[1][1]);
	for (var i = 0; i < numlines; ++i)
		for (var j = 0; j < maxlen; ++j)
			strs3[j] += strs2[i][j];

	document.getElementById("white-box").value = strs3.join('\n');
	console.log(strs3);
}, false);

var flipTable = {
'\u0021' : '\u00A1',
'\u0022' : '\u201E',
'\u0026' : '\u214B',
'\u0027' : '\u002C',	// '
'\u0028' : '\u0029',
'\u002E' : '\u02D9',
'\u0031' : '\uA781',	// 1
'\u0032' : '\u2D52',	// 2
'\u0033' : '\u0190',
'\u0034' : '\u07C8',	// 4
'\u0036' : '\u0039',
'\u0037' : '\u2C62',
'\u003B' : '\u061B',
'\u003C' : '\u003E',
'\u003F' : '\u00BF',
'\u0041' : '\u2200',
'\u0042' : '\uA79A',	// B
'\u0043' : '\u2183',
'\u0044' : '\uA4F7',	// D 2ACF
'\u0045' : '\u018E',
'\u0046' : '\u2132',
'\u0047' : '\u2141',
'\u004A' : '\u017F',
'\u004B' : '\uA7B0',	// K
'\u004C' : '\u2142',
'\u004D' : '\u0057',
'\u004E' : '\u1D0E',
'\u0050' : '\u0500',
'\u0051' : '\uA779',	// Q
'\u0052' : '\u1D1A',
'\u0054' : '\uA7B1',	// T
'\u0055' : '\u2229',
'\u0056' : '\u1D27',
'\u0059' : '\u2144',
'\u005B' : '\u005D',
'\u005F' : '\u203E',
'\u0061' : '\u0250',
'\u0062' : '\u0071',
'\u0063' : '\u0254',
'\u0064' : '\u0070',
'\u0065' : '\u01DD',
'\u0066' : '\u2A0D',	// f
'\u0067' : '\u0183',
'\u0068' : '\u0265',
'\u0069' : '\u1D09',	// i
'\u006A' : '\u1E5B',	// j 1E5B
'\u006B' : '\u029E',
'\u006C' : '\uA781',	// l
'\u006D' : '\u026F',
'\u006E' : '\u0075',
'\u0072' : '\u0279',
'\u0074' : '\u0287',	// t
'\u0076' : '\u028C',
'\u0077' : '\u028D',
'\u0079' : '\u028E',
'\u007B' : '\u007D',
'\u203F' : '\u2040',
'\u2045' : '\u2046',
'\u2234' : '\u2235'
}

for (i in flipTable)
	flipTable[flipTable[i]] = i;

document.getElementById("do-flip").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	// break str into lines
	strs = str.split('\n');
	const numlines = strs.length;
	console.log(numlines);
	const strs2 = strs.map(function(line) {
		const last = line.length - 1;
		result = new Array(line.length);
		for (var i = last; i >= 0; --i) {
			var c = line.charAt(i);
			var r = flipTable[c];
			result[last - i] = r != undefined ? r : c;
			}
		return result.join('');
		});
	console.log(strs2);
	document.getElementById("white-box").value = strs2.reverse().join('\n');
}, false);

document.getElementById("do-resize").addEventListener("click", function() {
	$.ajax({
		method: "POST",
		// command: " wmctrl -r 'iCant' -e 0,-1,-1,620,450",
		url: "./shellCommand/wmctrl%20-r%20'iCant'%20-e%200%2C-1%2C-1%2C620%2C450",
		contentType: "application/json; charset=utf-8",
		processData: false,
		success: function(resp) {
			console.log("Success: shell command, wmctrl");
		}
	});
}, false);

document.getElementById("do-Google-IME").addEventListener("click", function() {
	$.ajax({
		method: "POST",
		// command: chromium --app=chrome-extension://mclkkofklkfljcocdinagocijmpgbhab/popup.html
		url: "./shellCommand/chromium%20--app%3Dchrome-extension%3A%2F%2Fmclkkofklkfljcocdinagocijmpgbhab%2Fpopup.html",
		contentType: "application/json; charset=utf-8",
		processData: false,
		success: function(resp) {
			console.log("Success: shell command: chromium --app=chrome-extension://...");
		}
	});
}, false);

document.getElementById("do-last-logs").addEventListener("click", function(evt) {
	$.ajax({
		method: "POST",
		// **** notify-send 冇用，因爲 SSE server 不可以用 display：
		// command: notify-send "$(ls -l | cut -d' ' -f5- | tail -n5)"
		// command: ls | xargs stat --printf "%n (%s) %y\n"
		// 而家問題係，SSE server 可以 send 啲資料去咩地方？ 可以係一個網頁。
		// command: ls logs -rtlGg|cut -d' ' -f3-|tail -n5"
		url: "./shellCommand/ls%20logs%20-rtlGg%7Ccut%20-d'%20'%20-f3-%7Ctail%20-n5",
		contentType: "application/json; charset=utf-8",
		processData: true,
		success: function(data) {
			// Add some lines to element "filelist"
			var flist = document.getElementById("filelist");
			flist.innerHTML = "<pre>" + data + "</pre>";
			console.log("Success: shell command: file list of /logs");
		}
	});
	// Eat the mouse click event so the dropdown window doesn't close:
	evt.stopPropagation();
}, false);

/*
document.getElementById("send-clipboard").addEventListener("click", function() {
	str = white_box.value;
	str = simplify(str);
	str = replaceYKY(str);
	white_box.value = str;

	white_box.focus();
	white_box.select();
	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	recordHistory(str);

	// clear input box
	white_box.value = "";

	var audio = new Audio("sending.ogg");
	audio.play();
}, false);
*/

// document.getElementById("flush-typings").addEventListener("click", flushTypings, false);

/* Genifer:  save input-output pair in ./training directory
document.getElementById("genifer-teach").addEventListener("click", function() {
	var in_str  = document.getElementById("red-box").value;
	var out_str = document.getElementById("pink-box").value;

	// send to server for saving
	console.log($.ajax({
		method: "POST",
		url: "/saveTrainingPair/",
		data: {input: in_str, output: out_str},
		success: function(resp) {}
	}));

}, false);
*/

/*
document.getElementById("send-green").addEventListener("click", function() {
	str = document.getElementById("green-box").textContent;
	str = simplify(str);
	str = replaceYKY(str);
	// str = str.replace(/[()]/g, "");  // remove ()'s

	send2Chat(str);
	// console.log("I'm sending something");
	var audio = new Audio("sending.ogg");
	audio.play();
}, false);

document.getElementById("send-up").addEventListener("click", function() {
	green_str = document.getElementById("green-box").textContent;
	// str = str.replace(/[()]/g, "");		// remove ()'s

	white_str = document.getElementById("white-box").value;
	document.getElementById("white-box").value = white_str + green_str;

	history_view_index = -1;		// No longer in history mode
}, false);

document.getElementById("send-down").addEventListener("click", function() {
	str = document.getElementById("white-box").value;
	words = str.split(" ");
	words.forEach(function(word, i, array) {
		// wrap () around all words
		// word = "(" + word + ")";
		// make words draggable
		// create node for all words
		textNode = document.createElement('span');
		textNode.id = 'word_' + word_index;
		++word_index;
		// allow dragging of words
		textNode.draggable = true;
		textNode.ondragstart = drag;
		textNode.appendChild(document.createTextNode(word));
		document.getElementById("green-box").appendChild(textNode);
	});
}, false);
*/

/*
document.getElementById("history-up").addEventListener("click", function() {
	if (history_view_index == -1)
		history_view_index = history_index - 1;
	else
		--history_view_index;
	document.getElementById("white-box").value = history[history_view_index];
}, false);

document.getElementById("history-down").addEventListener("click", function() {
	if (history_view_index != -1)				// -1 = no history to view
		{
		++history_view_index;
		if (history_view_index == history_index)	// reached end of history?
			{
			history_view_index = -1;
			document.getElementById("white-box").value = "";
			}
		else
			document.getElementById("white-box").value = history[history_view_index];
		}
}, false);
*/

/*
document.getElementById("clear-green1-L").addEventListener("click", function() {
	var node = document.getElementById("green-box");
	node.removeChild(node.firstChild);
}, false);

document.getElementById("clear-green1-R").addEventListener("click", function() {
	var node = document.getElementById("green-box");
	node.removeChild(node.lastChild);
}, false);

document.getElementById("clear-green").addEventListener("click", function() {
	var node = document.getElementById("green-box");
	while (node.hasChildNodes()) {
		node.removeChild(node.lastChild);
	}
}, false);

document.getElementById("clear-red").addEventListener("click", function() {
	var node = document.getElementById("red-box");
	while (node.hasChildNodes()) {
		node.removeChild(node.lastChild);
	}
}, false);
*/
