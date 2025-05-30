// Background script
// Read from Conceptual Keyboard tab and feed into input box of another tab.

// TO-DO:

// DONE:
// * background script should forget portLogin after login
// * sometimes attempts to read port-login and breaks

var theNickname = "Cybernetic1";
var whoIsActive = null;			// to be filled with a URL

var port_map = {};	// dictionary to look up port for each chatroom

// **** The "stream" listens to Conkey.js

function streamEventHandler(e) {
	// Specifically output to the ACTIVE chatroom only
	const port = port_map[whoIsActive];
	port.postMessage({sendtext: e.data});
	console.log("/background: " + e.data);
}

var evtSource = null;
function initEventSource() {
	// Listen to Node.js server
	evtSource = new EventSource("http://localhost:8484/background");
	evtSource.onmessage = streamEventHandler;
	evtSource.onerror = function(e) {
		if (evtSource.readyState == 2) {
			evtSource.close();
			setTimeout(initEventSource, 3000);
		}
	};
}

// **** Establish connection to script-2

function connected(p) {
	// title = p.sender.tab.title;
	const url = p.sender.url;
	console.log("CONNECTED to tab:", url, "with port:", p);

	// **** Record the port for this URL
	// if (p.name !== "PORT-popup") {		// avoid connecting to popup
		// because the port always closes after popup closes

		port_map[url] = p;
		whoIsActive = url;

		initEventSource();
	// }

	p.onMessage.addListener(backListener);

	// After login, delete all login ports:
	if (p.name == "PORT-script-2")
		for (var key in port_map)
			if (port_map[key].name == "PORT-login")
				delete port_map[key];
}

browser.runtime.onConnect.addListener(connected);

// Set up message listener
function backListener(request, sender) {
	// console.log(sender.tab ?	"from a content script:" + sender.tab.url :
	//	"from the extension");

	if (request.selectNickname != null) {
		theNickname = request.selectNickname;
		sessionStorage.setItem("YKY-nickname", theNickname);
		console.log("sessionStorage nick =", theNickname);
		}

	if (request.askNickname != null) {
		console.log("asked nickname =", theNickname);
		console.log("sender =", sender.name);
		for (var key in port_map) {
			// This may break because Popup.js is not the only script that asks
			if (port_map[key].name == sender.name)
				port_map[key].postMessage({thenick: theNickname});
			}
		// Delete port from list, because Popup always closes its port
		// If this is not done, error will stop other ports from working
		for (var key in port_map)
			if (port_map[key].name == "PORT-popup")
				delete port_map[key];
		}

	if (request.speak != null) {
		// jQuery is undefined -- this won't work
		console.log("jQuery =", window.jQuery);
		$.ajax({
			method: "POST",
			url: "http://localhost:8484/shellCommand/",
			contentType: "application/json; charset=utf-8",
			dataType: "text",	// This affects the data to be received
			processData: false,
			data: "ekho " + request.speak,
			success: function(resp) {
				console.log("Speak: " + request.speak);
				}
			});
		}

	// Request to change target chatroom
	// The request is sent from contentscript2:mouseover event
	// This script (background.js) decides which room to speak to.
	if (request.chatroom != null) {
		whoIsActive = request.chatroom;
		// console.log("switched to:", request.chatroom)

		var whichRoom = "?";
			 if (whoIsActive.indexOf("VIP5D") >= 0)
			whichRoom = "UT";
		else if (whoIsActive.indexOf("chatroom.hk") >= 0)
			whichRoom = "HK";
		else if (whoIsActive.indexOf("ip131") >= 0)
			whichRoom = "梦1";
		else if (whoIsActive.indexOf("ip4") >= 0)
			whichRoom = "梦4";
		else if (whoIsActive.indexOf("ip69") >= 0)
			whichRoom = "梦6";
		else if (whoIsActive.indexOf("ip203") >= 0)
			whichRoom = "梦3";
		// console.log("whichRoom =", whichRoom);

		fetch('http://localhost:8484/conkey/', {
			method: 'POST',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				// important: if this content-type is not set it won't work
				'Content-Type':'application/x-www-form-urlencoded'
				},
			body: whichRoom
			}); // .then(res => console.log(res));
		}

	// Request to play an alert sound (must be done thru background page)
	if (request.alert != null) {
		console.log("Play sound!!")
		if (request.alert.endsWith(".wav") ||
			request.alert.endsWith(".ogg"))
			var audio = new Audio(request.alert);
		else
			var audio = new Audio(request.alert + ".ogg");
		audio.play();
		}

	// save log:
	if (request.saveLog != null) {
		console.log("!log + filename command issued");

		browser.tabs.query({
			"active": true,
			"currentWindow": true
		}, function (tabs) {
			for (var key in port_map) {
				port_map[key].postMessage({sendtext: "!log " + request.saveLog});
				}
		});

		var audio = new Audio("log-saved.ogg");
		audio.play();
	}

	// clear history:
	if (request.clearHistory != null) {

		browser.tabs.query({
			"active": true,
			"currentWindow": true
		}, function (tabs) {
			for (var key in port_map) {
				port_map[key].postMessage({sendtext: "!clear"});
				}
		});

		var audio = new Audio("clear-history.ogg");
		audio.play();
	}

	// reset event stream:
	if (request.resetEventStream != null) {
		initEventSource();

		var audio = new Audio("reset-stream.ogg");
		audio.play();
	}

	// Request to copy to clipboard, this must be done via background page
	/* (No longer needed, handled in YKY-input-method.js, via document.execCommand('copy'))
	if (request.clipboard != null) {
		// copy to clipboard
		// bg = chrome.extension.getBackgroundPage();
		console.log("copying to clipboard: " + request.clipboard);
		clipboardholder = document.getElementById("clipboardholder");
		clipboardholder.value = request.clipboard;
		clipboardholder.select();
		document.execCommand("Copy");
		} */

