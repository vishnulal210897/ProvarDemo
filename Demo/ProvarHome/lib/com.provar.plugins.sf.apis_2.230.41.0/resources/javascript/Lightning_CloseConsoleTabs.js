var callBack = arguments[arguments.length - 1];
function closeConsoleTabs() {
	let tabContainerXPath = ".//ul[contains(@class, 'tabBarItems')]//li[contains(@class, 'tabItem') and contains(@class, 'hasActions')]//div[contains(@class, 'close') and contains(@class, 'slds-context-bar__icon-action')]";
	let closeBtnXPath = "./button[contains(@class, 'slds-button')]";
	let tabContainer = document.evaluate(tabContainerXPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	if (tabContainer.snapshotLength === 0) {
		tabContainerXPath = ".//ul[contains(@class, 'x-tab-strip')]//li[contains(@class, 'x-tab-strip-closable')]";
		closeBtnXPath = "./a[contains(@class, 'x-tab-strip-close')]";
		tabContainer = document.evaluate(tabContainerXPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	}
	
	let closeButtons = [];
	for (var i = 0; i < tabContainer.snapshotLength; i++) {
	    var tab = tabContainer.snapshotItem(i);
	    if (tab) {
	        var btn = document.evaluate(closeBtnXPath, tab, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	        if (btn.singleNodeValue) {
	        	closeButtons.push(btn.singleNodeValue);
	        }
	    }
	}

	if (closeButtons.length === 0) {
		callBack();
	}
	
	let firstTab = (closeButtons.length && closeButtons[0].closest("li") && closeButtons[0].closest("li").querySelector("a"));
    firstTab && firstTab.click();

	waitForTabLoad().then(res => {
        closeButtons.forEach(e => e != closeButtons[0] && e.click());
        closeButtons[0].click();
        callBack();
	});
}

function waitForTabLoad() {
    return new Promise((resolve, rj) => {
        let activeTabContent = "div.oneWorkspace.active:not(.isLoading) div.windowViewMode-maximized.active div.oneRecordHomeFlexipage2Wrapper";
        let iteration = 0;
        let interval = setInterval(() => {
            if ((document.querySelector(activeTabContent) && iteration > 0) || iteration++ === 3) {
                clearInterval(interval);
                resolve();
            }
        }, 2000);
    });
}

closeConsoleTabs();