function main(){
	let config = null;
	window.addEventListener("startConfig", function(e) {
		config = e.detail;
		setupCS();
	}, false);
	const setupCS = function(){
		console.log("ControlStadia: Injected!");
		const originalGetGamepads = navigator.getGamepads;
		navigator.getGamepads = function(){ // The magic happens here
			const originalGamepads = originalGetGamepads.apply(navigator);
			const modifiedGamepads = [originalGamepads[0], null, null, null];
			let insertIndex = 1;
			for(let i = 0; i < 4; i++){
				if(insertIndex >= 4) break;
				if(originalGamepads[i] !== null){
					modifiedGamepads[insertIndex] = {};
					for(let property in originalGamepads[i]){
						modifiedGamepads[insertIndex][property] = originalGamepads[i][property];
					}
					modifiedGamepads[insertIndex].index = insertIndex;
					modifiedGamepads[insertIndex].mapping = "standard";
					insertIndex++;
				} 
			}
			return modifiedGamepads;
		}
	}
}

chrome.storage.sync.get([
	""
], function(settings) {
	settings.extUrl = chrome.runtime.getURL("/");
	if(settings.disableTouchStadia) return;
	const injScript = document.createElement("script");
	injScript.appendChild(document.createTextNode("(" + main + ")();"));
	(document.body || document.head || document.documentElement).appendChild(injScript);
	window.dispatchEvent(new CustomEvent("startConfig", {detail: settings}));
});