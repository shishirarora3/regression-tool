
const TAKE_SNAPSHOTS = localStorage.getItem("take-snapshots") === "true";
const TIME_BETWEEN_ACTIONS = 500;
//[[[1],[4],[7]],[[1],[4],[7,8]],...
const actionsArrList = getCompositeSubsets([
    [3, 5, 6, 9], // possible ids of actions, here only actions items with ids 3, ,5,6, 9 are included in tests
    [0],// possible ids of actions, here only action item with id 0 is included in tests
    [null]
].map(getSubsets));


//[[1],[4],[7]]
try {
    const startIter = +localStorage.getItem("iter");//-1
        if(TAKE_SNAPSHOTS && startIter == -1){
            localStorage.setItem("snapshots", "");
        }
        if (startIter == -1) {
            chrome.storage.local.set({"result":[]}, function () {
                console.log("result reset");
            });
        }
        const length = actionsArrList.length;
        if ( startIter < length - 1 ) {
            runSync(actionsArrList, startIter + 1);
        } else if(!TAKE_SNAPSHOTS){
            chrome.storage.local.get(["result"], function (response) {
                console.log("get result",response);
                const {result: data} =  response;
                var tabulatorCSSURL = chrome.runtime.getURL("tabulator.min.css");
                var StyleURL = chrome.runtime.getURL("style.css");
                var tabulatorJSURL = chrome.runtime.getURL("tabulator.js");
                try{
                    const html = `<html>
            <head>
                <link href="${tabulatorCSSURL}" rel="stylesheet"/>
                <link href="${StyleURL}" rel="stylesheet"/> 
                <script type="text/javascript" src="${tabulatorJSURL}"></script>
            </head>
            <body>
                <div id='app'>
               <table>
                    <thead>
                        <tr>
                            <th>Index</th>
                            <th>Test Case - First Failed Step</th>
                            <th class="width-same">Expected</th>  
                            <th class="width-same">Actual</th>  
                            <th class="width-same">Difference</th>  
                        </tr>
                    </thead>
                    <tbody>
                        ${data.reduce((r,d,i)=>r+`
                        <tr>
                        <td>
                        ${i+1}
                        </td>
                        <td>
                            ${d.actionsArrString} - ${d.index}
                        </td>
                        
                        <td class="width-same">
                           ${d.Expected} 
                        </td>
                        <td class="width-same">
                           ${d.Actual} 
                        </td>
                        <td class="width-same">
                           ${d.Difference} 
                        </td>
                        </tr>
                        `,"")}
                    </tbody>
                </table>
                </div>
            </body>
            </html>`;
                    console.save(html, "diff.html", "text/html");
                }catch(e){
                    console.error(e);
                }

            });
        }

} catch (e) {
    console.error(e);
    //runSync(actionsArrList);
}

/**
 [
 [[3,5], [1]], //tc1
 [[3], [1,3]] //tc2
 ]
 **/

function actions() {
    return [
        /*tool will do all possible permutations of these ids*/
        (ids) => { //action 1
            var check = (i) => `body > div.js-content > div > div > div > div > div > div.playgroundPreview > div > div > div > div > article > div.return-main-container > div > div > div > div > div:nth-child(${i}) > div > div.new-order-item-select-container > div > label > div > span > span > span`;
            var drop = (i) => `body > div.js-content > div > div > div > div > div > div.playgroundPreview > div > div > div > div > article > div.return-main-container > div > div > div > div > div:nth-child(${i}) > div > div.product-tile-back > div > div:nth-child(2) > div > div:nth-child(1) > div > select`;
            ids.forEach((i) => {
                try {
                    const checkEl = document.querySelector(check(i));
                    checkEl && checkEl.dispatchEvent(new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    }));
                } catch (e) {
                    console.error(e);
                }
                try {
                    var select = document.querySelector((drop(i)));
                    if (select) {
                        select.value = '51';
                        select.dispatchEvent(new Event("change", {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        }));
                    }
                } catch (e) {
                    console.error(e);
                }
            });
            $('button:contains("Continue"):first').trigger("click");

        },
        /*tool will do all possible permutations of these ids*/
        (ids) => { //action 2

            ids.forEach((id) => {
                var radio = $(`[type="radio"]:eq(${id})`);
                radio.click();
            });
            $('button:contains("Continue"):first').trigger("click");
        },
        () => { //action 3
            $('button:contains("Finish"):first').trigger("click");
        }
    ];
};


