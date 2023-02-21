// This script is loaded by login pages

// TO-DO:
// *

// DONE:
// * be able to pause auto-login

let myPort = browser.runtime.connect({name: "PORT-login"});

var nickname = "Cybernetic1";
const nicknames = ["Cybernetic1", "Cybernetic2", "雷米", "電飯"];
var current_nick_idx = 0;

// ******** Execute only once, at start of page-load **********
var timer = setTimeout(autoLogin, 5000);

function findNickname() {
	// NOTE: a page session lasts as long as the tab or the browser is open,
	// and survives over page reloads and restores.
	var nick = sessionStorage.getItem("YKY-nickname");
	if (nick != null) {
		console.log("Found nickname:", nick);
		nickname = nick;
		}
	console.log("Current nickname =", nickname);
	}

function getElementByXpath(path) {
	return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	}

function autoLogin() {
	// ****** 寻梦园, fill in name
	if ((document.URL.indexOf("ip131.ek21.com\/oaca") >= 0) ||
		(document.URL.indexOf("ip69.ek21.com\/ofi") >= 0) ||
		(document.URL.indexOf("ip203.ek21.com\/obzc") >= 0) ||
		(document.URL.indexOf("ip4.ek21.com\/ofi") >= 0))
		{
		document.getElementsByClassName("nameform 12")[0].value = nickname;
		document.getElementsByClassName("mainenter")[0].click();
		}

	// ****** chatroom.HK, fill in name
	if (document.URL.indexOf("chatroom.hk") >= 0)
		{
		document.getElementById("name").value = nickname;
		document.getElementById("submit").click();
		}

	// ****** UT-room, fill in details
	if (document.URL.indexOf("chat.f1.com.tw") >= 0)
		{
		getElementByXpath('/html/body/form/table/tbody/tr/td[2]/input').value = nickname;
		getElementByXpath('/html/body/form/table/tbody/tr/td[4]/select').value = 1; // male
		getElementByXpath('/html/body/form/table/tbody/tr/td[8]/select').value = 21; // Hong Kong
		getElementByXpath('/html/body/form/table/tbody/tr/td[10]/select').value = 51; // age
		var room = getElementByXpath('/html/body/table[6]/tbody/tr/td/table/tbody/tr[2]/td/table/tbody/tr[1]/td[1]/a');
		console.log("Room[1] = ", room.innerText);
		if (room.innerText.localeCompare('成人聊天室 ') == 0)
			room.click();
		else {
			room = getElementByXpath('/html/body/table[6]/tbody/tr/td/table/tbody/tr[2]/td/table/tbody/tr[2]/td[1]/a');
			console.log("Room[2] = ", room.innerText);
			if (room.innerText.localeCompare('成人聊天室 ') == 0)
				room.click();
			}
		}
}

document.addEventListener("keypress", function (event) {
    if (event.key === 'q') {
		console.log("Auto-login cancelled.");
		myPort.postMessage({alert: "login-cancelled.ogg"});
		clearTimeout(timer);
		}
    if (event.key === 'r') {
		console.log("Auto-login resumed.");
		myPort.postMessage({alert: "login-resumed.ogg"});
		timer = setTimeout(autoLogin, 3000);
		}
    if (event.key === 'n') {
		findNickname();
		myPort.postMessage({alert: nickname + ".ogg"});
		}
    if (event.key === 'N') {
		current_nick_idx += 1;
		if (current_nick_idx >= nicknames.length)
			current_nick_idx = 0;
		nickname = nicknames[current_nick_idx];
		console.log("Switched nickname to:", nickname);
		myPort.postMessage({alert: nickname + ".ogg"});
		}
} );

findNickname();
myPort.postMessage({alert: nickname + ".ogg"});

// This runs only once, as "login" page is loaded
console.log("Content script #3 = LOGIN (24 Dec 2022) loaded....");

/***********  Old method to communicate with Background script:

function handleResponse(message) {
	nickname = message.response;
}

function handleError(error) {
	console.log(`LOGIN script error: ${error}`);
}

var sending = browser.runtime.sendMessage({askNickname: "who?"});
sending.then(handleResponse, handleError);

*/
