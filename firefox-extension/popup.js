// NOTE:  Every time pop-up is opened, this script is re-initialized

// TO-DO:
// * display history in some window that does not require opening console

// **** These commands are processed in background.js ****
// NOTE:  This port is disconnected as soon as the popup window is closed!
let portPopup = browser.runtime.connect({name: "PORT-popup"});

portPopup.onMessage.addListener(function (request) {
	if (request.thenick != null)
		{
		const name = request.thenick;
		console.log("Reported nickname = ", name);
		if (name != null) {
			nickname = name;
			// Common nicknames have a sound file:
			portPopup.postMessage({alert: name});
			window.close();
			}
		}
});

// test sound
function onClickButt1() {
	portPopup.postMessage({alert: "boing"});
	// browser.runtime.sendMessage({alert: "boing"});
	window.close();
	}

// save log
function onClickButt2() {
	var fname = document.getElementById("logName").value;
	portPopup.postMessage({saveLog: fname});
	// browser.runtime.sendMessage({saveLog: fname});
	setTimeout(function() {
		window.close();
		}, 1500);
	}

// clear history
function onClickButt3() {
	portPopup.postMessage({clearHistory: "?"});
	// browser.runtime.sendMessage({clearHistory: "?"});
	setTimeout(function() {
		window.close();
		}, 1500);
	}

// Show history
function onClickButt4() {
	console.log("Show history");
	portPopup.postMessage({showHistory: "?"});
	// browser.runtime.sendMessage({resetEventStream: "?"});
	setTimeout(function() {
		window.close();
		}, 1500);
	}

// echo chosen nickname (from background script)
// **** This is not working because background script cannot respond messages
//		from Popup, because Popup's port is re-opened every time it pops up.
function onClickButt5() {
	var name = sessionStorage.getItem("YKY-nickname");
	console.log("Chosen nickname = ", name);
	// var name = document.getElementById("Nickname").value;
	portPopup.postMessage({askNickname: "null"});
	// browser.runtime.sendMessage({selectNickname: name});
	}

// reload extension
function onClickButt6() {
	portPopup.postMessage({alert: "browser-reload"});
	browser.runtime.reload();
	// Seems that stuffs below here are unused...
	setTimeout(function() {
		window.close();
		}, 1500);
	}

// Reset event stream (?) -- seems not needed anymore
function onClickButt7() {
	portPopup.postMessage({resetEventStream: "?"});
	// browser.runtime.sendMessage({resetEventStream: "?"});
	setTimeout(function() {
		window.close();
		}, 1500);
	}

// select nickname
function onSelectNickname() {
	var name = document.getElementById("Nickname").value;
	console.log("Selected nick =", name);
	sessionStorage.setItem("YKY-nickname", name);
	portPopup.postMessage({alert: name});	// Common nicknames have sound files
	portPopup.postMessage({selectNickname: name});
	// browser.runtime.sendMessage({selectNickname: name});
	setTimeout(function() {
		window.close();
		}, 1500);
	}

document.getElementById('butt1').addEventListener('click', onClickButt1);
document.getElementById('butt2').addEventListener('click', onClickButt2);
document.getElementById('butt3').addEventListener('click', onClickButt3);
document.getElementById('butt4').addEventListener('click', onClickButt4);
document.getElementById('butt5').addEventListener('click', onClickButt5);
document.getElementById('butt6').addEventListener('click', onClickButt6);
document.getElementById('butt7').addEventListener('click', onClickButt7);
document.getElementById('Nickname').addEventListener('change', onSelectNickname);
