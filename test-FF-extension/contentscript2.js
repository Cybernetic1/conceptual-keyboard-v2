﻿// This script is loaded by the pages "Voov Chat" and "Adult Chat"
// The script has to be reloaded whenever the Chrome Extension is reloaded,
// Seems that only content scripts from the *same* Extension can message
// each other.

// To-do:
// * spoken, waiting, spoken2 recorded, and then speak again, so spoken2=false, within 10 secs,
//	 which triggers failure.
// * 来客发声

// Done:
// * record whom I am speaking to
// * recover from send-fail

// Which chatroom output is selected by user?
// The selection is done on the Conceptual Keyboard page with radio buttons
var voov2Chat = false;
var voovChat = false;
var adultChat = false;
var ip131Chat = true;		// 寻梦园 情色聊天室
var roomHKChat = false;		// chatroom.HK
var ip203Chat = false;
var ip4Chat = false;
var ip69Chat = false;		// 长直发
var hk2loveChat = false;

// Which chatroom has I just sent message?  To keep track of send failure
var roomHKSpoken = false;
var roomHKSpoken2 = false;
var roomHKSentText = "";
var ip131Spoken = false;
var ip131Spoken2 = false;
var ip131SentText = "";

var logName = "log.txt";					// Name of the log file, to be filled

var chat_history = new Array();				// log of chat messages

