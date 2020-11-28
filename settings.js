document.getElementById("version").innerText = chrome.runtime.getManifest().version;

const firstRunNotificationElem = document.getElementById("first-run-notification");
const firstRunNotificationCloseButtonElem = document.getElementById("first-run-notification-close-button");
const settingsElem = document.getElementById("settings");
const joystickSettingsElem = document.getElementById("joystick-settings");
const applyButtonElem = document.getElementById("apply-button");
const resetButtonElem = document.getElementById("reset-button");
const gamepadRefreshButtonElem = document.getElementById("gamepad-refresh-button");
const gamepadSelectElem = document.getElementById("gamepad-select");
const controlListElem = document.getElementById("control-list");
const disableControlStadiaElem = document.getElementById("disable-controlstadia");
const findingJoysticksElem = document.getElementById("finding-joysticks");

let axesDefault = [
    {label: "LX"}, //0
    {label: "LY"}, //1
    {label: "RX"}, //2
    {label: "RY"}, //3
]

let buttonsDefault = [
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

axesDefault.forEach(function(axis){axis.scale = 1; axis.offset = 0;})
buttonsDefault.forEach(function(button){button.scale = 1; button.offset = 0;})

let axes;
let buttons;

const resetAxesAndButtons = function(){
    axes = axesDefault.slice();
    buttons = buttonsDefault.slice();
}
resetAxesAndButtons();

const populateGamepadSelect = function(){
    gamepadSelectElem.innerHTML = "";
    let gamepadFound = false;
    const gamepads = navigator.getGamepads();
    for(let i = 0; i < gamepads.length; i++){
        if(gamepads[i] !== null){
            const optionElem = document.createElement("option");
            optionElem.value = gamepads[i].index;
            optionElem.innerText = gamepads[i].id;
            gamepadSelectElem.add(optionElem);
            gamepadFound = true;
        }
    }
    if(gamepadFound){
        joystickSettingsElem.style.display = "initial";
        findingJoysticksElem.style.display = "none";
        const mapButtons = document.querySelectorAll(".map-button-disabled");
        for(let i = 0; i < mapButtons.length; i++){
            console.log(mapButtons[i].innerText);
            mapButtons[i].classList.remove("map-button-disabled");
        }
    }else{
        setTimeout(populateGamepadSelect, 500);
    }
    console.log("ControlStadia: Refreshed gamepad list!");
}

const makeLabelString = function(type, index){
    return (type ? "Axis" : "Button") + " " + index;
}

const awaitInputToSet = function(srcType, srcIndex, buttonLabelElem){
    const gamepadSelectedIndex = parseInt(gamepadSelectElem.value);
    const originalGamepadState = navigator.getGamepads()[gamepadSelectedIndex];
    const originalButtonState = originalGamepadState.buttons.slice();
    const originalAxesState = originalGamepadState.axes.slice();
    const changeFound = function(dstType, dstIndex){
        buttonLabelElem.innerHTML = makeLabelString(dstType, dstIndex);
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
            if(currentAxesState[i] >= originalAxesState[i] + 0.5 ||
                currentAxesState[i] <= originalAxesState[i] - 0.5){
                changeFound(1, i);
                clearInterval(checkInterval);
                break;
            }
        }
    }, 200);
}

chrome.storage.sync.get([
    "firstRun",
    "axes",
    "buttons",
    "disableControlStadia"
], function(settings) {

    disableControlStadiaElem.checked = settings.disableControlStadia;

    if(settings.firstRun){
        settingsElem.style.display = "none";
    }else{
        firstRunNotificationElem.style.display = "none";
    }

    if(typeof settings.axes !== "undefined" && typeof settings.buttons !== "undefined"){
        axes = settings.axes;
        buttons = settings.buttons;
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
            buttons: buttons,
            disableControlStadia: disableControlStadiaElem.checked
        };
        chrome.storage.sync.set(options, function(){
            console.log("ControlStadia: Set options!");
            chrome.tabs.reload();
        });
    }

    gamepadRefreshButtonElem.onclick = function(){
        populateGamepadSelect();
    }
    populateGamepadSelect();

    resetButtonElem.onclick = function(){
        chrome.storage.sync.clear();
        resetAxesAndButtons();
        chrome.tabs.reload();
        window.location.href = window.location.href;
        console.log("TouchStadia: Reset button config!");
    }

    const populateControlList = function(){
        const createControl = function(type, index){
            const trElem = document.createElement("tr");
            const objectOfType = (type ? axes : buttons);
    
            const controlLabelElem = document.createElement("span");
            const controlLabelTdElem = document.createElement("td");
            controlLabelElem.innerHTML = objectOfType[index].label;
            controlLabelTdElem.appendChild(controlLabelElem);
    
            const controlButtonElem = document.createElement("button");
            const controlButtonTdElem = document.createElement("td");
            controlButtonElem.innerHTML = typeof objectOfType[index].dstIndex !== "undefined" ? makeLabelString(objectOfType[index].dstType, objectOfType[index].dstIndex) : "[Unset]";
            controlButtonElem.className = "map-button-disabled";
            controlButtonTdElem.appendChild(controlButtonElem);
    
            const controlScaleElem = document.createElement("input");
            const controlScaleTdElem = document.createElement("td");
            controlScaleElem.type = "number";
            controlScaleElem.value = objectOfType[index].scale;
            controlScaleElem.className = "small-input";
            controlScaleTdElem.appendChild(controlScaleElem);
    
            const controlOffsetElem = document.createElement("input");
            const controlOffsetTdElem = document.createElement("td");
            controlOffsetElem.type = "number";
            controlOffsetElem.value = objectOfType[index].offset;
            controlOffsetElem.className = "small-input";
            controlOffsetTdElem.appendChild(controlOffsetElem);
    
            trElem.appendChild(controlLabelTdElem);
            trElem.appendChild(controlButtonTdElem);
            trElem.appendChild(controlScaleTdElem);
            trElem.appendChild(controlOffsetTdElem);
    
            controlListElem.appendChild(trElem);
    
            controlButtonElem.onclick = function(){
                controlButtonElem.innerHTML = "[Setting...]";
                awaitInputToSet(type, index, controlButtonElem);
            }
    
            controlScaleElem.onchange = controlScaleElem.keyup = function(){
                objectOfType[index].scale = parseFloat(controlScaleElem.value);
            }
    
            controlOffsetElem.onchange = controlOffsetElem.keyup = function(){
                objectOfType[index].offset = parseFloat(controlOffsetElem.value);
            }
        }
        for(let i = 0; i < buttons.length; i++){
            createControl(0, i);
        }
        for(let i = 0; i < axes.length; i++){
            createControl(1, i);
        }
        console.log("ControlStadia: Populated control list!");
    }
    populateControlList();
});