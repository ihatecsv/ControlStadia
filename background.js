chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
				"gamepad-tester.com",
				"gamepad.e7d.io",
				"cloud.boosteroid.com",
                "www.xbox.com",
                "play.geforcenow.com",
				"shadow.tech",
				"www.paperspace.com",
				"parsec.app",
				"www.nvidia.com",
				"playkey.net",
				"www.netboom.com",
				"www.blacknut.com",
				"www.furioos.com",
				"luna.amazon.com",
                "stadia.google.com"
            ].map(hostEquals => (
                [new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals},
                })]
            )),
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
    const startParams = {
        "firstRun": true
    };
    chrome.storage.sync.get([
        "firstRun"
    ], function(settings) {
        for(const key of Object.keys(settings)){
            startParams[key] = settings[key];
        }
        chrome.storage.sync.set(startParams, function() {
            console.log("ControlStadia: Set start params!");
        });
    });
});
