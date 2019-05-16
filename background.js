const worker = new Worker(chrome.runtime.getURL('worker.js'));

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    const {type, data} = message;
    if (type == "calculate-diff")
    {
        worker.postMessage( data );
    }
    worker.onmessage = function(event) {
        console.log(JSON.stringify(event.data));
        chrome.storage.local.get(['result'], function(response) {
            console.log(response);
            const {result: _result} = response;
            console.log('result retrieved', _result);
            _result.push(event.data);
            console.log('Message from worker: ' + event.data);
            chrome.storage.local.set({'result': _result}, function() {
                console.log('result saved');
            });
        });
    };
    sendResponse(type+" received");
});

