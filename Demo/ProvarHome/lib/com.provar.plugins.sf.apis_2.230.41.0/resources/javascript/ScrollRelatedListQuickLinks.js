var element = arguments[0];
if(element) {
	var hoverXpath = "//div[contains(@class, 'forceHoverPanel') and contains(@class, 'open') and contains(@class, 'active')]//div[contains(@class, 'listPreview')]";
	var hoverElem = document.evaluate(hoverXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	const scrollableContainer = document.evaluate("ancestor::div[contains(@class, 'container') and ancestor::div[contains(@class, 'forceHoverPanel') and contains(@class, 'active')]]", element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	if (hoverElem && hoverElem.singleNodeValue) {
		var hoverElement = document.evaluate("//div[contains(@class, 'forceHoverPanel') and contains(@class, 'open') and contains(@class, 'active')]//div[contains(@class, 'forceRelatedListHover')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if(element === hoverElement) {
			var hoverPanelElem= document.evaluate("//div[contains(@class, 'forceHoverPanel') and contains(@class, 'open') and contains(@class, 'active')]//h2[contains(@class, 'slds-page-header')]//a[contains(@class, 'test-drillin')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if(hoverPanelElem){
				element = hoverPanelElem;
			}
		} else if (scrollableContainer && scrollableContainer.style.overflowY === 'scroll') {
			const elementOffset = element.getBoundingClientRect().y;
			const scrollableContainerOffset = scrollableContainer.getBoundingClientRect().y;
			scrollableContainer.scrollTop = elementOffset - scrollableContainerOffset;
			return true;
		}
		element.scrollIntoViewIfNeeded(true);
		return true;
	}
	
	return false;
}
