
function ZemantaCrowdFlowerDialog(onDone) {
  this._onDone = onDone;
  this._extension = {};
  var dismissBusy = DialogSystem.showBusy();
    
  this._dialog = $(DOM.loadHTML("crowdsourcing", "scripts/dialogs/crowdflower-job-columns-dialog.html"));
  this._elmts = DOM.bind(this._dialog);
  this._elmts.dialogHeader.text("Upload data to CrowdFlower");
  
  this._elmts.jobTabs.tabs();

  var tabindex = 0;

  
  this._renderAllExistingJobs();
  this._renderAllColumns2(this._elmts.columnsMenu_0, this._elmts.columnList_0, tabindex);
  
  var self = this;
  
  this._elmts.columnsPanel.hide();
  
  //TODO: hide this after testing
  //this._elmts.extFieldsPanel.hide();
  //this._elmts.extColumnsPanel.hide();
  
  this._elmts.chkUploadToNewJob.click(function () {
	
	  if(self._elmts.chkUploadToNewJob.is(':checked')) {
		  self._elmts.columnsPanel.show();
	  }
	  else {
		  self._elmts.columnsPanel.hide();
	  }
	  
  });
  
  this._elmts.okButton.click(function() {
	  self._extension = {};
      self._extension.title= self._elmts.jobTitle.val();
      self._extension.instructions = self._elmts.jobInstructions.val();
      self._extension.content_type = "json";
      self._extension.column_names = [];
      
	  var curTabPanel = $('#jobTabs .ui-tabs-panel:not(.ui-tabs-hide)');	  
	  var tabindex = curTabPanel.index();

	  if(tabindex == 0) {
		  self._extension.new_job = true;  
		  console.log("Creating new job...");
	  } else {
		  self._extension.new_job = false;
		  console.log("Uploading to existing job...");
	  }
      
	  //TODO: it depends on which tab is selected!!!
      $('#project-columns-' + tabindex +' input.zem-col:checked').each( function() {
    	  var col = {};
    	  col.name = $(this).attr('value');
    	  col.safe_name = ZemantaExtension.util.convert2SafeName(col.name);
    	  self._extension.column_names.push(col);
    	  //self._extension.column_names.push($(this).attr('value'));
      });
      
      if(self._extension.column_names.length < 1) {
    	  alert("No column was selected! Cannot upload data.");
      }
      else {
    	  self._extension.upload = true;
    	  console.log("Columns: " + JSON.stringify(self._extension.column_names));
    	  DialogSystem.dismissUntil(self._level - 1);
    	  self._onDone(self._extension);
      }
  });
  
  
  this._elmts.cancelButton.click(function() {	  
    DialogSystem.dismissUntil(self._level - 1);
  });
   
  
  this._elmts.jobTitle.blur(function () {
	  var title = self._elmts.jobTitle.val();	  
	  if(title.length < 5 || title.length > 255  ) {
		  $('#title-warning').show();
	  } else {
		  $('#title-warning').hide();
	  }
  });
  
  this._elmts.jobInstructions.blur(function () {
	  var instructions = self._elmts.jobInstructions.val();	  
	  if(instructions ===""  ) {
		  $('#instructions-warning').show();
	  } else {
		  $('#instructions-warning').hide();
	  }
  });
  
  this._elmts.copyJobButton.click(function() {
	  var job_id = self._elmts.allJobsList.val();

	  if(job_id === "none") {
		  alert("First select job to copy!");
	  }
	  else {
		  self._copyAndUpdateJob(job_id);
	  }
	  
  });
  
  dismissBusy();
  this._level = DialogSystem.showDialog(this._dialog);
  
};

ZemantaCrowdFlowerDialog.prototype._copyAndUpdateJob = function(jobid) {
	
	var self = this;
	self._extension = {};
	self._extension.job_id = jobid;
	
	ZemantaExtension.util.copyJob(self._extension, function(data){
	  console.log("Copy results: " + JSON.stringify(data));
	  self._updateJobList(data);
	});
	
};


ZemantaCrowdFlowerDialog.prototype._updateJobList = function(data) {
	var self = this;
	var selContainer = self._elmts.allJobsList;
	var selected = "";
	var status = data["status"];
    var dismissBusy = DialogSystem.showBusy();
    var message = "";

	console.log("Data: " + JSON.stringify(data));
	
	selContainer.empty();
	
	$('<option name="opt_none" value="none">--- select a job --- </option>').appendTo(selContainer);
	

	if(status === "ERROR") {
		self._elmts.statusMessage.html(status + ": " + data["message"]);
	}
	else {
	
		self._elmts.statusMessage.html("OK");
		
		if(data["jobs"] && data["jobs"]!= null) {
			var jobs = data["jobs"];
		
			for (var index = 0; index < jobs.length; index++) {
				var value = jobs[index];
				console.log("Value: " + value);
				
				if(value.id === data.job_id) {
					selected = " selected";
				} else {
					selected = "";
				}
				
				var job = $('<option name="opt_' + index + '" value=' + value.id + '' + selected + '>' + value.title + ' (job id: ' + value.id + ')</option>');		
				selContainer.append(job);
		
			}
		}
	}

	
	dismissBusy();
};

