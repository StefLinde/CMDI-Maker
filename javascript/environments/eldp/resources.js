﻿/*
Copyright 2014 Sebastian Zimmer

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


eldp_environment.workflow[0] = (function(){

	var my = {};
	var session;
	
	my.selected_files = [];
	
	my.available_resources = [];
	// 0=file name, 1=mime type, 2=size, 3=(exif_)(last modified)date
	// this array only contains file metadata retrieved by file upload form / drag and drop

	my.identity = {
		id: "resources",
		title: "Resources",
		icon: "blocks.png",
	};
	
	my.last_selected_file = -1;
	
	my.shift = false;
	
	my.view_id = "VIEW_resources";
	
	my.view = function(){
	
		dom.scrollTop();
	
	}
	
	
	my.compatibility_warnings = {
	
		general: '<div class="warning_div"><div class="warning_img_div"><img class="warning_icon" src="'+path_to_icons+'warning.png"></div><div class="compatibility_warning">'+
		' This file does not seem to be a valid resource file for LAMUS. Please consider recoding it.</div></div>',
		
		invalid_media_file: '<div class="warning_div"><div class="warning_img_div"><img class="warning_icon" src="'+path_to_icons+'warning.png"></div><div class="compatibility_warning">'+
		' This media file does not seem to be a valid file for LAMUS. Please consider recoding it to WAV (audio) or MP4 (video).</div></div>',
		
		invalid_written_resource: '<div class="warning_div"><div class="warning_img_div"><img class="warning_icon" src="'+path_to_icons+'warning.png"></div><div class="compatibility_warning">'+
		' This file does not seem to be a valid written resource for LAMUS. Please consider recoding it to PDF or TXT.</div></div>'
	
	};
	
	
	my.getFileType = function(filename){
	
		var file_types = my.file_types;

		var index_of_dot = filename.lastIndexOf(".");

		var fileending = filename.slice(index_of_dot+1);
		
		var fileinfo = {
			type: "Unknown",
			mimetype: "Unknown"
		};
		
		var list = a(file_types.valid_lamus_written_resource_file_types,0);
		var pos = list.indexOf(fileending);
		
		if (list.indexOf(fileending) != -1){
		
			fileinfo.type = file_types.valid_lamus_written_resource_file_types[pos][2];
			fileinfo.mimetype = file_types.valid_lamus_written_resource_file_types[pos][1];
			return fileinfo;
		
		}
		
		list = a(file_types.valid_lamus_media_file_types,0);
		pos = list.indexOf(fileending);
		
		if (list.indexOf(fileending) != -1){
		
			fileinfo.type = file_types.valid_lamus_media_file_types[pos][2];
			fileinfo.mimetype = file_types.valid_lamus_media_file_types[pos][1];
			return fileinfo;
		
		}
		
		list = a(file_types.invalid_lamus_media_file_types,0);
		pos = list.indexOf(fileending);
		
		if (pos != -1){
		
			fileinfo.type = file_types.invalid_lamus_media_file_types[pos][2];
			fileinfo.mimetype = file_types.invalid_lamus_media_file_types[pos][1];
			return fileinfo;
		
		}
		
		list = a(file_types.invalid_lamus_written_resource_file_types,0);
		pos = list.indexOf(fileending);
		
		if (pos != -1){
		
			fileinfo.type = file_types.invalid_lamus_written_resource_file_types[pos][2];
			fileinfo.mimetype = file_types.invalid_lamus_written_resource_file_types[pos][1];
			return fileinfo;
		
		}

		return fileinfo;
	}
	
	
	my.file_types = {

		valid_lamus_written_resource_file_types: [
			["eaf","text/x-eaf+xml","Annotation"],
			["mdf","Unknown","Unspecified"],
			["pdf","application/pdf","Primary Text"],
			["xml","text/xml","Annotation"],
			["txt","text/plain","Unspecified"],
			["htm","text/html","Unspecified"],
			["html","text/html","Unspecified"]
		],

		valid_lamus_media_file_types: [
			["wav","audio/x-wav","audio"],
			["mpg","video/mpeg","video"],
			["mpeg","video/mpeg","video"],
			["mp4","video/mp4","video"],
			["aif","audio/x-aiff","audio"],
			["aiff","audio/x-aiff","audio"],
			["jpg","image/jpeg","image"],
			["jpeg","image/jpeg","image"],
			["png","image/png","image"],
			["tif","image/tiff","image"],
			["tiff","image/tiff","image"],
			["smil","application/smil+xml","video"]
		],

		invalid_lamus_written_resource_file_types: [
			["docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document","Unspecified"],
			["doc","application/msword","Unspecified"],
			["odf","application/vnd.oasis.opendocument.formula","Unspecified"],
			["odt","application/vnd.oasis.opendocument.text","Unspecified"],
			["xls","application/vnd.ms-excel","Unspecified"],
			["xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","Unspecified"],
			["ppt","application/vnd.ms-powerpoint","Unspecified"],
			["pptx","application/vnd.openxmlformats-officedocument.presentationml.presentation","Unspecified"]
		],

		invalid_lamus_media_file_types: [
			["mkv","Unknown","video"],
			["mov","video/quicktime","video"],
			["mp3","Unknown","audio"],
			["avi","video/x-msvideo","video"],
			["au","audio/basic","audio"]
		]

	};
	
	
	my.recall = function(data){
	
		my.available_resources = data;
		my.refreshFileListDisplay();
	
	}
	
	
	my.getSaveData = function(){
	
		return my.available_resources;
	
	}
	
	
	my.functions = [
		{
			label: "Create one session per file",
			icon: "plus.png",
			id: "crps_icon",
			wrapper_id: "crps_div",
			type: "function_wrap",
			sub_div: "crps_filetype_select",
			onclick: function() { my.createSessionPerResource();  APP.view(session); },
			sub_div_innerHTML: 	'<h3 class="inner_function_h3">Files</h3>'+
						'<input type="radio" name="radio_file_type" value="selected" checked> Selected Files<br>'+
						'<input type="radio" name="radio_file_type" value="eaf"> EAF<br>'+
						'<input type="radio" name="radio_file_type" value="wav"> WAV<br>'+
						'<input type="radio" name="radio_file_type" value="mpg"> MPG<br>'+
						'<input type="radio" name="radio_file_type" value="mp4"> MP4<br>'
		},
		{
			id: "link_sort_alphabetically",
			icon: "az.png",
			label: "Sort Files alphabetically",
			onclick: function() { my.sortAlphabetically(); }
		},
		{
			id: "link_remove_files",
			icon: "reset.png",
			label: "Remove",
			onclick: function() { my.removeSelectedFiles(); }
		},
		{
			id: "link_clear_file_list",
			icon: "reset.png",
			label: "Clear File List",
			onclick: function() { my.clearFileList(); }
		},
	
	
	
	];
	
	
	my.init = function(){
	
		session = eldp_environment.workflow[2];
	
		var view = g(view_id_prefix + my.identity.id);
		var div = dom.newElement("div","files","",view);
		var drop_zone = dom.newElement("div","drop_zone","",div,"<h2>Drag and drop media files here</h2>");
		
		var input = dom.newElement("input","files_input","",div);
		input.name = "files_input";
		input.type = "file";
		input.multiple = true;

		var usage_table = dom.newElement("div","","workspace-usageTable",div,
		'<h3>Usage</h3><h4>Click</h4><p>Select resource, click again to deselect a single resource</p>'+
		'<h4>Shift</h4><p>Hold shift to select multiple resources</p>'+
		'<h4>Escape</h4><p>Press escape to deselect all resources</p>');
		
		var file_list_div = dom.newElement("div","file_list_div","",view);
		var list = dom.newElement("div","list","",file_list_div);
		
		// Setup the drag and drop listeners
		var dropZone = g('drop_zone');
		dropZone.addEventListener('dragover', my.handleDragOver, false);
		dropZone.addEventListener('drop', my.handleFileDrop, false);
	  
		g('files_input').addEventListener('change', my.handleFileInputChange, false);
		
		my.refreshFileListDisplay(true);
		
		document.onkeydown = function(event) {
		
			if (event.keyCode == 16) {  //if shift is pressed
				if (my.shift == false){
					my.shift = true;
					console.log("shift on");
				}
			}
			
			if (event.keyCode == 27)  {   //escape pressed
			
				my.deselectAllFiles();
			
			}
		
		};
		
		document.onkeyup = function(event) {
		
			if (event.keyCode == 16) {  //if shift is let go
				my.shift = false;
				console.log("shift off");
			}
			
		};
		
	}

	
	my.getValidityOfFile = function(filename){
	// returns 0=valid media file, 1=valid written resource, 2=invalid media file, 3=invalid written resource, -1=unknown file

		var file_type = GetFileTypeFromFilename(filename);
		
		for (var j=0;j<my.file_types.valid_lamus_media_file_types.length; j++){
			if (file_type == my.file_types.valid_lamus_media_file_types[j][0]) {
				return 0;
			}
		}
		
		for (var j=0;j<my.file_types.valid_lamus_written_resource_file_types.length; j++){
			if (file_type == my.file_types.valid_lamus_written_resource_file_types[j][0]){
				return 1;
			}
		}

		for (var j=0;j<my.file_types.invalid_lamus_media_file_types.length; j++){
			if (file_type == my.file_types.invalid_lamus_media_file_types[j][0]){
				return 2;
			}
		}	

		for (var j=0;j<my.file_types.invalid_lamus_written_resource_file_types.length; j++){
			if (file_type == my.file_types.invalid_lamus_written_resource_file_types[j][0]){
				return 3;
			}
		}		

		return -1;

	}

	
	my.refreshFileListDisplay = function(not_in_sessions) {

		// files is a FileList of File objects. List some properties.
		var output = [];
		
		var list = g('list');
		
		list.innerHTML = "";

		for (var i = 0; i < my.available_resources.length; i++) {
		
			switch (my.getValidityOfFile(my.available_resources[i][0])){
			
				case 0: {
					var compatibility_warning = "";
					var file_entry_class = "media_file_entry";
					break;
				}
			
				case 1: {
					var compatibility_warning = "";
					var file_entry_class = "written_resource_file_entry";
					break;
				}
			
				case 2: {
					var compatibility_warning = my.compatibility_warnings.invalid_media_file;
					var file_entry_class = "media_file_entry";
					break;
				}
				
				case 3: {
					var compatibility_warning = my.compatibility_warnings.invalid_written_resource;
					var file_entry_class = "written_resource_file_entry";
					break;
				}
				
				default: {
					var compatibility_warning = my.compatibility_warnings.general;
					var file_entry_class = "invalid_file_entry";
					break;
				}
			
			}
		  
			
			var file_size = my.available_resources[i][2];
		
			var div = dom.newElement("div", "file_entry_"+i, "file_entry " + file_entry_class, list);
			var title = dom.newElement("h2", "", "file_entry_title", div, my.available_resources[i][0]);
			var p = dom.newElement("p", "", "", div, my.available_resources[i][1] +
			'<br><span class="size_span">Size: ' + file_size + '</span><br><span name="date_span" class="date_span">Last modified: ' +
			my.available_resources[i][3] + '</span>');
			
			div.innerHTML += compatibility_warning;

			div.addEventListener("click", function(i){
			
				return function(){
					
					my.clickedOnFile(i);
				
				};
				
			}(i), false);

		}
		
		if (my.available_resources.length == 0){
			list.innerHTML = "<h2>No resource files imported.</h2>";
		}

		if ((session) && (!not_in_sessions)){
			session.refreshResourcesOfAllSessions();
		}
		
		my.selected_files = [];
		
	}
  
  
	my.pushFileMetadata = function(FileList) {

		// files is a FileList of File objects. List some properties.
		var output = [];
		for (var i = 0, f; f = FileList[i]; i++) {
			my.available_resources.push([/*escape(*/f.name/*)*/, f.type || 'n/a',bytesToSize(f.size,1), f.lastModifiedDate.toLocaleDateString()  ]);  //push an array with 4 values
		}
		
		my.refreshFileListDisplay();
	}
  

	my.handleDragOver = function(evt) {

		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
		
	}


	my.sortAlphabetically = function(){

		my.available_resources = sortByKey(my.available_resources,0);

		my.refreshFileListDisplay();
	}
  

	my.createSessionPerResource = function(){

		var radio_buttons = document.getElementsByName("radio_file_type");
		
		//get file type
		for (var i = 0; i < radio_buttons.length; i++) {
			if (radio_buttons[i].checked) {
				var chosen_file_type = radio_buttons[i].value;
				break;
			}
		}

		console.log("Searching for files of chosen file type" + chosen_file_type);
		
		if (chosen_file_type == "selected"){
		
			console.log("Searching for selected files");
			
			for (var f=0; f<my.selected_files.length; f++){
		
				my.createSessionForResource(my.selected_files[f]);
			
			}
			
			return;
		
		}
		
		else {    //for all media files of filetype
		
			for (var f=0; f<my.available_resources.length; f++){
			
				if (GetFileTypeFromFilename(my.available_resources[f][0]) == chosen_file_type){
				
					console.log("Found a file of file type " + chosen_file_type);
					
					my.createSessionForResource(f);
				
				}
				
			}
			
		}


	}
	
	
	my.removeSelectedFiles = function(){
		
		for (var f = 0; f<my.selected_files.length; f++){
		
			my.available_resources[my.selected_files[f]] = null;
		
		
		}
		
		var f = 0;
		
		while (f < my.available_resources.length){
		
			if (my.available_resources[f] == null){
				my.available_resources.splice(f,1);
			}
			
			else {
				f++;
			}
	
		}
		
		my.refreshFileListDisplay();
	}
	
	
	my.removeFile = function(index){
	
		my.available_resources.splice(index,1);
		my.refreshFileListDisplay();
	
	}


	my.createSessionForResource = function(resource_index){

		var name = remove_invalid_chars(RemoveEndingFromFilename(my.available_resources[resource_index][0]));
		var expanded = false; //collapse automatically generated session
		
		var resources = [];
		resources.push(resource_index);
		
		//if another file's name of available_resources starts with the same name as this file, add it to the session, too!
		for (var f2=0; f2<my.available_resources.length; f2++){
		
			if (resource_index == f2){
				continue;
			}
		
			if (isSubstringAStartOfAWordInString(RemoveEndingFromFilename(my.available_resources[f2][0]), RemoveEndingFromFilename(my.available_resources[resource_index][0]))) {
			
				resources.push(f2);
			
			}
		
		}
		
		session.createNewSessionWithResources(name, expanded, resources);

	}


	my.clearFileList = function(){

		my.available_resources = [];

		my.refreshFileListDisplay();

	}

	
	my.handleFileDrop = function(evt){

		evt.stopPropagation();
		evt.preventDefault();
	 
		my.pushFileMetadata(evt.dataTransfer.files);
		
	}


	my.handleFileInputChange = function(evt){
	 
		my.pushFileMetadata(evt.target.files);
	 
	}


	/* File selection */


	my.clickedOnFile = function(i){
		
		if (my.shift == true){
			
			if (i < my.last_selected_file){
			
				for (var f=my.last_selected_file-1; f>=i; f--){
			
					my.selectFile(f);
			
				}		
			
			}
			
			if (i > my.last_selected_file){
			
				for (var f=my.last_selected_file+1; f<=i; f++){
			
					my.selectFile(f);
			
				}
			}
			
		}
		
		else {
			my.selectFile(i);	
		}


		console.log(my.selected_files);


	}


	my.selectFile = function(i){

		var pos = my.selected_files.indexOf(i);

		if (pos == -1){
			my.selected_files.push(i);
			my.last_selected_file = i;
			
		}
		
		else {
			my.selected_files.splice(pos,1);
			my.last_selected_file = i;
		}

		my.markFileEntry(i);

	}
	

	my.markFileEntry = function(i){

		var pos = g("file_entry_"+i).className.indexOf(" selected_file");
		
		if (pos == -1) {
			
			g("file_entry_"+i).className = g("file_entry_"+i).className + " selected_file";
			my.available_resources[i].selected = true;
		
		}
		
		else {
		
			g("file_entry_"+i).className = g("file_entry_"+i).className.slice(0,pos);
			my.available_resources[i].selected = false;
			
		}

	}

	
	my.deselectAllFiles = function(){

		while (my.selected_files.length > 0){
		
			my.selectFile(my.selected_files[0]);
		
		}

	}


	my.clearFileList = function(){

		my.available_resources = [];

		my.refreshFileListDisplay();

	}
	
	return my;

})();
  