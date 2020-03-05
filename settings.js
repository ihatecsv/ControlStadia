document.getElementById("version").innerText = chrome.runtime.getManifest().version;

const firstRunNotificationElem = document.getElementById("first-run-notification");
const firstRunNotificationCloseButtonElem = document.getElementById("first-run-notification-close-button");
const settingsElem = document.getElementById("settings");
const applyButtonElem = document.getElementById("apply-button");
const gamepadRefreshButtonElem = document.getElementById("gamepad-refresh-button");
const gamepadSelectElem = document.getElementById("gamepad-select");
const buttonListElem = document.getElementById("button-list");

const axes = [
    {label: "LX"}, //0
    {label: "LY"}, //1
    {label: "RX"}, //2
    {label: "RY"}, //3
]

const buttons = [
    {label: "A"}, //0
    {label: "B"}, //1
    {label: "X"}, //2
    {label: "Y"}, //3
    {label: "L1"}, //4
    {label: "R1"}, //5
    {label: "L2"}, //6
    {label: "R2"}, //7
    {label: "Select"}, //8
    {label: "Start"}, //9
    {label: "L3"}, //10
    {label: "R3"}, //11
    {label: "Up"}, //12
    {label: "Down"}, //13
    {label: "Left"}, //14
    {label: "Right"}, //15
    {label: "Home"} //16
]

const populateGamepadSelect = function(){
    gamepadSelectElem.innerHTML = "";
    const gamepads = navigator.getGamepads();
    for(let i = 0; i < gamepads.length; i++){
        if(gamepads[i] !== null){
            const optionElem = document.createElement("option");
            optionElem.value = gamepads[i].index;
            optionElem.innerText = gamepads[i].id;
            gamepadSelectElem.add(optionElem);
        }
    }
    console.log("ControlStadia: Refreshed gamepad list!");
}

const awaitInputToSet = function(srcType, srcIndex, buttonLabelElem){
    const gamepadSelectedIndex = parseInt(gamepadSelectElem.value);
    const originalGamepadState = navigator.getGamepads()[gamepadSelectedIndex];
    const originalButtonState = originalGamepadState.buttons.slice();
    const originalAxesState = originalGamepadState.axes.slice();
    const changeFound = function(dstType, dstIndex){
        buttonLabelElem.innerHTML = (dstType ? "Axis" : "Button") + " " + dstIndex;
        (srcType ? axes : buttons)[srcIndex].dstIndex = dstIndex;
        (srcType ? axes : buttons)[srcIndex].dstType = dstType;
        (srcType ? axes : buttons)[srcIndex].dstID = originalGamepadState.id;
    }
    const checkInterval = setInterval(function(){
        const currentGamepadState = navigator.getGamepads()[gamepadSelectedIndex];
        const currentButtonState = currentGamepadState.buttons.slice();
        const currentAxesState = currentGamepadState.axes.slice();
        for(let i = 0; i < originalButtonState.length; i++){
            if(
                currentButtonState[i].pressed !== originalButtonState[i].pressed ||
                currentButtonState[i].touched !== originalButtonState[i].touched ||
                currentButtonState[i].value !== originalButtonState[i].value
            ){
                changeFound(0, i);
                clearInterval(checkInterval);
                break;
            }
        }
        for(let i = 0; i < originalAxesState.length; i++){
            if(currentAxesState[i] !== originalAxesState[i]){
                changeFound(1, i);
                clearInterval(checkInterval);
                break;
            }
        }
    }, 200);
}

const populateButtonList = function(){
    buttonListElem.innerHTML = "";
    for(let i = 0; i < buttons.length; i++){
        const buttonButtonElem = document.createElement("button");
        buttonButtonElem.innerHTML = buttons[i].label;
        const buttonLabelElem = document.createElement("span");
        buttonLabelElem.innerHTML = "[Unset]";
        const breakElem = document.createElement("br");
        buttonListElem.appendChild(buttonButtonElem);
        buttonListElem.appendChild(buttonLabelElem);
        buttonListElem.appendChild(breakElem);
        buttonButtonElem.onclick = function(){
            buttonLabelElem.innerHTML = "[Press button/move axis]";
            awaitInputToSet(0, i, buttonLabelElem);
        }
    }
    for(let i = 0; i < axes.length; i++){
        const buttonButtonElem = document.createElement("button");
        buttonButtonElem.innerHTML = axes[i].label;
        const buttonLabelElem = document.createElement("span");
        buttonLabelElem.innerHTML = "[Unset]";
        const breakElem = document.createElement("br");
        buttonListElem.appendChild(buttonButtonElem);
        buttonListElem.appendChild(buttonLabelElem);
        buttonListElem.appendChild(breakElem);
        buttonButtonElem.onclick = function(){
            buttonLabelElem.innerHTML = "[Press button/move axis]";
            awaitInputToSet(1, i, buttonLabelElem);
        }
    }
    console.log("ControlStadia: Populated button list!");
}
populateButtonList();

chrome.storage.sync.get([
    "firstRun"
], function(settings) {

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
        const options = {
            axes: axes,
            buttons: buttons
        };
        chrome.storage.sync.set(options, function(){
            console.log("ControlStadia: Set options!");
            chrome.tabs.reload();
        });
    }

    gamepadRefreshButtonElem.onclick = function(){
        populateGamepadSelect();
    }
});