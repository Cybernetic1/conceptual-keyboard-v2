// Server can send SSE events to Conkey

// Seems that currently the only SSE messages are about "whichRoom"
// But we can handle more than that
function streamEventHandler(e) {
	// console.log("/conkey data: " + e.data);
	// e.data is just a string such as "HK", "UT", "梦1" etc.
	// if (e.data == '!something') { }
	//    we can intercept and do more stuff here
	document.getElementById("whichRoom").innerText = e.data;
}

var evtSource = null;
function initEventSource() {
	// Listen to Node.js server
	evtSource = new EventSource("http://localhost:8484/conkey");
	evtSource.onmessage = streamEventHandler;
	evtSource.onerror = function(e) {
		if (evtSource.readyState == 2) {
			evtSource.close();
			setTimeout(initEventSource, 3000);
		}
	};
}

initEventSource();
console.log("Loaded SSE-event handler for localhost:8484/conkey");
