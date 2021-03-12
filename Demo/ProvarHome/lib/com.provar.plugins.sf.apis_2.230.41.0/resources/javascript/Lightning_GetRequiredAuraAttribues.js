var auraId = arguments[0];
var attributeName = arguments[1];
var baseXpath = arguments[2];
if(!attributeName) {
	attributeName = "v.recordId";
}
var attributeValue = null;
var entityList = [];
var component = null;
if(auraId) {
	component = $A.getComponent(auraId);
} else if (baseXpath) {
	var flexipageComponentDivIt = document.evaluate(baseXpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
	var flexipageComponentDiv = flexipageComponentDivIt.iterateNext();
	if (flexipageComponentDiv){
		var flexiComponentAuraId = flexipageComponentDiv.getAttribute("data-aura-rendered-by");
		component = $A.getComponent(flexiComponentAuraId);
	}
}
if(component && component.getAttributeValueProvider() && component.getAttributeValueProvider().getConcreteComponent()) {
	attributeValue = component.getAttributeValueProvider().getConcreteComponent().get(attributeName);
}
if (attributeName === 'v.records' && attributeValue) {
	for (let i = 0; i < attributeValue.length; i++) {
	    entityList.push(attributeValue[i].sobjectType)
	}
	return entityList;
}
return attributeValue;
