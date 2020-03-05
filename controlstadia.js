function main(){
	let config = null;
	window.addEventListener("startConfig", function(e) {
		config = e.detail;
		setupCS();
	}, false);
	const setupCS = function(){
		console.log("ControlStadia: Injected!");
		const emulatedGamepad = {
			id: "ControlStadia emulated gamepad",
			index: 0,
			connected: true,
			timestamp: 0,
			mapping: "standard",
			axes: [0, 0, 0, 0],
			buttons: []
		}
		const originalGetGamepads = navigator.getGamepads;
		navigator.getGamepads = function(){ // The magic happens here
			const originalGamepads = originalGetGamepads.apply(navigator);
			for(let i = 0; i < 17; i++){
				if(typeof config.buttons[i].dstID !== "undefined"){
					let found = false;
					let gamepadID;
					for(gamepadID = 0; gamepadID < originalGamepads.length; gamepadID++){
						if(originalGamepads[gamepadID] !== null && originalGamepads[gamepadID].id === config.buttons[i].dstID){
							found = true;
							break;
						}
					}
					if(found){
						if(config.buttons[i].dstType){ //Axis
							emulatedGamepad.buttons[i] = {
								"pressed": originalGamepads[gamepadID].axes[config.buttons[i].dstIndex] !== 0,
								"touched": originalGamepads[gamepadID].axes[config.buttons[i].dstIndex] !== 0,
								"value": originalGamepads[gamepadID].axes[config.buttons[i].dstIndex]
							}
						}else{ //Button
							emulatedGamepad.buttons[i] = originalGamepads[gamepadID].buttons[config.buttons[i].dstIndex];
						}
						emulatedGamepad.timestamp = originalGamepads[gamepadID].timestamp;
					}else{
						emulatedGamepad.buttons[i] = {pressed: false, touched: false, value: 0};
					}
				}else{
					emulatedGamepad.buttons[i] = {pressed: false, touched: false, value: 0};
				}
			}

			for(let i = 0; i < 4; i++){
				if(typeof config.axes[i].dstID !== "undefined"){
					let found = false;
					let gamepadID;
					for(gamepadID = 0; gamepadID < originalGamepads.length; gamepadID++){
						if(originalGamepads[gamepadID] !== null && originalGamepads[gamepadID].id === config.axes[i].dstID){
							found = true;
							break;
						}
					}
					if(found){
						emulatedGamepad.axes[i] = originalGamepads[gamepadID].axes[config.axes[i].dstIndex];
						emulatedGamepad.timestamp = originalGamepads[gamepadID].timestamp;
					}else{
						emulatedGamepad.axes[i] = 0;
					}
				}else{
					emulatedGamepad.axes[i] = 0;
				}
			}
			return [emulatedGamepad, null, null, null];
		}
	}
}

chrome.storage.sync.get([
	"axes",
	"buttons"
], function(settings) {
	settings.extUrl = chrome.runtime.getURL("/");
	if(settings.disableTouchStadia) return;
	const injScript = document.createElement("script");
	injScript.appendChild(document.createTextNode("(" + main + ")();"));
	(document.body || document.head || document.documentElement).appendChild(injScript);
	window.dispatchEvent(new CustomEvent("startConfig", {detail: settings}));
});