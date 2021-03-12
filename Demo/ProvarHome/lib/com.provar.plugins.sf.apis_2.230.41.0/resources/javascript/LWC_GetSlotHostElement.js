var elem = arguments[0];
var shadowRoot = elem.getRootNode();
if (shadowRoot.nodeName === '#document-fragment') {
	return shadowRoot.host;
}
return null;