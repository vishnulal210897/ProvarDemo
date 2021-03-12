var xpathToMatch = arguments[0];
var attributeName = arguments[1];
var matchingValue = arguments[2];
var caseSensitive = arguments[3];
var matchingGlobalId = null;

if(matchingValue === undefined || matchingValue === null || !attributeName) {
	return null;
}
var actionElements = document.evaluate(xpathToMatch, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
var actionEle = actionElements.iterateNext();
while (actionEle) {
	var auraId = actionEle.getAttribute("data-aura-rendered-by");
	var component = auraId ? $A.getComponent(auraId) : null;
	if(component && component.getAttributeValueProvider() && component.getAttributeValueProvider().getConcreteComponent()) {
		var attributeValue = component.getAttributeValueProvider().getConcreteComponent().get(attributeName);
		//perform case sensitive check in case of Picklists
		var valueMatches = caseSensitive ? matchingValue === attributeValue : (attributeValue ? matchingValue.toLowerCase() === attributeValue.toLowerCase() : false);
		if(valueMatches){
			matchingGlobalId = auraId;
			break;
		}
	}
	actionEle = actionElements.iterateNext();
}
return matchingGlobalId;