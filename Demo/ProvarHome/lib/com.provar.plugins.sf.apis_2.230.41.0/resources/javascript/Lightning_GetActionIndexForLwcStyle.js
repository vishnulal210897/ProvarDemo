const xpath = arguments[0];
var actionName = arguments[1];
if (actionName) {
	actionName = actionName.toLowerCase();
}
var lightningActionName = arguments[2];
if (lightningActionName) {
	lightningActionName = lightningActionName.toLowerCase();
}

if ((!actionName && !lightningActionName) || !xpath) {
	return -1;
}
let iteration = 1;
let nodeIterator = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
while(true) {
    const node = nodeIterator.iterateNext();
    if (!node) {
        break;
    }
    const elementContainer = node.closest('runtime_platform_actions-action-renderer');

    if (elementContainer && elementContainer.action && elementContainer.action.apiName
    		&& (elementContainer.action.apiName.toLowerCase() === actionName || elementContainer.action.apiName.toLowerCase() === lightningActionName)) {
        return iteration;
    }
    iteration++;
}
return -1;
