// This script is expecting 2 arguments. 1st is a webElement and 2nd is a boolean variable isSkuidPage.
// In case of SKuid page with tables when we activate Inline Edit by mapping Edit icon then in DOM we
// will search for '<div> or <i>' with class 'sk-icon inline' if it's present then click it.
// Else, if it's <td> and Skuid page then find the <div> which contains value and update webElement with
// new element. In case it's an <a> tag and parentElement is not null then update webElement with parentElement
// and perform double click operation on webElement.

var webElement = arguments[0];
var isSkuidPage = arguments[1];

if (webElement.tagName === 'DIV' && webElement.className && webElement.className.indexOf('nx-skootable-buttonicon') >= 0) {
	var xpathEditIcon = ".//*[self::div or self::i][contains(@class, 'sk-icon') and contains(@class,' inline')]";
	var editIcon = document.evaluate(xpathEditIcon, webElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	var editIconElem = editIcon.singleNodeValue;
	if (editIconElem) {		
		var clickEvent  = document.createEvent ('MouseEvents');
		clickEvent.initEvent('click', true, true);
		webElement.dispatchEvent(clickEvent);
	}
} else {
	if (webElement.tagName === 'TD' && isSkuidPage) {
		var xpathNxField = ".//div[contains(@class, 'nx-field') and not(contains(@class, 'nx-field-label'))]";
	    var nxField = document.evaluate(xpathNxField, webElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	    var nxFieldElem = nxField.singleNodeValue;
	    if (nxFieldElem) {
	    		webElement = nxFieldElem;
	    }
	}
	
	if (webElement.tagName === 'A' && webElement.parentElement) {
		webElement = webElement.parentElement;
	}

	var clickEvent  = document.createEvent ('MouseEvents');
	clickEvent.initEvent('dblclick', true, true);
	webElement.dispatchEvent(clickEvent);
}