ZemantaCrowdFlowerDialog.prototype._renderAllExistingJobs = function() {
	
	var self = this;
	var selContainer = self._elmts.allJobsList;
	var elemStatus = self._elmts.statusMessage;
	
	$('<option name="opt_none" value="none">--- select a job --- </option>').appendTo(selContainer);
	
	ZemantaExtension.util.loadAllExistingJobs(function(data, status) {
		
		elemStatus.html("Status: " + status);
		
		$.each(data, function(index, value) {
			
			var title = (value.title == null)? "Title not defined" : value.title;
			var job = $('<option name="opt_' + index + '" value=' + value.id + '>' + title + ' (job id: ' + value.id + ')</option>');
			selContainer.append(job);
		});
		
		selContainer.change(function() {
			this._extension = {};
			this._extension.job_id = $(this).children(":selected").val();
			this._selectedJob = this._extension.job_id;
			
			console.log("Job id changed:" + JSON.stringify(this._extension));
			
			ZemantaExtension.util.getJobInfo(this._extension, function(data){
				  console.log("Updating job.");
				 self._updateJobInfo(data);
			});
		});
	});
};

ZemantaCrowdFlowerDialog.prototype._updateJobInfo = function(data) {

	var self = this;
	var elm_jobTitle = self._elmts.extJobTitle;
	var elm_fields = self._elmts.extJobFields;
	var elm_jobInstructions = self._elmts.extJobInstructions;
	var elm_cml = self._elmts.extCml;
	
	console.log("Updating job..." + JSON.stringify(data));
	
	if(data["title"] === null || data["title"] === "" ) {
		elm_jobTitle.val("(title undefined)");
	} else {
		elm_jobTitle.val(data["title"]);
	}
	
	if(data["instructions"] === null || data["instructions"] === "") {
		elm_jobInstructions.html("(instructions undefined)");
	}
	else {
		elm_jobInstructions.html(data["instructions"]);
	}
	
	if(data["cml"] === "[]" || data["cml"] === null) {
		elm_cml.html("(no cml defined )");
	} else {
		elm_cml.html(data["cml"]);
	}
	
	//TODO: test this
	if(data["fields"].length > 0) {
		this._elmts.extFieldsPanel.show();
		this._elmts.extColumnsPanel.hide();
		var elm_fields = this._elmts.extJobFields;
		$.each(data["fields"], function(index, value) {
			$('<input type="checkbox">' + value + '</input>').appendTo(elm_fields);
		});
	} else {
		this._elmts.extFieldsPanel.hide();
		this._elmts.extColumnsPanel.show();
	}
	
	
	self._elmts.statusMessage.html(data["message"]);
	
};

ZemantaCrowdFlowerDialog.prototype._renderAllColumns2 = function(columnContainer, columnListContainer, tabindex) {
	  
	var self = this;
	var columns = theProject.columnModel.columns;
	
	var chkid = 0;

	var renderColumns = function(columns, elem) {
		
		$.each(columns, function(index, value){
			var id = 'chk_' + tabindex + '_' + chkid;
			var input = $('<input type="checkbox" class="zem-col" value="' + value.name + '" id="' + id + '"/>').appendTo(elem);
			$('<label for="' + id + '">' + value.name + '</label> <br/>').appendTo(elem);
			chkid++;
						
			input.click(function() {
				$('#cml-preview-panel-' + tabindex).html(ZemantaExtension.util.generateCML(tabindex));
			});
		});
	};
	
	var linkSelectAll = $('<a href="#" id="select-all-columns-' + tabindex +'"> Select all </a>');
	columnContainer.append(linkSelectAll);
	var linkClearAll = $('<a href="#" id="clear-all-columns-' + tabindex + '"> Clear all </a>');
	columnContainer.append(linkClearAll);

	renderColumns(columns, columnListContainer);
	
	linkClearAll.click(function () {
		$('#project-columns-' + tabindex + ' input.zem-col').each(function () {
			$(this).attr('checked', false);
		});
		$('#cml-preview-panel-' + tabindex).html(ZemantaExtension.util.generateCML(tabindex));
	});
	
	linkSelectAll.click(function() {
		$('#project-columns-'+ tabindex + ' input.zem-col').each(function () {
			$(this).attr('checked', true);
		});
		$('#cml-preview-panel-' + tabindex).html(ZemantaExtension.util.generateCML(tabindex));
	});
};


ZemantaCrowdFlowerDialog.prototype._renderAllColumns = function() {
	  
	var self = this;
	var columns = theProject.columnModel.columns;
	
	var columnContainer = self._elmts.allColumns;
	var columnListContainer = self._elmts.columnList;
	var chkid = 0;

	var renderColumns = function(columns, elem) {
		
		$.each(columns, function(index, value){
			var id = 'chk_' + chkid;
			var input = $('<input type="checkbox" class="zem-col" value="' + value.name + '" id="' + id + '"/>').appendTo(elem);
			$('<label for="' + id + '">' + value.name + '</label> <br/>').appendTo(elem);
			chkid++;
						
			input.click(function() {
				$('#cmlPreviewPanel').html(ZemantaExtension.util.generateCML());
			});
		});
	};
	
	var linkSelectAll = $('<a href="#" id="select-all-cols"> Select all </a>').appendTo(columnContainer);
	var linkClearAll = $('<a href="#" id="clear-all-columns"> Clear all </a>').appendTo(columnContainer);

	renderColumns(columns, columnListContainer);
	
	linkClearAll.click(function () {
		$('#project-columns input.zem-col').each(function () {
			$(this).attr('checked', false);
		});
		$('#cmlPreviewPanel').html(ZemantaExtension.util.generateCML());
	});
	
	linkSelectAll.click(function() {
		$('#project-columns input.zem-col').each(function () {
			$(this).attr('checked', true);
		});
		$('#cmlPreviewPanel').html(ZemantaExtension.util.generateCML());
	});
};

