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


function GetValidityOfFile(filename){
// returns 0=valid media file, 1=valid written resource, 2=invalid media file, 3=invalid written resource, -1=unknown file

	var file_type = GetFileTypeFromFilename(filename);
	
	for (var j=0;j<valid_lamus_media_file_types.length; j++){
		if (file_type == valid_lamus_media_file_types[j][0]) {
			return 0;
		}
	}
	
	for (var j=0;j<valid_lamus_written_resource_file_types.length; j++){
		if (file_type == valid_lamus_written_resource_file_types[j][0]){
			return 1;
		}
	}

	for (var j=0;j<invalid_lamus_media_file_types.length; j++){
		if (file_type == invalid_lamus_media_file_types[j][0]){
			return 2;
		}
	}	

	for (var j=0;j<invalid_lamus_written_resource_file_types.length; j++){
		if (file_type == invalid_lamus_written_resource_file_types[j][0]){
			return 3;
		}
	}		

	return -1;

}

function refreshFileListDisplay() {

    // files is a FileList of File objects. List some properties.
    var output = [];
	
	var list = g('list');
	
	list.innerHTML = "";

	for (var i = 0; i < available_resources.length; i++) {
	
		switch (GetValidityOfFile(available_resources[i][0])){
		
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
				var compatibility_warning = compatibility_warnings.invalid_media_file;
				var file_entry_class = "media_file_entry";
				break;
			}
			
			case 3: {
				var compatibility_warning = compatibility_warnings.invalid_written_resource;
				var file_entry_class = "written_resource_file_entry";
				break;
			}
			
			default: {
				var compatibility_warning = compatibility_warnings.general;
				var file_entry_class = "invalid_file_entry";
				break;
			}
		
		}
	  
		
		var file_size = available_resources[i][2];
	
		var div = new_element("div", "file_entry_"+i, "file_entry " + file_entry_class, list);
		var title = new_element("h2", "", "file_entry_title", div, available_resources[i][0]);
		var p = new_element("p", "", "", div, available_resources[i][1] +
		'<br><span class="size_span">Size: ' + file_size + '</span><br><span name="date_span" class="date_span">Last modified: ' +
		available_resources[i][3] + '</span>');
		
		div.innerHTML += compatibility_warning;

		div.addEventListener("click", function(i){
		
			return function(){
				
				clicked_on_file(i);
			
			};
			
		}(i), false);

    }
	
	if (available_resources.length == 0){
		list.innerHTML = "<h2>No media files imported.</h2>";
	}

	refresh_resources_of_sessions();
	
	selected_files = [];
	
}
  
  
  
function pushFileMetadata(FileList) {

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = FileList[i]; i++) {
		available_resources.push([/*escape(*/f.name/*)*/, f.type || 'n/a',bytesToSize(f.size,1), f.lastModifiedDate.toLocaleDateString()  ]);  //push an array with 4 values
    }
	
    refreshFileListDisplay();
}
  

function handleDragOver(evt) {

    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	
}


function sort_alphabetically(){


	available_resources = sortByKey(available_resources,0);


    refreshFileListDisplay();
}
  
  
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];

        if (typeof x == "string")
        {
            x = x.toLowerCase(); 
            y = y.toLowerCase();
        }

        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
  
function create_session_per_resource(){

	var radio_buttons = document.getElementsByName("radio_file_type");
	
	//get file type
	for (var i = 0; i < radio_buttons.length; i++) {
		if (radio_buttons[i].checked) {
			var chosen_file_type = radio_buttons[i].value;
			break;
		}
	}

	console.log("Searching for files of chosen file type" + chosen_file_type);
	
	//for all media files of filetype
	
	for (var f=0; f<available_resources.length; f++){
	
		if (GetFileTypeFromFilename(available_resources[f][0]) == chosen_file_type){
			console.log("Found a file of file type " + chosen_file_type);
			var session = new_session({
				name: RemoveEndingFromFilename(available_resources[f][0]),
				expanded: false			//collapse automatically generated session
			});
			
			add_resource_to_session(session, f);
			
			alertify.log("A new session has been created.<br>Name: " + sessions[GetSessionIndexFromID(session)].name, "", "5000");
			
			//if another file's name of available_resources starts with the same name as this file, add it to the session, too!
			for (var f2=0; f2<available_resources.length; f2++){
			
				if (f == f2){
					continue;
				}
			
				if (isSubstringAStartOfAWordInString(RemoveEndingFromFilename(available_resources[f2][0]), RemoveEndingFromFilename(available_resources[f][0]))) {
				
					add_resource_to_session(session, f2);
				
				}
			
			}
		
		}
		
	}


}


function clear_file_list(){

	available_resources = [];

	refreshFileListDisplay();

}

function handleFileDrop(evt){

	evt.stopPropagation();
	evt.preventDefault();
 
	pushFileMetadata(evt.dataTransfer.files);
	
}

 
function handleFileInputChange(evt){
 
	pushFileMetadata(evt.target.files);
 
}


/* File selection */


function clicked_on_file(i){
	
	if (shift == true){
		
		if (i < last_selected_file){
		
			for (var f=last_selected_file-1; f>=i; f--){
		
				select_file(f);
		
			}		
		
		}
		
		if (i > last_selected_file){
		
			for (var f=last_selected_file+1; f<=i; f++){
		
				select_file(f);
		
			}
		}
		
	}
	
	else {
		select_file(i);	
	}


	console.log(selected_files);


}


function select_file(i){

	var pos = selected_files.indexOf(i);

	if (pos == -1){
		selected_files.push(i);
		last_selected_file = i;
		
		if (shift_tip == true){
			shift_tip = false;
			alertify.log("Tip: Hold SHIFT to select multiple files","",5000);
			
		}
		
	}
	
	else {
		selected_files.splice(pos,1);
		last_selected_file = i;
	}

	mark_file_entry(i);

}

function mark_file_entry(i){

	var pos = g("file_entry_"+i).className.indexOf(" selected_file");
	
	if (pos == -1) {
		
		g("file_entry_"+i).className = g("file_entry_"+i).className + " selected_file";
		available_resources[i].selected = true;
	
	}
	
	else {
	
		g("file_entry_"+i).className = g("file_entry_"+i).className.slice(0,pos);
		available_resources[i].selected = false;
		
	}

}

function deselect_all_files(){

	while (selected_files.length > 0){
	
		select_file(selected_files[0]);
	
	}

}

  
function clear_file_list(){

	available_resources = [];

	refreshFileListDisplay();

}

  
