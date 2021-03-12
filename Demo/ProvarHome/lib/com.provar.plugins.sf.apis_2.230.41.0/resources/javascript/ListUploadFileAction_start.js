var fileDownloadButton = arguments[0];
var callback = arguments[arguments.length - 1];
return startListUploadFileAction(fileDownloadButton);

//Iterating first level childrens on aura component services. 
//TODO: We might need to iterate deeper later, but usual pattern is we get file uploader at first level of iteration
function getFileUploaderFromAuraComponentServices() {
	var services = $A.componentService;
	for(key in services) {
		if(services.hasOwnProperty(key)) {
			var s = services[key];
			for(k in s) {
				if(s[k] && typeof s[k] == 'object') {
					var fileUploader = s[k]["js://forceContent.contentLib.FileUploader"];
					if(fileUploader && typeof fileUploader == 'function') {
						return fileUploader;
					}
				}    
			}
		}
	}
}

function startListUploadFileAction(fileDownloadButton) {

    // Get the contentLib service from Aura:
    // - this has the FileUploader.selectFileFromDevice that we need to overwrite.
	var contentLibFileUploader;
	if(typeof $A === 'undefined') {
	    return null;
    }
    if($A.componentService.Ql && $A.componentService.Ql.Jb) {
	    contentLibFileUploader = $A.componentService.Ql.Jb["js://forceContent.contentLib.FileUploader"];
	} else if($A.componentService.cl && $A.componentService.cl.Ab) {
	    contentLibFileUploader = $A.componentService.cl.Ab["js://forceContent.contentLib.FileUploader"];
	} else if($A.componentService.$k && $A.componentService.$k.Fb) { //Spring18
		contentLibFileUploader = $A.componentService.$k.Fb["js://forceContent.contentLib.FileUploader"];
	} else if($A.componentService.xl && $A.componentService.xl.Jb) { //Summer18
		contentLibFileUploader = $A.componentService.xl.Jb["js://forceContent.contentLib.FileUploader"];
	} else if($A.componentService.yl && $A.componentService.yl.Jb) { //Summer18
		contentLibFileUploader = $A.componentService.yl.Jb["js://forceContent.contentLib.FileUploader"];
	} else {
		contentLibFileUploader = getFileUploaderFromAuraComponentServices();
	}
	if(!contentLibFileUploader) {
		return null;
	}

    // Override the definition of the selectFileFromDevice function so that:
    // 1.  Creates the file button, but does not click it
    // 2.  sets window._provarFileButton to the file button so that we can return it.
    var a = {};
    window._provarFileButton = null;
    contentLibFileUploader.selectFileFromDevice = function(e, b, c) {
        var f = document.createDocumentFragment()
          , d = document.createElement("input");
        d.type = "file";
        b && (d.multiple = b);
        c && (d.accept = c);
        a.fileInput = d;
        if ($A.util.isFunction(e))
            $A.util.on(d, "change", $A.getCallback(function(a) {
                e(this.files)
            }));
        f.appendChild(d);

        // Start of Provar mods
        //d.click()        
        window._provarFileButton = d;
        document.body.appendChild(d);
        // End of Provar mods
    };

    // Click the supplied button:
    // - this is not the actual file button, but will cause our overridden selectFileFromDevice 
    //   to be invoked.
    fileDownloadButton.click();

    // The Click will have populated the file button:
    // - we return it so that it can be typed into via Selenium.
    if (window._provarFileButton) {
		callback(window._provarFileButton);
	}
	
    // when file upload is requested from Related list action drop down menu item (Add files) and RL is having some records present in it.
    // - in that case, fileDownloadButton.click() only trigger attach file popup. So, to activate selectFileFromDevice method (of Salesforce), a click on 'upload files' button on attach file popup is required.
    if (!window._provarFileButton) {
        const uploadFilesButtonLocator = "//div[contains(@class,'open') and contains(@class,'active')]//div[contains(@class, 'forceContentFilePicker')]//button[contains(@class, 'attachButton')]";
        var counter = 1;
        const timer = setInterval(() => {
		const uploadFilesIt = document.evaluate(uploadFilesButtonLocator, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
        const uploadFilesButton = uploadFilesIt.iterateNext();
        if (uploadFilesButton) {
            uploadFilesButton.click();
            clearInterval(timer);
            callback(window._provarFileButton);
        }
        //return if not found
		if (counter > 5) {
			clearInterval(timer);
			callback(window._provarFileButton);
		}
        counter++;
        }, 1000);
    }

}
