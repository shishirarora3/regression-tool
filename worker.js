
self.onmessage = function(event){
    const cross = (arr1, arr2)=>{
        let result;
        arr1.forEach((e,i)=>{

            return arr2.forEach((e1,j)=>{
                if(e===e1){
                    result = [e,i,j];
                }
            })
        });
        return result;
    };

    const DIFF_DEPTH = 15;

    function getDiff({_original, _erroneousText}) {
        const original = _original.split(/\s+/);
        const erroneousText = _erroneousText.split(/\s+/);
        let finalResult = "";
        let i = 0;
        let j = 0;
        let depth = 0;
        const [originalLen, erroneousTextLen] = [original.length, erroneousText.length];
        const spaceIfUndef = (text) => text === undefined ? "" : text;

        do {
            const [originalWord, erroneousWord] = [original[i], erroneousText[j]];
            depth++;
            if (originalWord === erroneousWord) {
                finalResult += ` ${spaceIfUndef(originalWord)}`;
                i++;
                j++;
            } else {
                try{
                    const possibleEqualy = cross(original.slice(i,i+DIFF_DEPTH), erroneousText.slice(j,j+DIFF_DEPTH));
                    console.log(possibleEqualy);
                    const [e,ik,jk] = possibleEqualy;
                    finalResult += ` <e>${spaceIfUndef(original.slice(i,i+ik).join(' '))}</e> <m>${spaceIfUndef(erroneousText.slice(j,
                        j+jk).join(" "))}</m>`;
                    j += jk; i+=ik;
                }catch(e){
                    //console.log(e);
                }

            }
        } while ((i < originalLen - 1 || j < erroneousTextLen - 1) && depth < 10000);
        return finalResult;
    }

    console.log(JSON.stringify(event.data));
    try{
        const {_original, _erroneousText, index,
            actionsArrString} = event.data;
        const finalResult = getDiff({_original, _erroneousText});
        const data = {
            Expected: _original, Actual: _erroneousText, Difference: finalResult
        };
        postMessage({...data, index,
            actionsArrString});
        /*const _result = [{Expected: _original, Actual: _erroneousText, Difference: finalResult},
            {Expected: _original, Actual: _erroneousText, Difference: finalResult}];*/

    }catch(e){
        console.error("from worker.js", e);
        postMessage({message: "error from worker.js",  e});
    }


};


