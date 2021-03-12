var element = arguments[0];
const scrollableContainer = document.evaluate("ancestor::div[contains(@class, 'container') and ancestor::div[contains(@class, \"forceHoverPanel\") and contains(@class, 'active')]]", element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
return Boolean(scrollableContainer && scrollableContainer.style.overflowY === 'scroll');