// Write chat history to localhost server via AJAX
function saveLog(name) {
	// get the data-time and make it into filename
	var datetime = new Date();
	var timeStamp = datetime.toLocaleDateString().replace(/\//g, "-")
			+ "(" +   datetime.getHours() + ":" + datetime.getMinutes() + ")";
	// the string following by "!log " is the Nickname
	logName = name.replace(/ /g, "_") + "." + timeStamp + ".txt";
	// console.log("log file name = " + logName);

	var str = chat_history.join('');

	$.ajax({
		method: "POST",
		url: "http://localhost:8484/saveChatLog/" + logName,
		contentType: "application/json; charset=utf-8",
		// dataType: "text",	// This affects the data to be received
		processData: false,
		data: str,
		success: function(resp) {
			console.log("Successfully saved: " + logName);
		}
	});
}

// ******** Detect mouse-over on ChatRoom page
// Not only set the flags, but we need to broadcast to ALL other content scripts
// These messages are processed by background.js, which then broadcast to all content scripts
// If we use "sendResponse()" then only the sending script gets the response, which is not enough
document.addEventListener("mouseover", function(){
	/*
	if (document.URL.indexOf("hklovechat") >= 0) {
		// console.log("switch to hk love chat (new voov)");
		browser.runtime.sendMessage({chatroom: "voov2"});
		ip131Chat = false; ip203Chat = false; hk2loveChat = false; ip4Chat = false;
		voov2Chat = true;
	}
	*/
	if (document.URL.indexOf("ip131") >= 0) {		// 寻梦园 情色聊天室
		// console.log("switch to ip131");
		browser.runtime.sendMessage({chatroom: "ip131"});
		ip131Chat = true; ip203Chat = false; hk2loveChat = false; ip4Chat = false;
		roomHKChat = false; ip69Chat = false;
	}
	if (document.URL.indexOf("chatroom.hk") >= 0) {		// chatroom.hk
		console.log("switch to chatroom.HK!!");
		browser.runtime.sendMessage({chatroom: "roomHK"});
		ip131Chat = false; ip203Chat = false; hk2loveChat = false; ip4Chat = true;
		roomHKChat = false; ip69Chat = true;
	}
	if (document.URL.indexOf("ip69") >= 0) {		// 寻梦园 长直发
		// console.log("switch to ip4");
		browser.runtime.sendMessage({chatroom: "ip4"});
		ip131Chat = false; ip203Chat = false; hk2loveChat = false; ip4Chat = true;
		roomHKChat = false; ip69Chat = true;
	}
	/*
	if (document.URL.indexOf("hk2love") >= 0) {
		// console.log("switch to hk2love (prude chat)");
		browser.runtime.sendMessage({chatroom: "hk2love"});
		ip131Chat = false; ip203Chat = false; hk2loveChat = true; ip4Chat = false;
		voov2Chat = false; ip69Chat = false;
	}
	if (document.URL.indexOf("ip203") >= 0) {
		// console.log("switch to ip203");
		browser.runtime.sendMessage({chatroom: "ip203"});
		ip131Chat = false; ip203Chat = true; hk2loveChat = false; ip4Chat = false;
		voov2Chat = false;
	}
	if (document.URL.indexOf("ip4") >= 0) {
		// console.log("switch to ip4");
		browser.runtime.sendMessage({chatroom: "ip4"});
		ip131Chat = false; ip203Chat = false; hk2loveChat = false; ip4Chat = true;
		voov2Chat = false;
	}
	*/
});

function his() {
	console.log("Chat history:");
	for (i = 0; i < chat_history.length; ++i)
		console.log(chat_history[i]);
}

var returnVal = browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log("processing message...");
	console.log(sender.tab ?	"from a content script:" + sender.tab.url :	"from the extension");

	// Mouseover event has occurred, update which chatroom is selected:
	// This messages are sent from different instances of *this script* itself, relayed and broadcast by background.js
	if (request.chatroom2 != null) {
		/*
		if      (request.chatroom == "voov")
			{ voovChat = true; adultChat = false; ip131Chat = false; ip203Chat = false; hk2loveChat = false}
		else if (request.chatroom == "adult")
			{ voovChat = false; adultChat = true; ip131Chat = false; ip203Chat = false; hk2loveChat = false}
		*/
		if (request.chatroom2 == "ip131")
			{ ip131Chat = true; ip203Chat = false; roomHKChat = false; ip4Chat = false;
				voov2Chat = false; ip69Chat = false; }
		else if (request.chatroom2 == "roomHK")
			{ ip131Chat = false; ip203Chat = false; roomHKChat = true; ip4Chat = false;
				voov2Chat = false; ip69Chat = false; }
		else if (request.chatroom2 == "ip69")
			{ ip131Chat = false; ip203Chat = false; roomHKChat = false; ip4Chat = false;
				voov2Chat = false; ip69Chat = true; }
		/*
		else if (request.chatroom2 == "ip203")
			{ ip131Chat = false; ip203Chat = true; hk2loveChat = false; ip4Chat = false;
				voov2Chat = false;}
		else if (request.chatroom2 == "ip4")
			{ ip131Chat = false; ip203Chat = false; hk2loveChat = false; ip4Chat = true;
				voov2Chat = false;}
		else if (request.chatroom2 == "voov2")
			{ ip131Chat = false; ip203Chat = false; hk2loveChat = false; ip4Chat = false;
				voov2Chat = true;}
		*/
		// else if (request.chatroom == "skype")
		//	{ voovChat = false; adultChat = false; }

		// console.log("Script2: switched to: " + request.chatroom2);
		return true;
		}

	// Some text has been typed by the user on Conceptual Keyboard:
	// Now we feed that text into the INPUT box of target web page.
	// There are several possible chat rooms:  "Adult", "Voov", "ip131", "ip203", etc
	if (request.sendtext != null) {
		str = request.sendtext;
		// console.log("Script2: got message...");
		// sendResponse({farewell: "2: got msg..."});

		// check for save-log command:
		if (str.indexOf("!log") > -1) {
			// Determine this script instance is for the current active page...
			// If not, no action should be taken
			if ((roomHKChat && document.URL.indexOf("chatroom.hk") >= 0) ||
				(ip131Chat && document.URL.indexOf("ip131") >= 0) ||
				(ip203Chat && document.URL.indexOf("ip203") >= 0) ||
				(ip4Chat && document.URL.indexOf("ip4") >= 0) ||
				(ip69Chat && document.URL.indexOf("ip69") >= 0) ||
				(hk2loveChat && document.URL.indexOf("hk2love") >= 0)) {

				// the string following by "!log " is the Nickname, hence 5 chars
				// console.log("log person = " + str.slice(5));
				// save log array to file
				// window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, errorHandler);
				saveLog(str.slice(5));
				return true;
			}
		}

		if (str.indexOf("!clear") > -1) {
			chat_history = new Array();
			console.log("history cleared");
			return true;
		}

		if (str.indexOf("!his") > -1) {
			console.log("history:");
			his();
			return true;
		}

		if (str.indexOf("!test") > -1) {
			console.log("Testing sound...");
			browser.runtime.sendMessage({alert: "sendFail"});
			return true;
		}

		/* if (str.indexOf("!uninstall") > -1) {
			// Perhaps unload own script?
			var uninstalling = browser.management.uninstallSelf({
				showConfirmDialog: true,
				dialogMessage: "self-uninstall"
				});
			uninstalling.then(null, function(err) {
				console.log("Uninstall failed\n");
			});
			return true;
		}
		*/

		/*
		if (voov2Chat && document.URL.indexOf("hklovechat") >= 0) {
			//**************** HK Love Chat (new Voov) ***************
			var inputBox = document.getElementsByName("message")[0].contentDocument;
			var inputBox2 = inputBox.getElementById("txtMessage");
			if (last_str == str)		// does not allow to send duplicate messages
				str = " " + str;
			inputBox2.value = str;
			last_str = str;
			var sendButton = inputBox.getElementById("Button1");
			sendButton.click();

			//chat_history[chat_history.length] = str + "\n";
			}
		*/

		/*
		if (adultChat && document.URL.indexOf("VIP") >= 0) {
			// *********** UT Adult Chatroom ***************
			var inputBox = document.getElementsByName("c")[0].contentWindow.document.getElementsByName("SAYS")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("c")[0].contentWindow.document.getElementsByClassName("Off2")[0];
			sendButton.click();

			// For Adult chat, need to record own messages
			// because own messages appear as broken pieces on their page
			chat_history[chat_history.length] = str + "\n";
			}
		*/

		// This one is the new Dream Chat: 寻梦园 情色聊天室
		if (ip131Chat && document.URL.indexOf("ip131") >= 0) {
			// *********** Find Dream Garden Chatroom ***************
			if (ip131SentText == str)		// DreamLand does not allow to send duplicate messages
				str = "..." + str;
			ip131SentText = str;

			// This function is fucking annoying
			//if (!ip131Spoken)		// during rapid speaking, disable this function
				//{
				//ip131Spoken = true;
				//ip131Spoken2 = false;
				
				//// wait for 10 seconds then check if really spoken:
				//setTimeout(checkSpoken, 15000, ip131SentText);
				//}

			var inputBox = document.getElementsByName("ta")[0].contentWindow.document.getElementsByName("says_temp")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("ta")[0].contentWindow.document.querySelectorAll("input[value='送出']")[0];
			// This doesn't seem to work:
			// var sendButton = document.querySelector("body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > form:nth-child(6) > p:nth-child(9) > input:nth-child(5)");
			sendButton.click();

			// For Adult chat, need to record own messages
			// because own messages appear as broken pieces on their page
			chat_history[chat_history.length] = str + "\n";
			}

		/* This one is for: 寻梦园 长直发
		if (ip69Chat && document.URL.indexOf("ip69") >= 0) {
			// *********** Find Dream Garden Chatroom ***************
			if (last_str == str)		// DreamLand does not allow to send duplicate messages
				str = " " + str;

			var inputBox = document.getElementsByName("ta")[0].contentWindow.document.getElementsByName("says_temp")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			last_str = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("ta")[0].contentWindow.document.querySelectorAll("input[value='送出']")[0];
			sendButton.click();

			// For Adult chat, need to record own messages
			// because own messages appear as broken pieces on their page
			chat_history[chat_history.length] = "me: " + str + "\n";
			}
		*/

		// **** for chatroom.HK
		if (roomHKChat && document.URL.indexOf("chatroom.hk") >= 0) {
			// var str2 = str.replace("'", "`");    // already done in YKY-input-method.js
			roomHKSentText = str;

			// This function is fucking annoying
			//if (false && !roomHKSpoken)		// during rapid speaking, disable this function
				//{
				//roomHKSpoken = true;
				//roomHKSpoken2 = false;
				//// wait for 10 seconds then check if really spoken:
				//setTimeout(checkSpoken, 15000, roomHKSentText);
				//}

			// var inputBox = document.getElementsByName("c")[0].contentWindow.document.getElementsByName("says_temp")[0];
			// console.log("DOM element: " + inputBox);
			var inputBox = document.getElementsByTagName("frame")[2].contentWindow.document.getElementsByName("message")[0];
			inputBox.value = str + inputBox.value;
			// and then perhaps click "enter"?
			// var sendButton = document.getElementsByName("c")[0].contentWindow.document.querySelectorAll("input[value='送出']")[0];
			var sendButton = document.getElementsByTagName("frame")[2].contentWindow.document.getElementsByName("submit")[0];
			sendButton.click();

			// record own messages
			// console.log("attempted speech: " + str2);
			chat_history[chat_history.length] = "me: " + str + "\n";
			}

		/* For HK2Love chatroom (prude chat):
		if (hk2loveChat && document.URL.indexOf("hk2love") >= 0) {
			if (last_str == str)		// does not allow to send duplicate messages
				str = " " + str;

			var inputBox = document.getElementsByName("c")[0].contentWindow.document.getElementsByName("says_temp")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			last_str = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("c")[0].contentWindow.document.querySelectorAll("input[value='送出']")[0];
			sendButton.click();

			// record own messages
			chat_history[chat_history.length] = str + "\n";
			}
		*/

		/* This one is the new Dream Chat:
		if (ip203Chat && document.URL.indexOf("ip203") >= 0) {
			// *********** Find Dream Garden Chatroom ***************
			if (last_str == str)		// DreamLand does not allow to send duplicate messages
				str = " " + str;

			var inputBox = document.getElementsByName("ta")[0].contentWindow.document.getElementsByName("says_temp")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			last_str = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("ta")[0].contentWindow.document.querySelectorAll("input[value='送出']")[0];
			sendButton.click();

			// For Adult chat, need to record own messages
			// because own messages appear as broken pieces on their page
			chat_history[chat_history.length] = str + "\n";
			}

		// This one is the new Dream Chat:
		if (ip4Chat && document.URL.indexOf("ip4") >= 0) {
			// *********** Find Dream Garden Chatroom ***************
			if (last_str == str)		// DreamLand does not allow to send duplicate messages
				str = " " + str;

			var inputBox = document.getElementsByName("ta")[0].contentWindow.document.getElementsByName("says_temp")[0];
			// console.log("DOM element: " + inputBox);
			inputBox.value = str;
			last_str = str;
			// and then perhaps click "enter"?
			var sendButton = document.getElementsByName("ta")[0].contentWindow.document.querySelectorAll("input[value='送出']")[0];
			sendButton.click();

			// For Adult chat, need to record own messages
			// because own messages appear as broken pieces on their page
			chat_history[chat_history.length] = str + "\n";
			}
		*/

		}
	return true;
	});

