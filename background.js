chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: "stadia.google.com"},
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: "gamepad-tester.com"},
                }),
            ],
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