// End of message-listener
}

console.log("Background Script.js (25-Dec-2022) RE/LOADED");

/*
querying = browser.tabs.query({url: "http://ip131.ek21.com/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	ip131Id = tab.id;
	}});

querying = browser.tabs.query({url: "http://chatroom.hk/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	roomHKId = tab.id;
	}});

querying = browser.tabs.query({url: "http://ip69.ek21.com/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	ip69Id = tab.id;
	}});

var querying = browser.tabs.query({url: "http://www.uvoov.com/voovchat/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	voovId = tab.id;
	}});

querying = browser.tabs.query({url: "http://chat.hklovechat.com/frames*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	voov2Id = tab.id;
	}});

querying = browser.tabs.query({url: "http://60.199.209.71/VIP*\/index.phtml"});
querying.then((tabs) => {
	for (var tab of tabs) {
	adultId = tab.id;
	}});

querying = browser.tabs.query({url: "http://60.199.209.72/VIP*\/index.phtml"});
querying.then((tabs) => {
	for (var tab of tabs) {
	adultId = tab.id;
	}});

querying = browser.tabs.query({url: "http://ip203.ek21.com/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	ip203Id = tab.id;
	}});

querying = browser.tabs.query({url: "http://ip4.ek21.com/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	ip4Id = tab.id;
	}});

querying = browser.tabs.query({url: "http://www.hk2love.com/cgi-bin/*"});
querying.then((tabs) => {
	for (var tab of tabs) {
	hk2loveId = tab.id;
	}});
*/


/* ************** these parts also seem unneeded *************
// *** save log
function onClickContext(info, tab) {
	// console.log("item " + info.menuItemId + " was clicked");
    // console.log("info: " + JSON.stringify(info));
    // console.log("tab: " + JSON.stringify(tab));

	var fname = prompt("Enter log file name", "no-name");

	//Add all you functional Logic here
    browser.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { sendtext: "!log " + fname });
    });
}

// *** clear history
function onClickContext2(info, tab) {
	console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));

	//var fname = prompt("Enter log file name", "no-name");

	//Add all you functional Logic here
    browser.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { sendtext: "!clear" });
    });
}


// *** set ip131 ID
function onClickContext3(info, tab) {
    browser.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
		ip131Id = tabs[0].id;
		console.log("Set ip131 ID = " + ip131Id);
        // browser.tabs.sendMessage(tabs[0].id, { sendtext: "!log " + fname });
    });
}

// *** set ip69 ID
function onClickContext4(info, tab) {
    browser.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
		ip69Id = tabs[0].id;
		console.log("Set ip69 ID = " + ip69Id);
        // browser.tabs.sendMessage(tabs[0].id, { sendtext: "!log " + fname });
    });
}

// *** restart event stream
function onClickContext5(info, tab) {

	evtSource = new EventSource("http://localhost:8484/stream");

	evtSource.onmessage = function(e) {
		// Directly output to chatroom
		if (hk2loveId)
			browser.tabs.sendMessage(hk2loveId, {sendtext: e.data});
		if (ip131Id)
			browser.tabs.sendMessage(ip131Id, {sendtext: e.data});
		// console.log("Event: " + e.data);
		};
}

// Create one test item for each context type.
var contexts = ["page", "image", "editable" //, "selection", "link", "video", "audio"
	];

for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];

    var title = "Save log";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "onclick": onClickContext
		});
    // console.log("'" + context + "' item:" + id);

    var title2 = "Clear history";
    var id2 = chrome.contextMenus.create({
        "title": title2,
        "contexts": [context],
        "onclick": onClickContext2
		});
	// console.log("'" + context + "' item:" + id);

    var title3 = "Set ip131 ID";
    var id = chrome.contextMenus.create({
        "title": title3,
        "contexts": [context],
        "onclick": onClickContext3
		});

    var title4 = "Set ip69 ID";
    var id = chrome.contextMenus.create({
        "title": title4,
        "contexts": [context],
        "onclick": onClickContext4
		});

    var title5 = "Restart event stream";
    var id = chrome.contextMenus.create({
        "title": title5,
        "contexts": [context],
        "onclick": onClickContext5
		});
	}
*/