console.log("Return value =  ", returnVal);

// Indexes of bottom-most lines in the chat frames:
var lastVoovLine = 1;
var lastVoovLine2 = "";
var lastAdultIndex = 1;
var lastIp131Index = 1;
var lastIp203Index = 1;
var lastHk2loveIndex = 1;
var lastHk2loveLine = "";
var lastRoomHKIndex = 1;
var lastRoomHKLine = "";
var lastIp4Index = 1;
var lastIp69Index = 1;

// After spoken, wait for 10 secs to check if really spoken, if not, re-send
// New method checks for existence of spoken text in last 5 lines of log
function checkSpoken(sentText)
	{
	if (roomHKSpoken)
		{
		if (!roomHKSpoken2)
		// failure detected
			{
			browser.runtime.sendMessage({alert: "sendFail"});
			// re-send message (this is too annoying)
			// browser.runtime.sendMessage({sendtext: sentText});
			}
		roomHKSpoken = false;
		roomHKSpoken2 = false;
		}

	if (ip131Spoken)
		{
		if (!ip131Spoken2)
		// failure detected
			{
			browser.runtime.sendMessage({alert: "sendFail"});
			// re-send message (this is too annoying)
			// browser.runtime.sendMessage({sendtext: sentText});
			}
		ip131Spoken = false;
		ip131Spoken2 = false;
		}
}

