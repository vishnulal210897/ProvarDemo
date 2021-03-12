var xpathToMatch = arguments[0];
var matchingTarget = arguments[1];
var version = arguments[2];
var matchingGlobalId = null;

var actionElements = document.evaluate(xpathToMatch, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
var actionEle = actionElements.iterateNext();
while (actionEle) {
	var auraId = actionEle.getAttribute("data-aura-rendered-by");
	var component = auraId ? $A.getComponent(auraId) : null;
	if(component && component.getAttributeValueProvider() && component.getAttributeValueProvider().getConcreteComponent()) {
		var comp = component.getAttributeValueProvider().getConcreteComponent();
		var actionName = null;
		if(comp.type && "ui:actionMenuItem" === comp.type) {
			actionName = comp.get("v.id"); //drop down menu item
			if (version && "45.0" <= version && actionName) {
				actionName = actionName.substring(actionName.indexOf(":")+1);
			}
		}
		else if(comp.type && "folder:sidebarItem" === comp.type) {		
			actionName = comp.get("v.navOption").id; //Report Home
		}
		else {
			actionName = comp.get("v.targetValue");			
		}
		if(!actionName){
			actionName = comp.get("v.id"); //drop down menu item
		}
		if(!actionName && 'BUTTON' === actionEle.tagName){
			actionName = comp.getAttributeValueProvider().getConcreteComponent().get("v.targetValue") || comp.getAttributeValueProvider().getConcreteComponent().get("v.action.devNameOrId");
		}
		if(!actionName && 'LI' === actionEle.tagName){
			actionName = comp.get("v.navOption").id; //Report Home
		}
		if(actionName && (matchingTarget.toLowerCase() === actionName.toLowerCase())){
			matchingGlobalId = auraId;
			break;
		}
	}
	actionEle = actionElements.iterateNext();
}
return matchingGlobalId;