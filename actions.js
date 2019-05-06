//[[[1],[4],[7]],[[1],[4],[7,8]],...
const actionsArrList = getCompositeSubsets([
    [3, 5, 6, 9],
    [0],
    [null]
].map(getSubsets));


//[[1],[4],[7]]
const takeSnapshots = false;

try{
    const startIter =+localStorage.getItem("iter") + 1;
    const length = actionsArrList.length;
    if(startIter<length-1){
        runSync(actionsArrList, startIter+1);
    }

}catch (e) {
    console.error(e);
    runSync(actionsArrList);
}
/**
 [
 [[3,5], [1]], //tc1
 [[3], [1,3]] //tc2
 ]
 **/

function actions(){
    return [
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
                    ({value, done} = iterator.next());
                    ({value: valueActionsArriterator, done: doneActionsArriterator} = actionsArriterator.next());
                } else {
                    if(takeSnapshots){
                        const snapshots = JSON.parse(localStorage.getItem("snapshots") || "{}");

                        snapshots[JSON.stringify(actionsArr)]= resultSnapshots;
                        localStorage.setItem("snapshots", JSON.stringify(
                            snapshots
                            )
                        );
                    }else{
                        //find diff
                        const snapshots = JSON.parse(localStorage.getItem("snapshots") || "{}");
                        const actionsArrString = JSON.stringify(actionsArr);
                        const snapshot = snapshots[actionsArrString];
                        if(snapshot){
                            let index = -1;
                            const isNotEqual = snapshot.some((s, i)=>{
                                const r = resultSnapshots[i] !== s;
                                if(r){
                                    index = i;
                                }
                                return r;
                            });
                            if(isNotEqual){
                                console.error(`Snapshot Error: ${actionsArrString} => action ${index} => 
                                expected: ${snapshot[index]} \n got: ${resultSnapshots[index]}`);
                            }

                        }

                    }
                    clearInterval(i);
                    location.reload();
                    setTimeout(res, 500);
                }
            } catch (e) {
                rej(e);
            }
        }, 500);
    });

}




function runSync(actionsArrList, startIter=0){
        localStorage.setItem("iter",`${startIter}`);
        runActionsOnIdSubset(actionsArrList[startIter]);
}



function getSubsets(values) {
    const result = [];
    const inputIndices = [...new Array(values.length)].map((_, i) => i);
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