// Check activity every 3 seconds
// If there's activity, message Background Script to play a sound
setInterval( function() {
	timeStamp = Date().slice(16,24);

	/*
	if (document.URL.indexOf("voovchat\/") >= 0) {
		chatWin = document.getElementById("chatContainer2");
		if (chatWin == null)
			chatWin = document.getElementById("chatContainer");
		// line number of last line in chat window
		lineNum = chatWin.children.length;
		// console.log("we are checking voovChat");
		if (lineNum > lastVoovLine) {
			// check if line contains message to Cybernetic1
			// » Cybernetic1 秘密的說
			lastIndex = chatWin.children.length - 1;
			numberToTest = lineNum - lastVoovLine;
			// Check the last N lines
			var alert = false;
			for (i = lastIndex; i > lastIndex - numberToTest; i--) {
				if (i >= 0) {
					stuff = chatWin.children[i].innerText.toLowerCase();
					if (stuff.indexOf("» cybernetic1") > -1 ||
						stuff.indexOf("» 半機械人一號") > -1) {
						// Cannot sound alert on this web page because browser will not enable sounds
						//    when the page is off-focus.  So we have to message background script.
						alert = true;
						stuff2 = stuff.replace("cybernetic1", "");
						stuff = stuff2.replace("半機械人一號", "");
						stuff2 = stuff.replace("秘密的說", "");
						chat_history[chat_history.length] = stuff2 + "\n";
						// console.log(timeStamp + stuff2);
					}
					else if (stuff.indexOf("cybernetic1") > -1) {
						stuff2 = stuff.replace("cybernetic1", "*ME*");
						stuff = stuff2.replace("半機械人一號", "*ME*");
						stuff2 = stuff.replace("秘密的說", "");
						chat_history[chat_history.length] = stuff2 + "\n";
						// console.log(timeStamp + stuff2);
					}
				}
			}
			if (alert == true)
				browser.runtime.sendMessage({alert: "voov"});
		}
		lastVoovLine = lineNum;
	}
	*/

	/*
	if (document.URL.indexOf("hklovechat.com\/") >= 0) {
		chatWin = document.getElementsByName("messages")[0].contentDocument.childNodes[1];
		chatWin2 = chatWin.childNodes[2].childNodes[1].getElementsByClassName("divMessages").divMessages;
		// line number of last line in chat window
		lineNum = chatWin2.childElementCount;
		// need to scan all lines from bottom until last line
		lastIndex = lineNum - 1;
		var alert = false;
		for (i = lastIndex; i > 0; i--) {
			stuff = chatWin2.childNodes[i].innerText.toLowerCase();
			if (stuff == lastVoovLine2)
				break;
			if (stuff.indexOf("對住 cybernetic1") > -1 ||
				stuff.indexOf("對住 metazoan") > -1) {
				// Cannot sound alert on this web page because browser will not enable sounds
				//    when the page is off-focus.  So we have to message background script.
				alert = true;
				stuff2 = stuff.replace("對住 cybernetic1", "");
				stuff3 = stuff2.replace("對住 metazoan", "");
				stuff2 = stuff3.replace("秘密地說", "");
				chat_history[chat_history.length] = stuff2 + "\n";
				// console.log(timeStamp + stuff2);
			}
			else if (stuff.indexOf("cybernetic1") > -1) {
				stuff2 = stuff.replace("cybernetic1", "*ME*");
				stuff3 = stuff2.replace("metazoan", "*ME*");
				stuff2 = stuff3.replace("秘密地說", "");
				chat_history[chat_history.length] = stuff2 + "\n";
				// console.log(timeStamp + stuff2);
			}
		}
		if (alert == true)
			browser.runtime.sendMessage({alert: "voov2"});
		// Find the last line that's non-empty
		lastVoovLine2 = "top line";
		for (i = lastIndex; i > 0; i--) {
			stuff = chatWin2.childNodes[i].innerText.toLowerCase();
			if (stuff != "") {
				lastVoovLine2 = stuff;
				break;
			}
		}
	}

	// ******** HK 2 Love **************
	if (document.URL.indexOf("hk2love.com\/cgi-bin") >= 0) {
		// this gives us an HTML element of the public chat area:
		html = document.getElementsByName("a2")[0].contentDocument;
		// this is the element containing the rows:
		chatWin1 = html.childNodes[0].childNodes[1];
		// get down to the last page of messages:
		chatWin = chatWin1.childNodes[chatWin1.childElementCount];
		if (chatWin !== undefined) {
			// number of lines in chat win:
			lastIndex = chatWin.childElementCount - 1;
			if ((chatWin != null) && (lastIndex > lastHk2loveIndex)) {
				var alert = false;
				for (i = lastIndex; i > 0; i--) {
					stuff = chatWin.children[i].innerText;
					if (stuff == lastHk2loveLine)
						break;
					if (// stuff.indexOf("只對『PT141』") > -1 ||
						stuff.indexOf("只對『dearCharlotte』") > -1 ||
						stuff.indexOf(">>『dearCharlotte』") > -1)
						// stuff.indexOf(">>『PT141』") > -1)
						{
						// sound alert
						alert = true;
						chat_history[chat_history.length] = stuff + "\n";
						// console.log(timeStamp + stuff);
					}
				}
				if (alert == true)
					browser.runtime.sendMessage({alert: "hk2love"});
			}
			lastHk2loveIndex = lastIndex;
			// Find the last line that's non-empty
			lastHk2loveLine = "top line";
			for (i = lastIndex; i > 0; i--) {
				stuff = chatWin.children[i].innerText;
				if (stuff != "") {
					lastHk2loveLine = stuff;
					break;
				}
			}
		}
	}
	*/

	// ************ chatroom.HK **************
	if (document.URL.indexOf("chatroom.hk\/chatroom.php") >= 0) {
		// this gives us an HTML element of the public chat area:
		html = document.getElementsByName("main_frame")[0].contentWindow.document;
		// this is the element containing the rows:
		chatWin = html.getElementsByClassName("messages")[0];
		if (chatWin !== undefined) {
			// number of lines in chat win:
			lastIndex = chatWin.childElementCount - 1;
			if ((chatWin != null) && (lastIndex > lastRoomHKIndex)) {
				var alert = false;
				for (i = lastIndex; i > 0; i--) {
					stuff = chatWin.children[i].innerText;
					// console.log("Line: " + stuff);
					if (stuff == lastRoomHKLine)			// nothing new...
						break;
					if (stuff.indexOf("向 你 秘密的說 :") > -1 ||
						stuff.indexOf("向 你 說 :") > -1)
						{
						// sound alert
						alert = true;
						chat_history[chat_history.length] = stuff + "\n";
						console.log("alert: ", timeStamp + stuff);
						}
					else if (stuff.indexOf("你 向") > -1)
						{
						// no need to sound alert if self-speak
						roomHKSpoken2 = true;
						chat_history[chat_history.length] = stuff + "\n";
						}
				}
				if (alert == true)
					browser.runtime.sendMessage({alert: "roomHK"});
			}
			lastRoomHKIndex = lastIndex;
			// console.log("last index ", lastIndex);
			// Find the last line that's non-empty
			lastRoomHKLine = "top line";
			for (i = lastIndex; i > 0; i--) {
				stuff = chatWin.children[i].innerText;
				// 大頭仔 stuff is spamming the chatroom recently
				if (stuff != "" && !stuff.includes("大頭仔")) {
					lastRoomHKLine = stuff;
					// console.log("last line ", stuff);
					break;
				}
			}
		}
	}

	// ******** 寻梦园 情色聊天室 **************
	if (document.URL.indexOf("ip131") >= 0) {
		// console.log("logging 寻梦园 情色聊天室...");
		// this gives us an HTML element of the public chat area:
		html = document.getElementById("marow").childNodes[3].childNodes[3].contentDocument.childNodes[0];
		// this is the <div> element containing the rows:
		chatWin = html.children[1].children[7];		// sometimes it's [1][7], or [3][7]
		// console.log("chatWin", chatWin);
		// number of lines in chat win:
		lastIndex = chatWin.childElementCount - 1;
		if ((chatWin != null) && (lastIndex > lastIp131Index)) {
			var alert = false;
			for (i = lastIndex; i > lastIp131Index; i--) {
				stuff = chatWin.children[i].innerText;
				if (stuff.indexOf("對 訪客_Cybernetic1") > -1 ||
					stuff.indexOf("對 訪客_Cybernetic2") > -1 ||
					stuff.indexOf("對 訪客_Cybernetic3") > -1) {
					// sound alert
					alert = true;
					chat_history[chat_history.length] = timeStamp + " > " + stuff + "\n";
					// console.log(timeStamp + stuff);
					}
				else if (stuff.indexOf("訪客_Cybernetic1 只對") > -1 ||
					stuff.indexOf("訪客_Cybernetic2 只對") > -1 ||
					stuff.indexOf("訪客_Cybernetic3 只對") > -1) {
					// no need to sound alert if self-speak
					ip131Spoken2 = true;
					chat_history[chat_history.length] = timeStamp + " > " + stuff + "\n";
					}
				// To-do:  On Adult page, own messages appear as broken pieces (fixed now?)
			}
			if (alert == true)
				browser.runtime.sendMessage({alert: "ip131"});
		}
		lastIp131Index = lastIndex;
	}

	// ******** 寻梦园 长直发 **************
	if (document.URL.indexOf("ip69") >= 0) {
		// this gives us an HTML element of the public chat area:
		html = document.getElementById("marow").childNodes[3].childNodes[3].contentDocument.childNodes[0];
		// this is the <div> element containing the rows:
		chatWin = html.children[1].children[6];
		// number of lines in chat win:
		lastIndex = chatWin.childElementCount - 1;
		if ((chatWin != null) && (lastIndex > lastIp69Index)) {
			var alert = false;
			for (i = lastIndex; i > lastIp69Index; i--) {
				stuff = chatWin.children[i].innerText;
				if (stuff.indexOf("對 訪客_Cybernetic2") > -1 ||
					stuff.indexOf("對 訪客_Cybernetic1") > -1) {
					// sound alert
					alert = true;
					chat_history[chat_history.length] = timeStamp + ' ' + stuff + "\n";
					// console.log(timeStamp + stuff);
				}
				// To-do:  On Adult page, own messages appear as broken pieces
			}
			if (alert == true)
				browser.runtime.sendMessage({alert: "ip69"});
		}
		lastIp69Index = lastIndex;
	}

	/*
	if (document.URL.indexOf("VIP") >= 0) {
		// this gives us an HTML element:
		html = document.getElementsByName("m")[0].contentDocument.childNodes[0];
		// this is the <p> element containing the rows:
		chatWin = html.children[1].children[1];
		// number of lines in chat win:
		lastIndex = chatWin.childElementCount - 1;
		if ((chatWin != null) && (lastIndex > lastAdultIndex)) {
			var alert = false;
			for (i = lastIndex; i > lastAdultIndex; i--) {
				if (chatWin.children[i].innerText.indexOf("[半機械人一號]") > -1) {
					// sound alert
					alert = true;
					stuff = chatWin.children[i].innerText;
					chat_history[chat_history.length] = stuff + "\n";
					// console.log(timeStamp + stuff);
				}
				// To-do:  On Adult page, own messages appear as broken pieces
			}
			if (alert == true)
				browser.runtime.sendMessage({alert: "adult"});
		}
		lastAdultIndex = lastIndex;
	}
	*/

	/*
	if (document.URL.indexOf("ip203") >= 0) {
		// this gives us an HTML element of the public chat area:
		html = document.getElementById("marow").childNodes[3].childNodes[3].contentDocument.childNodes[0];
		// this is the <div> element containing the rows:
		chatWin = html.children[1].children[6];
		// number of lines in chat win:
		lastIndex = chatWin.childElementCount - 1;
		if ((chatWin != null) && (lastIndex > lastIp203Index)) {
			var alert = false;
			for (i = lastIndex; i > lastIp203Index; i--) {
				stuff = chatWin.children[i].innerText;
				if (stuff.indexOf("只對 訪客_半機械人一號") > -1 ||
					stuff.indexOf("只對 訪客_Cybernetic1") > -1) {
					// sound alert
					alert = true;
					chat_history[chat_history.length] = stuff + "\n";
					// console.log(timeStamp + stuff);
				}
				// To-do:  On Adult page, own messages appear as broken pieces
			}
			if (alert == true)
				browser.runtime.sendMessage({alert: "ip203"});
		}
		lastIp203Index = lastIndex;
	}

	if (document.URL.indexOf("ip4") >= 0) {
		// this gives us an HTML element of the public chat area:
		html = document.getElementById("marow").childNodes[3].childNodes[3].contentDocument.childNodes[0];
		// this is the <div> element containing the rows:
		chatWin = html.children[1].children[6];
		// number of lines in chat win:
		lastIndex = chatWin.childElementCount - 1;
		if ((chatWin != null) && (lastIndex > lastIp4Index)) {
			var alert = false;
			for (i = lastIndex; i > lastIp4Index; i--) {
				stuff = chatWin.children[i].innerText;
				if (stuff.indexOf("只對 訪客_半機械人一號") > -1 ||
					stuff.indexOf("只對 訪客_Cybernetic1") > -1) {
					// sound alert
					alert = true;
					chat_history[chat_history.length] = stuff + "\n";
					// console.log(timeStamp + stuff);
				}
				// To-do:  On Adult page, own messages appear as broken pieces
			}
			if (alert == true)
				browser.runtime.sendMessage({alert: "ip4"});
		}
		lastIp4Index = lastIndex;
	}
	*/
},
3000);