function runActionsOnIdSubset(actionsArr) {
    return new Promise((res, rej) => {
        var iterator = actions()[Symbol.iterator]();
        var actionsArriterator = actionsArr[Symbol.iterator](); //[1],[4],[7]
        var done, value;
        var doneActionsArriterator, valueActionsArriterator;
        var resultSnapshots = [];
        var i = setInterval(() => {
            try {
                if (!done && !doneActionsArriterator) {
                    console.log(valueActionsArriterator, doneActionsArriterator);
                    value && value(valueActionsArriterator);
                    const snapshot = document.querySelector('article').innerText;
                    resultSnapshots.push(snapshot);
                    ({value, done} = iterator.next());//action definition ia page
                    ({value: valueActionsArriterator, done: doneActionsArriterator} = actionsArriterator.next()); //action ids in a page
                } else {
                    if (TAKE_SNAPSHOTS) {
                        const snapshots = JSON.parse(localStorage.getItem("snapshots") || "{}");

                        snapshots[JSON.stringify(actionsArr)] = resultSnapshots;
                        localStorage.setItem("snapshots", JSON.stringify(
                            snapshots
                            )
                        );
                    } else {
                        //find diff
                        const snapshots = JSON.parse(localStorage.getItem("snapshots") || "{}");
                        const actionsArrString = JSON.stringify(actionsArr);
                        const snapshot = snapshots[actionsArrString];
                        if (snapshot) {
                            let index = -1;
                            const isNotEqual = snapshot.some((s, i) => {
                                const r = resultSnapshots[i] !== s;
                                if (r) {
                                    index = i;
                                }
                                return r;
                            });
                            if (isNotEqual) {
                                const [_original, _erroneousText] = [snapshot[index], resultSnapshots[index]];


                                    chrome.runtime.sendMessage({
                                        type: "calculate-diff",
                                        data: {_original, _erroneousText, actionsArrString, index}
                                    }, function(response) {
                                        console.log(response);
                                    });

                            }

                        }

                    }
                    clearInterval(i);
                    location.reload();
                    setTimeout(res, TIME_BETWEEN_ACTIONS);
                }
            } catch (e) {
                rej(e);
            }
        }, TIME_BETWEEN_ACTIONS);
    });

}



function runSync(actionsArrList, startIter = 0) {
    localStorage.setItem("iter", `${startIter}`);
    runActionsOnIdSubset(actionsArrList[startIter]);
}

/**
 *
 * @param values [3,5,6]
 * @returns {Array} [[3], [3,5], [3,5,6],  [3,5,6,9], [3,5,9].....15]
 */
function getSubsets(values) {
    const result = [];
    const inputIndices = [...Array(values.length)].map((_, i) => i);
    const rec = (resultIndices = []) => {
        const nextResult = resultIndices.map(i => values[i]);
        if (nextResult.length > 0) {
            result.push(nextResult);
        }
        const remIndices = inputIndices.filter((i) => resultIndices.every(r => i > r));
        remIndices.forEach((i) => {
            const _resultIndices = [...resultIndices, i];
            rec(_resultIndices);
        });
    };
    rec([]);
    return result;
}


/**
 *
 * @param subsetsArr [
       [[3], [3,5], [3,5,6],  [3,5,6,9], [3,5,9].....15],
        [[0]],
        [[null]]
   ]
 * @returns {*} array containing items equal to no. of tests we are finally running,
 each test item has actions it will do in that test
 [
   [[3], [0], [null]],
    [[3,5], [0], [null]],
    [[3,5,6], [0], [null]],...15
 ]
 */
function getCompositeSubsets(subsetsArr) {
    let result = subsetsArr[0].map(s => [s]);
    subsetsArr.slice(1).forEach((subsets) => {
        let _result = [];
        result.forEach((r) => {
            subsets.forEach((subset) => { //subsets2
                _result.push([...r, subset]);
            });
        });
        result = _result;
    });

    return result;
}


