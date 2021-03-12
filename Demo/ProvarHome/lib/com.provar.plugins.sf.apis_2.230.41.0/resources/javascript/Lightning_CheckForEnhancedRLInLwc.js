const relatedListSectionXpath = arguments[0];
const listContainer = document.evaluate(relatedListSectionXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
if (listContainer && "ADVGRID" === listContainer.relatedListComponentOverride) {
	return true;
}

return false;