// ******** Execute only once, at start of page-load **********
setTimeout(function() {
	// ****** chatroom.HK:  click 'private chat' and 'auto scroll' automatically
	if (document.URL.indexOf("chatroom.hk\/chatroom.php") >= 0) {
		var secretBox = document.getElementsByTagName("frame")[2].contentWindow.document.getElementsByName("secret")[0];
		secretBox.checked = true;
		var autoscrollBox = document.getElementsByTagName("frame")[2].contentWindow.document.getElementsByName("autoscroll")[0];
		autoscrollBox.checked = true;
	}

	/* ******* 寻梦园:  set 女生优先, it seems working now */
	if (document.URL.indexOf("ip131") >= 0) {
		// Sort method = 女生优先
		var e1 = document.getElementsByTagName("frameset")[4].getElementsByTagName("frame")[1].contentDocument.getElementsByTagName("select")[0];

		e1.value = "gender1";
		e1.onchange();		// force it to change

		// Select background color
		var e2 = document.getElementsByTagName("frameset")[1].getElementsByTagName("frame")["ta"].contentDocument.getElementsByTagName("select")[4];

		e2.value="ffffff";
		e2.onchange();
	}
},
2000);

// This seems to be run only once, as each "Chatroom" page is loaded.
console.log("Content script #2 (Sept 2018) loaded....");