// var console2 = document.getElementById("console-msgs");
// console2.value = "Background Script .js loaded";

// *******************************************************************
// *******************************************************************
// *******************************************************************
// Following is some old code, I don't even remember what they're for.
// *******************************************************************
// *******************************************************************
// *******************************************************************

/*
browser.tabs.query(title("YKY input form"), function(tabs) {
	ykyId = tabs[0].id;

	var readYKYInput = function(tabId, changedProps) {
			// We are waiting for the tab we opened to finish loading.
			// Check that the the tab's id matches the tab we opened,
			// and that the tab is done loading.
			if (tabId != ykyId || changedProps.status != "complete")
				return;

			// Passing the above test means this is the event we were waiting for.
			// There is nothing we need to do for future onUpdated events, so we
			// use removeListner to stop geting called when onUpdated events fire.
			// browser.tabs.onUpdated.removeListener(readYKYInput);

			// Try to read what YKY has decided to "enter"


			// Then, send message to ³ÉÈËÁÄÌìÊÒ's tab

			// Then, put text into ³ÉÈËÁÄÌìÊÒ's input box

			// Look through all views to find the window which will display
			// the screenshot.  The url of the tab which will display the
			// screenshot includes a query parameter with a unique id, which
			// ensures that exactly one view will have the matching URL.
			var views = chrome.extension.getViews();
			for (var i = 0; i < views.length; i++) {
			var view = views[i];
			if (view.location.href == viewTabUrl) {
				view.setScreenshotUrl(screenshotUrl);
				break;
			}
			}
		};
	browser.tabs.onUpdated.addListener(readYKYInput);
})
*/

/*
// The onClicked callback function.
function onClickHandler(info, tab) {
  if (info.menuItemId == "radio1") {
	console.log("background: voovChat selected");
	browser.tabs.sendMessage(adultId, {chatroom: "voovChat"});
	browser.tabs.sendMessage(voovId, {chatroom: "voovChat"});
  } else if (info.menuItemId == "radio2") {
	console.log("background: UT Adult Chat selected");
	browser.tabs.sendMessage(adultId, {chatroom: "adultChat"});
	browser.tabs.sendMessage(voovId, {chatroom: "adultChat"});
  } else if (info.menuItemId == "checkbox1" || info.menuItemId == "checkbox2") {
    console.log(JSON.stringify(info));
    console.log("checkbox item " + info.menuItemId +
                " was clicked, state is now: " + info.checked +
                " (previous state was " + info.wasChecked + ")");

  } else {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
  }
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {
  // Create one test item for each context type.
  var contexts = ["page","selection","link","editable","image","video",
                  "audio"];
  for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "Test '" + context + "' menu item";
    var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                         "id": "context" + context});
    console.log("'" + context + "' item:" + id);
  }

  // Create a parent item and two children.
  chrome.contextMenus.create({"title": "Test parent item", "id": "parent"});
  chrome.contextMenus.create(
      {"title": "Child 1", "parentId": "parent", "id": "child1"});
  chrome.contextMenus.create(
      {"title": "Child 2", "parentId": "parent", "id": "child2"});
  console.log("parent child1 child2");

  // Create some radio items.
  chrome.contextMenus.create({"title": "VoovChat", "type": "radio",
                              "id": "radio1"});
  chrome.contextMenus.create({"title": "UT Adult Chat", "type": "radio",
                              "id": "radio2"});
  console.log("radio1 radio2");

  // Create some checkbox items.
  chrome.contextMenus.create(
      {"title": "Checkbox1", "type": "checkbox", "id": "checkbox1"});
  chrome.contextMenus.create(
      {"title": "Checkbox2", "type": "checkbox", "id": "checkbox2"});
  console.log("checkbox1 checkbox2");

  // Intentionally create an invalid item, to show off error checking in the
  // create callback.
  console.log("About to try creating an invalid item - an error about " +
      "duplicate item child1 should show up");
  chrome.contextMenus.create({"title": "Oops", "id": "child1"}, function() {
    if (chrome.extension.lastError) {
      console.log("Got expected error: " + chrome.extension.lastError.message);
    }
  });
});
*/
