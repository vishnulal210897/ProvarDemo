const relatedListSectionElem = arguments[0];
let nodeIterator = document.evaluate("ancestor::div[contains(@class, 'forceRelatedListPreviewAdvancedGrid')]", relatedListSectionElem, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
const node = nodeIterator.iterateNext();
if (node) {
	return true;
}

const listContainer = document.evaluate("ancestor::lst-related-list-single-container", relatedListSectionElem, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
if (listContainer && "ADVGRID" === listContainer.relatedListComponentOverride) {
	//some objects (Notes and Attachment) are Enhanced RL but we are handling them using default flow
	const singleContainer = document.evaluate("ancestor::div[contains(@class, 'forceRelatedListSingleContainer')]", relatedListSectionElem, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	if(singleContainer){
		return false;
	}
    return true;
}

return false;