/* *******************************************************************************

// Older function (deprecated)
function saveLog2(name) {
	// get the data-time and make it into filename
	var datetime = new Date();
	var timeStamp = datetime.toLocaleDateString().replace(/\//g, "-")
			+ "(" +   datetime.getHours() + "-" + datetime.getMinutes() + ")";
	// the string following by "!log " is the Nickname
	logName = name + "." + timeStamp + ".txt";
	console.log("trying to log file: " + logName);
	// save log array to file
	window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, errorHandler);
	}

// **** For writing to fileSystem (Chrome extension's temporary file system)
// This is replaced with server-side saving
// Just keep for old sake
function onInitFs(fs) {
   fs.root.getFile(logName, {create: true}, function(fileEntry) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {

      fileWriter.onwriteend = function(e) {
        console.log('Log saved.');
      };

      fileWriter.onerror = function(e) {
        console.log('Save log failed: ' + e.toString());
      };

      // Create a new Blob and write it to log.txt.
      var blob = new Blob(chat_history, { type: 'text/plain' });
      fileWriter.write(blob);

      chat_history = new Array();		// Clear history

    }, errorHandler);

  }, errorHandler);

}

function errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: ' + msg);
}

*/

// *******************************************************************
// Following is some old code that tried to determine which was the
// last chatroom tab that was open.  For some unknown reason it didn't work.

/*

if (window.document.URL.indexOf("VIP") >= 0) {
	var frame = window.frames["c"];

	frame.addEventListener("mousedown", function() {
		console.log("I am here, and my URL is: " + window.document.URL);

		if (window.document.URL.indexOf("VIP") >= 0) {
			voovChat = false; adultChat = true;
			console.log("adult sensed");
			chrome.runtime.sendMessage({chatroom: "adultChat"});
			};
		});
}
*/

/*
window.addEventListener("focus", function() {
	console.log("I am here, and my URL is: " + window.document.URL);

	if (window.document.URL.indexOf("voov") >= 0) {
		voovChat = true; voovStill = false; adultChat = false;
		console.log("voov sensed");
		chrome.runtime.sendMessage({chatroom: "voovChat"});
		};
});

window.addEventListener('blur', function() {
	if (document.URL.indexOf("voov") >= 0) {
		voovChat = false; voovStll = true; adultChat = false;
		console.log("voov de-activated");
		chrome.runtime.sendMessage({chatroom: "voovStill"});
		};

});

var voovStill = false;
*/
