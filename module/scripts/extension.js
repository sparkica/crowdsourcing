var ZemantaExtension = {handlers: {}, util: {}};


ZemantaExtension.handlers.storeCrowdFlowerAPIKey = function() {
	
	new ZemantaSettingsDialog(function(newApiKey) {
		$.post(
	          "/command/core/set-preference",
	          {
	            name : "crowdflower.apikey",
	            value : JSON.stringify(newApiKey)
	          },
	          function(o) {
	            if (o.code == "error") {
	            	
	            	alert(o.message);
	            }
	          },
	          "json"
		);
	});
};


ZemantaExtension.handlers.doNothing = function() {
	alert("Crowdsourcing extension active...");
};

ZemantaExtension.handlers.openPreferences = function() {
	window.location = "/preferences";
};

ZemantaExtension.handlers.openJobSettingsDialog = function()  {
	
	new ZemantaCrowdFlowerDialog(function(extension) {
		
	      $.post(
	    		  "command/crowdsourcing/create-crowdflower-job",
	    		  { "project" : theProject.id, 
	    			"extension": JSON.stringify(extension),
	    			"engine" : JSON.stringify(ui.browsingEngine.getJSON())
	    		  },
	    		  function(o)
	    		  {
	    			  console.log("Status: " + o.status); 
	    			  alert("Status: " + o.status);
	    		  },
	    		  "json"
	      );     

	});
};

ZemantaExtension.handlers.evaluateFreebaseReconDialog = function()  {
	
	new ZemantaCFEvaluateFreebaseReconDialog(function(extension) {
		
	      $.post(
	    		  "command/crowdsourcing/evaluate-freebase-recon-job",
	    		  { "project" : theProject.id, 
	    			"extension": JSON.stringify(extension),
	    			"engine" : JSON.stringify(ui.browsingEngine.getJSON())
	    		  },
	    		  function(o)
	    		  {
	    			  console.log("Status: " + o.status); 
	    			  alert("Status: " + o.status);
	    		  },
	    		  "json"
	      );     

	});
};



ZemantaExtension.handlers.getApiKey =  function() {
	console.log("Getting API key...");
	ZemantaExtension.util.loadCrowdFlowerApiKeyFromSettings(function(apiKey) {
		console.log("Read API key: " + apiKey);
		return apiKey;
	});
};


ExtensionBar.addExtensionMenu({
	"id": "zemanta",
	"label": "Zemanta",
	"submenu": [
   		 {
			 "id": "zemanta/openrefine-settings",
			 "label": "OpenRefine settings",
			 click: ZemantaExtension.handlers.openPreferences
		 },
		 {
			 "id" : "zemanta/crowdflower",
			 "label" : "CrowdFlower service",
			 "submenu" : [
				    		 {
				    			 "id": "zemanta/crowdflower/create-crowdflower-job",
				    			 label: "Create new job / upload data",
				    			 click: ZemantaExtension.handlers.openJobSettingsDialog
				    		 },
				    		 {
				    			 "id": "zemanta/crowdflower/configure-job",
				    			 "label" :  "Configure job",
				    			 click: ZemantaExtension.handlers.doNothing 
				    		 },
				    		 {
				    			"id": "zemanta/crowdflower/download-results",
				    			"label": "Download results",
				    			click: ZemantaExtension.handlers.doNothing
				    			 
				    		 },
				    		 {},

			     		 {
			    			 "id": "zemanta/crowdflower/settings",
			    			 "label": "Set CrowdFlower API key",
			    			 click: ZemantaExtension.handlers.storeCrowdFlowerAPIKey
			    		 },
			              ]
		 },
		 {},
		 {
			 "id": "zemanta/crowdflowertemplates",
			 label: "CrowdFlower - job templates",
			 "submenu": [
			             {
			            	 "id":"zemanta/crowdflowertemplates/freebase",
			            	 "label": "Evaluate Freebase reconciliations",
			            	 click: ZemantaExtension.handlers.evaluateFreebaseReconDialog
			             },
			             {
			            	 "id":"zemanta/crowdflowertemplates/dbpedia",
			            	 "label": "Evaluate DBpedia reconciliations",
			            	 click: ZemantaExtension.handlers.doNothing
			             }
			             ]
		 }
		 
		]
});