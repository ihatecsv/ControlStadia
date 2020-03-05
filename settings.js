document.getElementById("version").innerText = chrome.runtime.getManifest().version;

chrome.storage.sync.get([
    "firstRun"
], function(settings) {
    const firstRunNotificationElem = document.getElementById("first-run-notification");
    const firstRunNotificationCloseButtonElem = document.getElementById("first-run-notification-close-button");
    const settingsElem = document.getElementById("settings");
    const applyButtonElem = document.getElementById("apply-button");

    if(settings.firstRun){
        settingsElem.style.display = "none";
    }else{
        firstRunNotificationElem.style.display = "none";
    }

    firstRunNotificationCloseButtonElem.onclick = function(){
        firstRunNotificationElem.style.display = "none";
        settingsElem.style.display = "initial";
        chrome.storage.sync.set({"firstRun": false}, function(){
            console.log("ControlStadia: First run completed!");
        });
    }

    applyButtonElem.onclick = function(){
        const startParams = {};
        chrome.storage.sync.set(startParams, function(){
            console.log("ControlStadia: Set options!");
            chrome.tabs.reload();
        });
    }
});