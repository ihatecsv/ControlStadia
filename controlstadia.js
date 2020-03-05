function main(){
	let config = null;
	window.addEventListener("startConfig", function(e) {
		config = e.detail;
		setupCS();
	}, false);
	const setupCS = function(){
		console.log("ControlStadia: Injected!")
	}
}

chrome.storage.sync.get([
], function(settings) {
	settings.extUrl = chrome.runtime.getURL("/");
	if(settings.disableTouchStadia) return;
	const injScript = document.createElement("script");
	injScript.appendChild(document.createTextNode("(" + main + ")();"));
	(document.body || document.head || document.documentElement).appendChild(injScript);
	window.dispatchEvent(new CustomEvent("startConfig", {detail: settings}));
});