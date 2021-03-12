setTimeout(() => {
	const baseXpath = arguments[0];
	const relatedListApiName = arguments[1];
	const relatedListApiAliasName = arguments[2];
	const callBack = arguments[arguments.length - 1];
	const flexiComponent = document.evaluate(baseXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	if (!flexiComponent) {
		callBack(null);
	}
	const quickLinkIterator = document.evaluate(".//lst-related-list-quick-link", flexiComponent, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
	let iterator = 1;
	while (true) {
		const quickLink = quickLinkIterator.iterateNext();
		if (!quickLink) {
			break;
		}
		if (quickLink.relatedListInfo && (quickLink.relatedListInfo.relatedListApiName === relatedListApiName || quickLink.relatedListInfo.relatedListApiName === relatedListApiAliasName)) {
			callBack(`(${baseXpath}//lst-related-list-quick-link)[${iterator}]`);
		}
		iterator++;
	}
	callBack(null);
}, 1000);
