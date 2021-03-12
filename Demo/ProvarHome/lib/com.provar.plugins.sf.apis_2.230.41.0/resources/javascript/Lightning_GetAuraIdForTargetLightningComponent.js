var contextXpath = arguments[0];
var componentName = arguments[1];
var pageNameToMatch = arguments[2];
var flexipageComponentDivIt = document.evaluate(contextXpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

var flexipageComponentDiv = flexipageComponentDivIt.iterateNext();
while (flexipageComponentDiv){
	
	var auraId = flexipageComponentDiv.getAttribute("data-aura-rendered-by");
    var flexipageComponent = $A.getComponent(auraId);
    if (!flexipageComponent) {
    	continue;
    }
    var attributeValueProvider = flexipageComponent.getAttributeValueProvider ? flexipageComponent.getAttributeValueProvider() : null;
    if (!attributeValueProvider) {
    	continue;
    }

    var concreteComponent = attributeValueProvider.getConcreteComponent ? attributeValueProvider.getConcreteComponent() : null;
    if (!concreteComponent) {
    	continue;
    }
    
    var descriptor = concreteComponent.get('v.body[0].componentDef.descriptor');
    var macthedAuraId; 
    if (descriptor) {
        descriptor = descriptor.substring(descriptor.lastIndexOf('/')+1);
        var prefix = descriptor.split(':')[0];
        if (prefix === 'c'){
            descriptor = descriptor.split(':')[1];
        }

        if (descriptor === componentName) {
        	macthedAuraId = auraId;
        }
    }
    if(macthedAuraId && !pageNameToMatch) {
    	return macthedAuraId;
    }
    if(macthedAuraId && pageNameToMatch) {
    	var pageName = concreteComponent.get('v.body[0].attributes.values.pageName.value');
    	if(pageNameToMatch === pageName) {
    		return macthedAuraId;
    	} else {
    		macthedAuraId = null;
    	}
    }
    flexipageComponentDiv = flexipageComponentDivIt.iterateNext()   
}

return null;

