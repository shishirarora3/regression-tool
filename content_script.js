
console.save = function (data, filename) {

    if (!data) {
        console.error('Console.save: No data');
        return;
    }

    if (!filename) filename = 'console.json';

    if (typeof data === "object") {
        data = JSON.stringify(data, undefined, 4);
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a');

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
};

const injectFile = (file, type = "script", attr="src")=> {
    var s = document.createElement(type);
    s[attr] = chrome.extension.getURL(file);
    (document.head || document.documentElement).appendChild(s);
};
var port = chrome.runtime.connect();

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source !== window)
        return;

    if (event.data.type && (event.data.type === "CURRENT_STATE")) {
        console.save(event.data.stateString, "current-state.json");
        window.setTimeout(()=>{
            console.save(event.data.initialState, "initial-state.json");
            window.setTimeout(()=>{
                navigator.clipboard.writeText(event.data.stateString).then(function () {
                    //window.alert('Async: Copying to clipboard was successful!');
                }, function (err) {
                    console.error('Async: Could not copy text: ', err);
                });
            },2000);
        },3000);


    }
}, false);

chrome.runtime.onMessage.addListener(
    function(message, callback) {
            console.log(message, callback);
            //injectFile('lodash.js');
            //injectFile('jquery.js');
            //injectScripts('inject_immediate.js');
            //injectFile('actions.js');
    });




