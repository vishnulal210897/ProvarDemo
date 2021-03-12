const xpath = arguments[0];
const apiName = arguments[1];
let nodeIterator = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
let iteration = 1;
while(true) {
    const node = nodeIterator.iterateNext();
    if (!node) {
        break;
    }
    const listContainer = node;
    if (listContainer && listContainer.relatedListApiName && listContainer.relatedListApiName === apiName) {
        return iteration;
    }
    iteration++;
}
return -1;
