
function resolveAuraBy(componentXPath, searchContext, multiple) {
    
    console.log("resolveAuraBy componentXPath: " + componentXPath + ", multiple: " + multiple);
    var lightningCompXpath="//div[@data-ltngout-rendered-by and @id]";
    
    var componentNode=document.evaluate(lightningCompXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if(componentNode){
        var vfLightningId=componentNode.getAttribute('data-ltngout-rendered-by');
    }
    if((componentXPath.includes("lightning:inputField") || componentXPath.includes("lightning:input")) && componentXPath.includes("qualifier=")){
        var componentXPathArr=componentXPath.split(",");
        var qualifier=componentXPathArr[1].split("=");
        componentXPath=componentXPathArr[0];
    }
    
    var auraInfo = extractAuraInfo(true,null,vfLightningId,null);
    
    if (auraInfo.exception) {
        return auraInfo.exception;
    }
    
    var flexiXpath="//div[((contains(@class,'windowViewMode-normal') and contains(@class,'oneContent')) or (contains(@class,'windowViewMode-maximized'))) and contains(@class,'active') and contains(@class,'lafPageHost')]//flexipage-component2[@data-component-id]";
    var flexiXpathResult = document.evaluate(flexiXpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    var flexiComponentNode=flexiXpathResult.iterateNext();
    var flexiNodes=[];
    while(flexiComponentNode){
    		flexiNodes.push(flexiComponentNode);
    		flexiComponentNode=flexiXpathResult.iterateNext();
    }
    var dataAuraRenderedBy = new Set();
    if(flexiNodes.length > 0){
        for(let i=0;i<flexiNodes.length;i++){
            let xpath = ".//*[@data-aura-rendered-by]";
            let xpathResultNode = document.evaluate(xpath, flexiNodes[i], null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
            let dataAuraNode=xpathResultNode.iterateNext();
            while (dataAuraNode) {
	            	let dataAuraBy = dataAuraNode.getAttribute('data-aura-rendered-by');
	            	if(dataAuraBy){
	            		dataAuraRenderedBy.add(dataAuraBy);
	            	}   
	            	dataAuraNode=xpathResultNode.iterateNext();
	        }
        }
    }
    let auraInfo2={};
    if(dataAuraRenderedBy.size > 0){
    	dataAuraRenderedBy.forEach(value => {
    		if(!auraInfo2[value]){
    				const  n1 = document.evaluate("//*[@data-aura-rendered-by='"+value+"']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    				if(n1){
    					let n2 = n1.parentNode.closest("[data-aura-rendered-by]");
    					let detachedAuraParentElemDataAuraBy = n2.getAttribute('data-aura-rendered-by');
    					const ai = extractAuraInfo(false,null,value,detachedAuraParentElemDataAuraBy);
    					if(ai) {
    						auraInfo2 = Object.assign(auraInfo2, ai);
    					}
    				}
				
			}
    	});
    }
    flexiNodes = [];
    dataAuraRenderedBy = new Set();
    auraInfo = Object.assign(auraInfo, auraInfo2);
    
    var nsResolver = function(prefix) {
        var ns = {
            'xhtml' : 'http://www.w3.org/1999/xhtml',
            'mathml': 'http://www.w3.org/1998/Math/MathML'
          };
        return ns[prefix] || prefix;
    };
    
    var ind = componentXPath.indexOf("//force:modal");
    var isForceModal = false;
    if (ind !== -1) {
        componentXPath = componentXPath.substr(13);
        isForceModal = true;
    }   else {
        ind = componentXPath.indexOf("//force:scopedActionModal");
        if (ind !== -1) {
           componentXPath = componentXPath.substr(25);
           isForceModal = true; 
        }
    }
    
    var tagIndex = componentXPath.indexOf("[");
    var tagName = componentXPath.substring(2,tagIndex);
    if (componentXPath.indexOf("@*[name()") === -1) {
        var attStartIndex = componentXPath.indexOf("@");
        var attEndIndex = componentXPath.indexOf("=");
        var att = componentXPath.substring(attStartIndex+1,attEndIndex);
        var attValue = componentXPath.substring(attEndIndex+1);
        att = cleanValue(att);
        attValue = cleanValue(attValue);
         if (isForceModal) {
            componentXPath = "//*[name() = 'force:modal' or name() = 'force:scopedActionModal']//*[name() = '"+ tagName +"'][@*[name() = '" + att + "'] =" + attValue;
         } else {
            componentXPath = "//*[name() = '"+ tagName +"'][@*[name() = '" + att + "'] =" + attValue;
         }
    } else {
         var attribute = componentXPath.substring(tagIndex);
         if (isForceModal) {
            componentXPath = "//*[name() = 'force:modal'  or name() = 'force:scopedActionModal']//*[name() = '"+ tagName +"']" + attribute;
         } else {
            componentXPath = "//*[name() = '"+ tagName +"']" + attribute;
         }
    }
    
    var searchBaseXpath="//auradom";
    var searchXpath=searchBaseXpath + componentXPath;
    var rowXpath =null;
    if(searchContext){

        var rowNode=searchContext;

        var auraRowId=rowNode.getAttribute('data-aura-rendered-by');
        var auraRowInfo=auraInfo.components[auraRowId];
        if(auraRowInfo) {
		    if (auraRowInfo.apId) {
		        auraRowInfo=auraInfo.components[auraRowInfo.apId];
		    }
		    var auraRowParent=auraInfo.components[auraRowInfo.pId];
		    //in aura iteration indexVar attribute is a mandatory field to indicate the row indexOf
		    var indexVar=auraRowParent.indexVar
		    if(auraRowParent.indexVar){
		        var indexVar=auraRowParent.indexVar
		        rowXpath="//auradom//*[name() = 'aura:html'][@*[name()='elemTagName'] = 'TABLE']//*[@*[name()='elemTagName'] = 'TR'][@*[name()='"+indexVar+"'] = '"+auraRowInfo[indexVar]+"']";
		        var rowXpathCount = document.querySelectorAll("auradom *[elemTagName='TABLE'] *[elemTagName='TR']["+indexVar+"='"+auraRowInfo._index+"']")
		        if (rowXpathCount.length > 1) {
		            rowXpath="//auradom//*[name() = 'aura:html'][@*[name()='elemTagName'] = 'TABLE']//*[@*[name()='elemTagName'] = 'TR'][@*[name()='"+indexVar+"'] = '"+auraRowInfo[indexVar]+"'][@*[name()='elemRbId'] ='"+auraRowInfo.elemRbId+"']";
		        }       
		    }
		}
    }
    
    if(rowXpath){
        searchBaseXpath=rowXpath;
        var ind = componentXPath.indexOf("//*[name() = 'force:modal']");
        if (ind !== -1) {
        	componentXPath = componentXPath.substr(27);
        }
        searchXpath="."+componentXPath;
    }
    
    
    
    
    var searchDom = document.evaluate(searchBaseXpath, window.document, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    
    var resultIt = document.evaluate(searchXpath, searchDom.singleNodeValue ? searchDom.singleNodeValue : window.document , nsResolver, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    
    
    var resultElem = resultIt.iterateNext();
    var results = [];
    if (resultElem && searchXpath.indexOf('aura:iteration') >= 0) {
        for(var i = 0; i < resultElem.children.length; i++) {
             var auraComponent = $A.getComponent(resultElem.children[i].getAttribute("id"));
             var htmlElem = auraComponent.getElement();
             results.push(htmlElem);
        }
        return results;
    }
    
    //this is for proceesing lightning:inputField element
    //on rendering on browser the lightning-input-field encapsulate different element type
    //so the below logic identifies the encapsulated element type
    if(resultElem && qualifier && qualifier.length === 2){
    		var inputFieldXpath=null;
        while (resultElem) {
        		var auraComponent = $A.getComponent(resultElem.getAttribute("id"));
            if (!auraComponent) {
            	resultElem = resultIt.iterateNext();
            		continue;
            }
    
            var htmlElem = auraComponent.getElement();
   
            if (!htmlElem) {
            		continue;
            }
            
            var firstChild = htmlElem.shadowRoot ? htmlElem.shadowRoot.firstChild : htmlElem.firstChild;
            
            if(htmlElem && firstChild && firstChild.tagName){
            		var htmlElemTagName=firstChild.tagName;
            		if(htmlElemTagName === "LIGHTNING-INPUT" || htmlElemTagName === "LIGHTNING-PICKLIST" || htmlElemTagName === "LIGHTNING-DATEPICKER" ||
            				((htmlElemTagName === 'DIV'  || htmlElemTagName === 'LABEL' || htmlElemTagName === 'SPAN') && firstChild.getAttribute('lightning-input_input') ==="")){
             		inputFieldXpath=".//input[@name="+qualifier[1] +"]";
             	}else if(htmlElemTagName === "LIGHTNING-TEXTAREA"){
             		inputFieldXpath=".//textarea[@name="+qualifier[1] +"]";
             	}
			var elemsIt3=null;
			if(htmlElemTagName !== "LIGHTNING-LOOKUP"){
				elemsIt3=document.evaluate(inputFieldXpath, htmlElem, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
				if(elemsIt3){
    
                    return elemsIt3;
                }
			}else if(htmlElemTagName === "LIGHTNING-LOOKUP"){
				const getLookupElement = () => document.evaluate(".//input[contains(@class,'slds-combobox__input')]", htmlElem, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
				var lookupAuraInfo=auraInfo.components[resultElem.getAttribute("id")];
				let qualifierText;
				if(lookupAuraInfo.expressionKey) {
					qualifierText=lookupAuraInfo[lookupAuraInfo.expressionKey];
					var idx=qualifierText.indexOf("}");
					qualifierText=qualifierText.substring(2,idx);
	           	    var qualifierPath=qualifierText.split(".");

                	for(let i=0;i<qualifierPath.length;i++){
                    	if(i==0){
                     	    qualifierText =lookupAuraInfo[qualifierPath[i]];
                     	}else{
                     	    qualifierText=qualifierText[qualifierPath[i]];
                    	 }
                   
               	    }
				}

                if(qualifier[1] === "'"+qualifierText+"'" || (lookupAuraInfo.fieldName &&  "'"+lookupAuraInfo.fieldName+"'" === qualifier[1])) {
                	const elemsIt3 = getLookupElement();
	               	if(elemsIt3){
	                	return elemsIt3;
	                }
                }              	
            }
         }
              
         resultElem = resultIt.iterateNext();
      }
           
           return null;
           
    }
    
    while (resultElem) {
        console.log("resolveAuraBy Match: ", resultElem);
        var auraComponent = $A.getComponent(resultElem.getAttribute("id"));
        if (!auraComponent) {
        	resultElem = resultIt.iterateNext();
            continue;
        }
        
        var htmlElem = auraComponent.getElement();
        if (!htmlElem) {
            continue;
        }
        
        var shadowHtmlElem = htmlElem.shadowRoot ? htmlElem.shadowRoot : htmlElem;

        if ((auraComponent.type === 'ui:inputText' || auraComponent.type === 'lightning:input'
            || auraComponent.type === 'ui:inputNumber' || auraComponent.type === 'ui:inputDate' 
                || auraComponent.type === 'ui:autocomplete' || auraComponent.type === 'ui:inputEmail'
                    || auraComponent.type === 'ui:inputPhone') && htmlElem.tagName !== 'INPUT') {
            if (resultElem.hasChildNodes()) {
                htmlElem = getFirstInputElement(resultElem);
            }
            if (auraComponent.type === 'lightning:input' && htmlElem.tagName !== 'INPUT') {
            	var ele = getFirstHtmlInputElement(shadowHtmlElem, nsResolver);
                if(!ele) {
                	ele = getFirstHtmlInputElement(htmlElem, nsResolver);
                }
                htmlElem =ele;
            }
        }

         if (auraComponent.type === 'lightning:inputField') {
            var childElem = htmlElem && firstChild;
            if (childElem) {
                if(childElem.tagName === 'LIGHTNING-INPUT' || childElem.tagName === 'LIGHTNING-PICKLIST' || childElem.tagName === 'LIGHTNING-DATEPICKER' ||
            				((childElem.tagName === 'DIV'  || childElem.tagName === 'LABEL') && firstChild.getAttribute('lightning-input_input') ==='')){
             		htmlElem = getFirstHtmlInputElement(shadowHtmlElem, nsResolver);
             	}else if(childElem.tagName === "LIGHTNING-TEXTAREA"){
             		htmlElem = getFirstHtmlTextAreaElement(shadowHtmlElem);
             	}
            }
        }

        if (auraComponent.type === 'lightning:combobox' && htmlElem.tagName !== 'INPUT') {
            htmlElem = getFirstHtmlInputElement(shadowHtmlElem, nsResolver);
        }
        
        if (auraComponent.type === 'force:textEnumLookup' && htmlElem.tagName !== 'INPUT') {
            htmlElem = getFirstHtmlInputElement(htmlElem, nsResolver);
        }
        
        if(auraComponent.type === 'force:inputPicklist' && htmlElem.tagName !== 'A') {
            htmlElem = getFirstAnchorElement(resultElem);
        }
        
        if (auraComponent.type === 'lightning:buttonMenu' && htmlElem.tagName !== 'BUTTON') {
            if (resultElem.hasChildNodes()) {
                htmlElem = getFirstButtonElement(resultElem);
            }
        }
        
        if (auraComponent.type === 'aura:expression') {
             auraComponent = $A.getComponent(resultElem.parentElement.getAttribute("id"));
             htmlElem = auraComponent.getElement();
        }
        
        if (auraComponent.type === 'lightning:select' && htmlElem.tagName !== 'SELECT') {
            if (resultElem.hasChildNodes()) {
                htmlElem = getFirstSelectElement(resultElem);
            }
        }
        
        if ((auraComponent.type === 'lightning:menuItem' || auraComponent.type === 'force:inputPicklist') && htmlElem.tagName !== 'A') {
            if (resultElem.hasChildNodes()) {
                htmlElem = getFirstAnchorElement(resultElem);
            }
        }
        
        if ((auraComponent.type === 'lightning:inputRichText')) {
        	if (resultElem.hasChildNodes()) {
        		htmlElem = getRichTextEditableElement(resultElem, nsResolver);
        	}
        }
        
        if ((auraComponent.type === 'lightning:textarea')) {
        	htmlElem = getFirstHtmlTextAreaElement(shadowHtmlElem);
        }
        
        if (htmlElem) {
        	results.push(htmlElem);
        }
        
        /*if (!multiple) {
            return htmlElem;
        }*/
        
        resultElem = resultIt.iterateNext();
    }
    
    auraInfo = null;
    if (results.length === 1) {
    	return results.pop();
    }
    return results;
}

function getFirstHtmlInputElement(htmlElem, nsResolver) { 
    
	var elem = htmlElem.querySelector("input[lightning-input_input].slds-input, input[lightning-input_input][type=checkbox],input.slds-input.slds-combobox__input");
    if(!elem) {
        try {
            elem = document.evaluate(".//input[contains(@class, slds-input)]", htmlElem, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        } catch(e) {
        	//shadow dom throws exception
        }
    }
    return elem;
}

function getFirstHtmlTextAreaElement(htmlElem) { 
    
	var elem = htmlElem.querySelector("textarea[lightning-textarea_textarea].slds-textarea");
    return elem;
}

function getFirstInputElement(resultElem) { 
    
    var elem = resultElem.querySelector("[elemTagName='INPUT']");
    var htmlElem = $A.getComponent(elem.getAttribute("id")).getElement();
    
    if (htmlElem.tagName === 'INPUT') {
        return htmlElem;
    } 
    else if (elem.getAttribute("elemRbId")){
        return $A.getComponent(elem.getAttribute("elemRbId")).getElement();
    }
}

function getFirstButtonElement(resultElem) { 
    
    var elem = resultElem.querySelector("[elemTagName='BUTTON']");
    return  $A.getComponent(elem.getAttribute("id")).getElement();
}

function getFirstSelectElement(resultElem) { 
    
    var elem = resultElem.querySelector("[elemTagName='SELECT']");
    return  $A.getComponent(elem.getAttribute("id")).getElement();
}

function getFirstAnchorElement(resultElem) { 
    
    var elem = resultElem.querySelector("[elemTagName='A']");
    return  $A.getComponent(elem.getAttribute("id")).getElement();
}

function getRichTextEditableElement(resultElem, nsResolver) {
	var elem = document.evaluate(".//*[name()='aura:html' and @*[name()='aura:id']='editor']",resultElem,nsResolver,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
	var htmlElem = elem ? $A.getComponent(elem.getAttribute("id")).getElement() : null;	
	return htmlElem ? getFirstContentEditableElement(htmlElem) : null; 
}

function getFirstContentEditableElement(htmlElem) {
	
		if (htmlElem.contentEditable === "true") {
			return htmlElem;
		}
		
		for (var i = 0 ;htmlElem.children && htmlElem.children.length; i++) {
			var elem = getFirstContentEditableElement(htmlElem.children[i]);
			if (elem){
				return elem;
			}
		}
	return null;
}

function extractAuraInfo(asXml, xpath,vfLightningId,parentElemAuraId) {
    
    if(typeof $A === 'undefined'){
        return null;
    }
    var timings = {};
    var startUtc = new Date().getTime();

    var debugMode = $A.$clientService$ !== undefined;
    var saveAllowAccess; 
    if (debugMode) {
      // We're in Debug mode:
      // - replace the allowAccess method with one that always returns true.
      var saveAllowAccess = $A.$clientService$.$allowAccess$;
      $A.$clientService$.$allowAccess$ = function() {
        return true;  
      };
    }
    else {
        // We're in Prod mode:
        // - we can't replace the allowAccess function because of closures
        // - disable access checking and logging to speed up "non-work around" accesses 
        // - we use a special logic in appendAttributeInfo() to speed things up further
        //$A.getContext().Oa = false;  // $A.getContext().$enableAccessChecks$ = false;
        //$A.getContext().Wk = false; // $A.getContext().$logAccessFailures$ = false;
    }

    var parentIdVariable=retriveParentIdVariable(debugMode);
    var auraDom, auraElem, expressionsElem, valueProvidersElem;
    if (asXml) {
        auraDom = document.createDocumentFragment();
        auraElem = document.createElement("auraDom");
        auraElem.setAttribute("style", "display: none");
//         auraElem.setAttribute("xmlns:force", "http://forcedotcom");
        auraDom.appendChild(auraElem);
        expressionsElem = document.createElement("expressions");
        auraElem.appendChild(expressionsElem);
        valueProvidersElem = document.createElement("valueProviders");
        auraElem.appendChild(valueProvidersElem);

        var auraElement=document.getElementsByTagName("auradom");
        
        if(auraElement[0]){
            auraElement[0].parentNode.removeChild(auraElement[0]);
        }
        document.documentElement.appendChild(auraDom);
    }
    var valueProviderValuesProperty = discoverValueProviderValuesProperty();
    var result = {
        rootComponentId: null,
        components: {},
        auraDom: auraElem
    };
    if(vfLightningId && parentElemAuraId && asXml === false){
        var nsResolver = function(prefix) {
            var ns = {
                'xhtml' : 'http://www.w3.org/1999/xhtml',
                'mathml': 'http://www.w3.org/1998/Math/MathML'
              };
            return ns[prefix] || prefix;
        };
        var searchRecordHomeFlexiDom = document.evaluate("//auraDom//one:recordHomeFlexipage2",document, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if(searchRecordHomeFlexiDom){
             auraElem = searchRecordHomeFlexiDom;   
             valueProvidersElem = document.evaluate("//auraDom/valueProviders", document, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
             expressionsElem = document.evaluate("//auraDom/expressions", document, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }
        var auraParentNode = document.evaluate("//*[@data-aura-rendered-by = '" + parentElemAuraId + "']", document, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
       
        if(auraParentNode){
            var auraParentNodeTagName = auraParentNode.tagName;
            var auraDomElemXpath = "//auraDom//*[@elemTagName = '" + auraParentNodeTagName +"' and @elemRbId='" + parentElemAuraId + "']";
            var auraDomElem = document.evaluate(auraDomElemXpath, document, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if(auraDomElem){
                auraElem  = auraDomElem;
            }
        }

    }
    var root=null;
    // NOTE: it is important that the processing below does not throw uncaught exceptions:
    //     - otherwise the caller will never get their callback and the getDomInfo process will stall.
    
    try {
        
        //root=$A.getRoot();
        //$A.getCallback(function() {
            //if (root.isValid()) {
                //root.set("v.visible", true);
                var rootComponent=null;
                if(vfLightningId && vfLightningId !== 'null'){
                    rootComponent=$A.getComponent(vfLightningId);
                }else{
                    //rootComponent=$A.getRoot();
                    rootComponent=getContextRootComponent($A.getRoot());
                    if(!rootComponent){
                    		rootComponent=$A.getRoot();
                    }
                }
                var rootComponent = getComponentInfo(rootComponent, result.components, auraElem, expressionsElem, valueProvidersElem);
                result.rootComponentId = rootComponent.id;
                delete rootComponent.id;
                rootComponent = null;
    }
    catch (e) {
        result.exception = e.toString();
    }

    // Reinstate the original allowAccess function if we replaced it.
    if (saveAllowAccess) {
        $A.$clientService$.$allowAccess$ = saveAllowAccess;
    }


    timings["total"] = new Date().getTime() - startUtc;
    console.log("Timings: ", timings);
    
    if (xpath) {
        var nsResolver = function(prefix) {
            return prefix;
        };
        
        var labelsIt = document.evaluate(xpath, auraElem, nsResolver, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
        var labelElem = labelsIt.iterateNext();
        while (labelElem) {
            
            labelElem = labelsIt.iterateNext();
        }
    }
    
    return result;
       //return JSON.stringify(result);

       // Discover the name of the property on the ValueProvider that contains the name/value map:
    // - we know that the Root element has a 'Browser_S1Features_isEncryptedStorageEnabled' property
    // - so we search the ValueProvider for the parent property that contains this.
    function discoverValueProviderValuesProperty() {
        
        var rootValueProvider = (typeof $A.getRoot === 'function') && $A.getRoot() ? $A.getRoot().get('v') : null;
       
        if(rootValueProvider){
             for (var valueProviderProperty in rootValueProvider) {
                var valueProviderPropertyValue = rootValueProvider[valueProviderProperty];
                var attr=null;
                if(vfLightningId){
                    attr="body";
                }else{
                    attr="Browser_S1Features_isEncryptedStorageEnabled";
                }
                if (valueProviderPropertyValue[attr]) {
                    return valueProviderProperty;
                }
                //work around for root components not having 'Browser_S1Features_isEncryptedStorageEnabled'
                //normally in root component the value provider is the only component having 'body' attribute
                if(!valueProviderPropertyValue[attr] && valueProviderPropertyValue['body']) {
                	return valueProviderProperty;
                }
            }
        }
       
        rootValueProvider = null;
        return null;
    }

    function isPopulated(value) {
        if (!value) {
            return false;
        }

        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                if (value[i]) {
                    return true;
                }
            }
            return false;
        }

        return true;
    }

    function appendAttributeInfo(auraInfo, auraElem, component, attributeName, asChildren, resultMap, expressionsElem, valueProvidersElem) {

        var componentValue = getAttributeValue(component, attributeName);
        
        if (componentValue) {
            if (asChildren) {
                if (Array.isArray(componentValue)) {
                    var attrElem = document.createElement(attributeName);
                    auraInfo.appendChild(attrElem);
                    for (var i = 0, iLen = componentValue.length; i < iLen; i++) {
                        var child = componentValue[i];
                        getComponentInfo(child, resultMap, attrElem, expressionsElem, valueProvidersElem,null);
                    }
                }
            }else if(attributeName === 'referenceElement'){
                //this 'id' refers to related list quicklink in flexipage layout
                var id=componentValue.getAttribute('id');
                if(id){
                    setAuraInfoAttribute(auraInfo, auraElem, 'referenceElementId', id);
                }
                
                if(componentValue && componentValue.attributes && componentValue.attributes['data-proxy-id']){
                    let dataProxyId = componentValue.attributes['data-proxy-id'].value;
                    if(dataProxyId){
                        setAuraInfoAttribute(auraInfo, auraElem, 'dataProxyId', dataProxyId);
                    }
               }
            }else if (attributeName === 'id' && auraInfo.descr === 'ui:actionMenuItem'){
                setAuraInfoAttribute(auraInfo, auraElem, "actionId", componentValue);
                setAuraInfoAttribute(auraInfo, auraElem, attributeName, componentValue);
            }else {
                setAuraInfoAttribute(auraInfo, auraElem, attributeName, componentValue);
                //fetching the name of the list items 
                  if(attributeName === 'items' && auraInfo.descr === 'aura:iteration'){
                       var componentAttrValue=getRawAttributeValue(component,attributeName);
                        if(typeof componentAttrValue.getExpression === 'function'){
                            
                            setAuraInfoAttribute(auraInfo, auraElem, "iterationListName", componentAttrValue.getExpression());
                            
                        }
                        
                    }
            }
            
        }
        
        if(attributeName === 'active' && componentValue === false){
            setAuraInfoAttribute(auraInfo, auraElem, attributeName, componentValue);
        }
        componentValue = null;
        componentAttrValue = null;
    }

    

      function getAttributeValue(component, attributeName) {

        try {
            var componentValue;
            var componentValueFetched = false;
            var attributeSupported = true;
            if (!debugMode && valueProviderValuesProperty) {
                
                // The component.get('v.attributeName') is taking a long time since Spring 17 due to internal access checks.
                // As a work around, this processing recreates the processing the the .get() function.  
                // You can see the implementation in the Aura code by:
                // - Enabling Lightning debug mode (Settings/Lightning Components/Enable Debug Mode)
                // - Executing this from the Dev Tools command prompt: $A.getRoot().get('v').get
                
                //some components are not supposed to have the attributes; In that cases aura throws exception
                var valueProvider = null;
                try {
                    valueProvider = component.get('v');
                }
                catch (e) {
                    attributeSupported = false;
                }
                componentValue = valueProvider ? valueProvider[valueProviderValuesProperty][attributeName] : null;
                componentValueFetched = !isExpressionValue(componentValue);

                /*if (isExpressionValue(componentValue) != aura.util.J(componentValue)){
                    console.log("False positive for isExpressionValue.  attributeName: " + attributeName + ", componentValue: " + componentValue);
                }
                if (valueProvider && valueProvider.qg && valueProvider.qg[attributeName]) {
                      console.log("Component value has decorator.  attributeName: " + attributeName + ", componentValue: " + componentValue);
                }*/
                
                // NOTE: we have removed the $decorators$ check because:
                // - it introduces an internal value dependency.
                // - and we can't find values with them
                //if (valueProvider && valueProvider.get && !valueProvider.qg[attributeName]) { // pg=$decorators$
                //    componentValue = valueProvider.n[attributeName]; // n=$values$
                //    componentValueFetched = !aura.util.J(componentValue); // J=isExpression()
                //}
                
                // NOTE: We don't do any Shadow value processing:
                  // if(this.$shadowValues$.hasOwnProperty(key)) {
                  //   value += this.$getShadowValue$(key)
                  // }
                
            }
            if (attributeSupported && !componentValueFetched) {
              componentValue = component.get('v.' + attributeName);
            }            
        }
        catch (ex) {
            componentValue = "ERROR: " + ex.message;
            componentValue = ex.message;
        }
        valueProvider = null;
        return componentValue;
    }

    function setAuraInfoAttribute (auraInfo, auraElem, attrName, attrValue) {
        const excludedAttrNames = ["items", "subscription", "cat", "cell"];
        if (typeof attrValue === 'undefined') {
            return;
        }
        if(typeof attrValue === "string" && cleanValue(attrValue) === ""){
            return;
        }
        if (excludedAttrNames.includes(attrName)) {
                    return;         
        }
        if(!(typeof attrValue === 'function')){
            //if(typeof attrValue !== 'object'){
            if(!$A.util.isComponent(attrValue) && !$A.util.isAction(attrValue)){
                auraInfo[attrName] = attrValue;
                if (auraElem) {
	                	if(typeof attrValue !== 'object'){
	                		if(attrName.indexOf(':') > 0){
	                            var colonPos = attrName.indexOf(':');
	                            var ns = colonPos > 0 ? attrName.substring(0, colonPos) : null;
	                            auraElem.setAttributeNS(ns, attrName, attrValue);
	                     }else{
	                            auraElem.setAttribute(attrName, attrValue);
	                     }
	                	}         
                } 
            }
           
        }
        
    }
    
    function isExpressionValue(componentValue) {
        return componentValue && (typeof componentValue.evaluate === 'function') ? true : false;
    }

    function getComponentInfo(component, resultMap, parentAuraDomElem, expressionsElem, valueProvidersElem, globalId) {

        // NOTE: we need to keep the field names as short as possible in the resulting auraInfo to
        //       reduce JSON stringify and decode overhead.
        
        if (!component || !(typeof component.getGlobalId === 'function')) {
            return null;
        }
        
        var globalId = globalId ? globalId : component.getGlobalId();
        
        if(component.isConcrete() === false){
            var ccId=component.getConcreteComponent().getGlobalId();
            var ccInfo=resultMap[ccId];
            if(typeof ccInfo !== 'undefined'){
                resultMap[globalId] = ccInfo;
                return null;
            }
        }
        
        var auraInfo = resultMap[globalId];
        if (auraInfo) {
            if(!auraInfo.id){
                auraInfo.id=globalId;
            }
            return auraInfo;
        }

        var descr;
        var componentDef = component.getDef();
        if (componentDef) {
            var componentDescr = componentDef.getDescriptor();
            if (componentDescr) {
                descr = componentDescr.toString();
                if (descr.indexOf("markup://") === 0) {
                    descr = descr.substring(9);
                }
                if(descr.indexOf('layout:') >= 0){
                    descr="layoutRL";
                }
            }
        }
        componentDef = null;
        var auraInfo = {
                id: globalId,
                descr: descr,
            };
        resultMap[globalId] = auraInfo;
        var auraElem;
        if (parentAuraDomElem) {
            var colonPos = descr.indexOf(':');
            var ns = colonPos > 0 ? descr.substring(0, colonPos) : null;
            auraElem = document.createElementNS(ns, descr);
            auraElem.setAttribute("id", globalId);
            parentAuraDomElem.appendChild(auraElem);
            //auraElem: auraElem
        }

        if (typeof component.getElement === 'function') {
            var elem = component.getElement();
            if (elem) {
                setAuraInfoAttribute(auraInfo, auraElem, "elemTagName", elem.tagName);
                if (typeof elem.getAttribute === 'function') {
                    setAuraInfoAttribute(auraInfo, auraElem, "elemRbId", elem.getAttribute("data-aura-rendered-by"));
                }
            }
        }
        var auraId=component.getLocalId();
        if(auraId){
            setAuraInfoAttribute(auraInfo, auraElem, "aura:id", auraId);
        }
        /*var press=component.getEvent('press');
        if(press && component.Xe.Ud.press.bubble){
            setAuraInfoAttribute(auraInfo, auraElem, "press", component.Xe.Ud.press.bubble[0].actionExpression);
        }*/

        //getEventDispatcher() is not applicable to interopClass in summer 17
        if((typeof component.getEventDispatcher === 'function') && typeof component.interopClass === 'undefined'){
             var events=component.getEventDispatcher();
             if (events){
                var pressEvent=events['press'];
             }
            if(pressEvent){
                
                if(pressEvent.bubble && Array.isArray(pressEvent.bubble)){
                    
                    var press=pressEvent.bubble;
                    for(var i=0;i<press.length;i++){
                        if(press[i].hasOwnProperty("actionExpression")){
                            if(typeof press[i].actionExpression === 'object'){
                                setAuraInfoAttribute(auraInfo, auraElem, "press", press[i].actionExpression.path);
                            }else{
                                setAuraInfoAttribute(auraInfo, auraElem, "press", press[i].actionExpression);
                            }
                            
                            break;
                        }
                    }
                }
            }
            events = null;
            pressEvent = null;
            press = null;
        }
        try{
	        	//Retrieve flexi component name 'summer19'
	    	    var componentValueProvider=component && component.getComponentValueProvider instanceof Function ? component.getComponentValueProvider() : null;
	    	    if(componentValueProvider && componentValueProvider.type){
	    	        setAuraInfoAttribute(auraInfo, auraElem, "sfComponentName", componentValueProvider.type);
	    	    }
        }catch(e){
        	
        }
        

            if(component.attributes){
                       
                for (var key in component.attributes) {
                    if(component.attributes[key] && (typeof component.attributes[key].getExpression === 'function')){
                        if(key !== "value"){
                            setAuraInfoAttribute(auraInfo, auraElem, "auraExpression", true);
                            setAuraInfoAttribute(auraInfo, auraElem, "expressionKey", key);
                        }
                        setAuraInfoAttribute(auraInfo, auraElem, key, component.attributes[key].toString());
                    }else if(key === "type" || key === "name" || key === "fieldName"){
                    
                    //This attribute gives the control type.
                    //eg. lightning-input control can have different field types like date,text,email etc.
                          setAuraInfoAttribute(auraInfo, auraElem, key, component.attributes[key]);
                    }
     
                }
            }
      
        // Get the component's value, catering for arrays and nested components.
        var componentValue = getRawAttributeValue(component, "value");
        if (componentValue && (typeof componentValue.getExpression === 'function')) {
            setAuraInfoAttribute(auraInfo, auraElem, "value", "{!" + componentValue.getExpression() + "}");
        }
        else {
            var componentValue = getAttributeValue(component, "value");
            if (Array.isArray(componentValue)) {
                for (var i = 0, iLen = componentValue.length; i < iLen; i++) {
                    var childValue = componentValue[i];
                    if ($A.util.isComponent(childValue)) {
                        getComponentInfo(childValue, resultMap, auraElem, expressionsElem, valueProvidersElem,null);

                        var parentId = childValue[parentIdVariable];
                        if (parentId !== globalId) {
                            var parentAuraInfo = resultMap[parentId];
                            if (parentAuraInfo) {
                                getComponentInfo(childValue, resultMap, parentAuraDomElem ? parentAuraInfo.auraElem : null, expressionsElem, valueProvidersElem,null);
                            }
                        }
                    }
                }
            }
            else if ($A.util.isComponent(componentValue)) {
                getComponentInfo(componentValue, resultMap, auraElem, expressionsElem, valueProvidersElem,null);
            }
            else if (isPopulated(componentValue)) {
                //This is commented out as we cater for 'value' attribute which is of expression ONLY
                //setAuraInfoAttribute(auraInfo, auraElem, "value", componentValue);
            }
        }
        componentValue = null;
        // Extract the component's attribute values:
        // NOTE: Looping through them all is quicker than checking for individual attribute names.
        /*var attMap = component.eb && component.eb.n ? component.eb && component.eb.n
            : component.ab.n;*/
        var attributeSet=null;
        try{
            attributeSet=component.get('v');
        } catch(e){}//some components are not supposed to have the attributes; In that cases aura throws exception
        
        var attMap = attributeSet && valueProviderValuesProperty ? attributeSet[valueProviderValuesProperty] : null;
        attributeSet = null;
        if (attMap) {
            for (var attName in attMap) {
                //referenceElement is node element, but this is required in scenario where hovel panel appears
                //this property has the id to the element it hovers
                if(attName === 'referenceElement'){
                    appendAttributeInfo(auraInfo, auraElem, component, attName,null,null,null,null);
                }
                if ("HTMLAttributes" === attName
                        //|| attMap[attName] instanceof Array
                        || checkComponentInfo(attMap,attName) //need component info for flexipage mapping in winter 18
                        || attMap[attName] instanceof Node
                        || $A.util.isComponent(attMap[attName])
                        || "body" === attName
                        || "value" === attName
                        || "loggingContext" === attName
                        || "wrappedActions" === attName
                        || "apiNamesToKeyPrefixes" === attName
                        || 'resizableColumnsConfig' === attName
                        || 'privateQuillInstance' === attName
                        || 'api' === attName
                        || 'selectableOptions' === attName
                        || '_state' === attName
                        || 'onclick' === attName
                        || 'targetRecordDeprecated' === attName
                        || 'dedupeConfig' === attName
                        || 'navService' === attName
                        || 'onresize' === attName
                        || 'supportedEntities' === attName
                        || 'appMetadata' === attName
                        || '_pluginCache' === attName
                        || 'focusTrigger' === attName
                        || 'picklistRefs' === attName
                        || 'onsortchange' === attName
                        || 'onselect' === attName
                        || 'onsortchange' === attName
                        || 'selectionModel' === attName
                        || 'infiniteLoadingDataProvider' === attName
                        || '_cache' === attName
                        || 'config' === attName
                        || 'service' === attName
                        || 'navigationServiceDelegate' === attName
                        || 'workspaceMap' === attName
                        || 'displayCreatedPromise' === attName
                        || 'metadata' === attName
                        || 'tabMap' === attName
                        || '_record' === attName
//                        || 'context' === attName
                        || 'pageRefTx' === attName
                        || 'map' === attName
                        || 'vehicleMarker' === attName
                        || 'priv_scopedResponsesMap' === attName
                        || 'priv_xhrResponse' === attName
                        || 'priv_searchResultsContextMapPerEntity' === attName
                        || 'scopeSets' === attName
                        || 'priv_lastSearch' === attName
                        // || 'pageReference' === attName   // used in FSL dispatcher
                        || 'previousConsoleState' === attName
                        || 'selectedLeftContent' === attName
                        || 'workspaceInfoMap' === attName
                        || 'templates' === attName
                        || 'editLayouts' === attName
                        || 'shortcutList' === attName
                        || 'pageTx' === attName
                        ) {
                    
                    continue;
                }
                appendAttributeInfo(auraInfo, auraElem, component, attName,null,null,null,null);
            }
        }
        attMap = null;
      //if the workspace is not active, the aura info can be ignored for the current page
        if(auraInfo.descr === 'one:workspace' && !auraInfo.active){
            return;
        }

        if(auraInfo.descr === 'one:consoleTabContainer'){

            return;
        }
        // Recurse into the attributeValueProvider:
        // NOTE: The attribute providers globalId is not the same as its getGlobalId:
        // - The actual globalId is returned by the $globalId$ (debugMode) or A properties
        // - don't fully understand this.
        var attributeValueProvider = component.getAttributeValueProvider ? component.getAttributeValueProvider() : null;
        if (attributeValueProvider && (typeof attributeValueProvider.getGlobalId === 'function') && attributeValueProvider.getGlobalId() !== globalId) {
            var attributeProviderId = attributeValueProvider.getConcreteComponent().getGlobalId();
            setAuraInfoAttribute(auraInfo, auraElem, "apId", attributeProviderId);
            var attributeValueProviderInfo = getComponentInfo(attributeValueProvider, resultMap, parentAuraDomElem ? valueProvidersElem : null, expressionsElem, valueProvidersElem, attributeProviderId);
            attributeValueProviderInfo =null;
        }
        
         if (attributeValueProvider && attributeValueProvider.type && attributeValueProvider.type === 'ui:menuTriggerLink'
                && attributeValueProvider.getAttributeValueProvider()
                && attributeValueProvider.getAttributeValueProvider().getConcreteComponent()) {
                var attrValueId = attributeValueProvider.getAttributeValueProvider().getConcreteComponent().getGlobalId();
                getComponentInfo(attributeValueProvider, resultMap, auraElem, expressionsElem, valueProvidersElem, attrValueId);
         }
            
         if(attributeValueProvider && (typeof attributeValueProvider.getPrimaryProviderKeys === 'function')){
             
                var values = {};
                 var value;
                 var keys;
                 var provider = attributeValueProvider;
                 while(provider && !("_$getSelfGlobalId$" in provider) && (typeof provider.getPrimaryProviderKeys === 'function')) {
                     keys = provider.getPrimaryProviderKeys();
                     for(var c = 0; c<keys.length;c++) {
                         let key = keys[c];
                         if(!values.hasOwnProperty(key)) {
                             value = provider.get(key);
 
                             if($A.util.isComponent(value)) {
                                /* values[key] = {
                                     "id": value
                                 };*/
                             } else {
                                 if(key !== 'wrappedAction'){
                                     //values[key] = value;
                                     if(!auraInfo[key]){
                                          /*if(value instanceof Object){
                                             for(let k in value){
                                                 if(value.hasOwnProperty(k)){
                                                   
                                                    if(!auraInfo[key+"."+k]){
                                                          if(k !== "fieldInfo" && k !== "layoutItems" && k !== "layoutColumns"){
                                                               setAuraInfoAttribute(auraInfo, auraElem, key+"."+k, value[k]);    
                                                          }
                                                               
                                                    }
                                                   
                                                 }
                                                 
                                             }
                                         }else{
                                             setAuraInfoAttribute(auraInfo, auraElem, key, value);
                                         }*/
                                         setAuraInfoAttribute(auraInfo, auraElem, key, value);
                                                 
                                     }
                                 }
                                 
                             }
                         }
                     }
                     provider = provider.getComponent();
                 }
                 if(provider && "_$getSelfGlobalId$" in provider) {
                     //output["globalId"] = provider._$getSelfGlobalId$();
                 }
                 //output["values"] = values;
                 provider = null;
                 
                  
         }
         attributeValueProvider = null;
          //when a component type is an expression, we need to retrieve child component from v.value
          if(component.type && component.type === 'aura:expression'){
             var componentValue =component.get('v.value');
              if (componentValue && Array.isArray(componentValue)) {
                for (var i = 0, iLen = componentValue.length; i < iLen; i++) {
                    var childValue = componentValue[i];
                    if ($A.util.isComponent(childValue)) {
             
                           var childInfo = getComponentInfo(childValue, resultMap, auraElem, expressionsElem, valueProvidersElem,null);
                            if (childInfo ) {
                           
                                if (!childInfo.pId) {
                                        childInfo.pId = globalId;
                                }
                                if(childInfo.id && typeof childInfo.id === 'string' && childInfo.id.indexOf(':')> 0) {
                                    if (!auraInfo.cIds) {
                                        auraInfo.cIds = "" + childInfo.id;
                                    }
                                    else {
                                        auraInfo.cIds += "," + childInfo.id;
                                    }
                                    delete childInfo.id;
                                }
                            }
                            childInfo = null;
                    }
                    childValue = null;
                }
            }else{
                if ($A.util.isComponent(componentValue)) {
                    let bodyValue = getRawAttributeValue(componentValue, "body");
                    if (bodyValue) {
                        auraInfo.cIds = null;
                        for (let bodyKey in bodyValue) {
                            let bodyArray = bodyValue[bodyKey];
                            if(Array.isArray(bodyArray)){
                                for (let i = 0, iLen = bodyArray.length; i < iLen; i++) {
                                    let child = bodyArray[i];
                                    let childInfo = getComponentInfo(child, resultMap, auraElem, expressionsElem, valueProvidersElem);
                                    if (childInfo ) {
                                   
                                        if (!childInfo.pId) {
                                                childInfo.pId = globalId;
                                        }
                                        if(childInfo.id && typeof childInfo.id === 'string'  && childInfo.id.indexOf(':')> 0) {
                                            if (!auraInfo.cIds) {
                                                auraInfo.cIds = "" + childInfo.id;
                                            }
                                            else {
                                                auraInfo.cIds += "," + childInfo.id;
                                            }
                                            delete childInfo.id;
                                        }
                                    }
                                    childInfo = null;
                                }
                            }
                            bodyArray = null;
                        }
                        if (!auraInfo.cIds) {
                            delete auraInfo.cIds;
                        }
                    }
                    bodyValue = null;
                }
            }
         }
 
        // Recurse into the concreteComponent if different:
       /* var concreteComponent = component.getConcreteComponent ? component.getConcreteComponent() : null;
        if (concreteComponent && concreteComponent.getGlobalId instanceof Function && concreteComponent.getGlobalId() !== globalId) {
            setAuraInfoAttribute(auraInfo, auraElem, "ccId", concreteComponent.getGlobalId());
            var concreteComponentInfo = getComponentInfo(concreteComponent, resultMap, parentAuraDomElem ? valueProvidersElem : null, expressionsElem, valueProvidersElem);
        }*/
        
        if(checkValidComponent(component)){
            var bodyValue = getRawAttributeValue(component, "body");
            if (bodyValue) {
                auraInfo.cIds = null;
                for (var bodyKey in bodyValue) {
                    var bodyArray = bodyValue[bodyKey];
                    if(Array.isArray(bodyArray)){
                        for (var i = 0, iLen = bodyArray.length; i < iLen; i++) {
                            var child = bodyArray[i];
                            var childInfo = getComponentInfo(child, resultMap, auraElem, expressionsElem, valueProvidersElem,null);
                            if (childInfo ) {
                           
                                if (!childInfo.pId) {
                                        childInfo.pId = globalId;
                                }
                                if(childInfo.id && typeof childInfo.id === 'string'  && childInfo.id.indexOf(':')> 0) {
                                    if (!auraInfo.cIds) {
                                        auraInfo.cIds = "" + childInfo.id;
                                    }
                                    else {
                                        auraInfo.cIds += "," + childInfo.id;
                                    }
                                    delete childInfo.id;
                                }
                            }
                            childInfo = null;
                        }
                    }
                
                }
                if (!auraInfo.cIds) {
                    delete auraInfo.cIds;
                }
                bodyValue = null;
            }
            else {
                 if (componentValue && (typeof componentValue.getExpression === 'function')){
                    var expression=componentValue.getExpression();
                    var valueProvider=component.getAttributeValueProvider();
                    
                     var componentFacet=null;
                    try{
                        componentFacet=valueProvider.get(expression);
                    
                    }catch(e){
                        componentFacet=null;
                    }
                    valueProvider = null;
                    //var componentFacet=componentValue && componentValue.lf ? componentValue.lf :componentValue;
                    if(componentFacet && isExpression(auraInfo) && isFacets(componentFacet)) {
                        auraInfo.cIds = null;
                        var facets = Array.isArray(componentFacet) ? componentFacet : [componentFacet];
                        for (var i = 0, iLen = facets.length; i < iLen; i++) {
                            var child = facets[i];
                            if (isComponentId(child)) {
                                child = $A.getComponent(facets[i]);
                            }
                            if (!child) {
                                continue;
                            }
                            var childInfo = getComponentInfo(child, resultMap, auraElem, expressionsElem, valueProvidersElem,null);
                            if (childInfo ) {
                     
                                if (!childInfo.pId) {
                                 
                                        childInfo.pId = globalId;
                                    
                                    
                                }
                                if (!auraInfo.cIds) {
                                    auraInfo.cIds = "" + childInfo.id;
                                }
                                else {
                                    auraInfo.cIds += "," + childInfo.id;
                                }
                                delete childInfo.id;
                            }
                            childInfo = null;
                        }
                        if (!auraInfo.cIds) {
                            delete auraInfo.cIds;
                        }
                    }
                }
                    
                
                
            }
            componentValue = null;
        }
        

        return auraInfo;
    }

    function getRawAttributeValue(component, attributeName) {
        if (component._$getRawValue$ && (typeof component.interopClass === 'undefined')){
            return component._$getRawValue$(attributeName);
        }
        else {
            /*if(component.ab){
                return component.ab.n[attributeName];
            }else if(component.eb){
                return component.eb.n[attributeName];
            }else{
                var attSet = component.$getValueProvider$('v');
                 if (attSet && attSet.$values$) {
                     return attSet.$values$[attributeName];
                 }              
                 return null;
            }*/
              try {
               var attributeSet=component.get('v');
                   return attributeSet && valueProviderValuesProperty ? attributeSet[valueProviderValuesProperty][attributeName]:null;
               }
                catch(e) {//some components are not supposed to have the attributes; In that cases aura throws exception
                    return null;
                }
        }
     }

     function isComponentId(testId) {
         return typeof testId === "string" && testId.startsWith("\u263A");
     }

     function isComponent(testComponent) {
         return testComponent && (typeof testComponent.getGlobalId === 'function');
     }

     function isExpression(auraInfo) {
         return auraInfo.descr === "aura:expression";
     }
    
     function isFacets(value) {
         if(!Array.isArray(value)) { 
            return isComponent(value);
         }
         for(var c=0;c<value.length;c++) {
            if(!isComponent(value[c]) && !isComponentId(value[c])) { 
                return false; 
            }
         }
         return true;
    }  

    function checkValidComponent(component){

        // Chuba: Disabling because it is quicker without this check - sorry :(
//        return true;
        
        var element=component.getElement();
        var className=null;
        if(element){
            className=element.className;
            if(typeof className === 'object') {
                return false;
            }
        }
        var result=true;
        if(className && (className.indexOf('oneContent') >= 0 
            || (className.indexOf('tabs__content') >= 0 && className.indexOf('uiTab') >= 0 )
            || (className.indexOf('tabs__item') >=0)
            )){
            if(className.indexOf('active') >=0){
                result=true;
            }else{
                result=false;
            }
        }

        /*if(className && className.indexOf('riseTransitionEnabled') >= 0){
            if(className.indexOf('hideEl') >=0){
                result=true;
            }else{
                result=false;
            }
        }*/
        if(className && (
            //(className.indexOf('row') >=0 && className.indexOf('region-subheader') >=0 )
            (className.indexOf("bottomBar") >=0)
            || (className.indexOf("twoCol") >=0 && className.indexOf("forcePageBlockSection")>=0 && className.indexOf("forcePageBlockSectionView")>=0)
            //|| (className.indexOf("slds-global-header__item") >=0 && className.indexOf("slds-grid--vertical-align-center") >=0)
            //|| (className.indexOf("slds-global-header") >=0 && className.indexOf("slds-grid") >=0 && className.indexOf("slds-grid--align-spread") >=0)
            //|| (className.indexOf("full")>=0 && className.indexOf("forcePageBlockSectionRow") >=0)
            || (className.indexOf("hidden") >=0 && className.indexOf("slds-context-bar__item") >=0 && className.indexOf("slds-shrink-none") >=0 && className.indexOf("oneAppNavBarItem") >= 0)
            || (className.indexOf("dockingPanelOverflow")>=0 && className.indexOf("slds-docked_container")>=0 && className.indexOf("hidden") >=0 && className.indexOf("forceDockingPanelOverflow")>=0)
            || (className.indexOf("appLauncher")>=0 && className.indexOf("slds-context-bar__icon-action") >=0)
            || (className.indexOf("slds-grid")>=0 && className.indexOf("slds-page-header__detail-row") >=0)
            //|| (className.indexOf("slds-truncate") >=0)
            //|| (className.indexOf("hidden")>=0)
            || (className.indexOf("hideEl")>=0)
            || (className.indexOf("tooltip")>=0 && className.indexOf("advanced-wrapper") >=0 && className.indexOf("forceHeaderButton") >=0 && className.indexOf("header-tooltip") >=0 && className.indexOf("north")>=0 && className.indexOf("uiTooltipAdvanced") >=0)
            || (className.indexOf("NARROW") >=0 && className.indexOf("runtime_sales_activitiesActivityTimeline2")>=0)
            || (className.indexOf("tabs__nav") >=0)
            || (className.indexOf("slds-global-header_container") >=0)
            )){
            result=false;
        }

        
        return result;
    } 

    function retriveParentIdVariable(debugMode){
        var parentIdVar=null;
        if(debugMode){
            parentIdVar = "$containerComponentId$";
        }else{
            if(typeof $A.Component === 'function'){
                var strComponentFunc=$A.Component.toString();
                var componentFuncArray=strComponentFunc.split('a.containerComponentId');
                var componentIndex=componentFuncArray[0].lastIndexOf(';');
                var componentStr=componentFuncArray[0].substring(componentIndex+1);
                var firstIndex=componentStr.indexOf('.');
                var lastIndex=componentStr.indexOf('=');
                parentIdVar = componentStr.substring(firstIndex+1,lastIndex);
                strComponentFunc = null;
            }
            
        }
        
        return parentIdVar;
    }

    function checkComponentInfo(attMap,attName){

        if(Array.isArray(attMap[attName])){
            if(attName === 'componentInfoDefRef'
                || attName === 'relatedLists' //related lists info in related list quick links
                || attName === 'options'
                ){
                return false;
            }else{
                return true;
            }
            
        }else{
            return false;
        }
    }
    
    function cleanValue(value) {
        if (!value) {
          return value;
        }
        value = value.replace('\xA0', ' ').trim();
        return value;
    }
    
    function getContextRootComponent(component){
        var rootComponent=null;
        var auraId=component.getLocalId();
        if(auraId){
              if(auraId === "viewport"){
                    return component;
              }
   
        }
        var bodyValue = getRawAttributeValue(component, "body");
        if (bodyValue) {
       
                    for (var bodyKey in bodyValue) {
                        var bodyArray = bodyValue[bodyKey];
                        if(bodyArray instanceof Array){
                            for (var i = 0, iLen = bodyArray.length; i < iLen; i++) {
                                var child = bodyArray[i];
                                rootComponent=getContextRootComponent(child);
                               if(rootComponent){
                                  break;

                               }

                            }
                        }

                    }

    }
    else {
         var componentValue = getRawAttributeValue(component, "value");
         if (componentValue && componentValue.getExpression instanceof Function){
            var expression=componentValue.getExpression();
            var valueProvider=component.getAttributeValueProvider();
            
             var componentFacet=null;
            try{
                componentFacet=valueProvider.get(expression);
            
            }catch(e){
                componentFacet=null;
            }
       
           
            if(componentFacet && isFacets(componentFacet)) {
               
                var facets = Array.isArray(componentFacet) ? componentFacet : [componentFacet];
                for (var i = 0, iLen = facets.length; i < iLen; i++) {
                    var child = facets[i];
                    if (isComponentId(child)) {
                        child = $A.getComponent(facets[i]);
                    }
                    
                   rootComponent= getContextRootComponent(child);
                   if(rootComponent){
                               break;
                   }

                }
               
            }
        }
            
        
        
    }
    return rootComponent;
    }

}
function cleanValue(value){

	if(!value){
		return value;
	}
	
	// Required fields are prefixed with an '*'.
	var resultText = value.replace('\xA0', ' ').trim();
	if (resultText && resultText.length > 0 && resultText.charAt(0) == '*') {
		resultText = resultText.substring(1);
	};
	return resultText;
}
return resolveAuraBy(arguments[0], arguments[1], arguments[2]);
