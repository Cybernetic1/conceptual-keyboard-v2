// Server can send SSE events to Conkey

function streamEventHandler(e) {
	// console.log("/conkey data: " + e.data);
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
