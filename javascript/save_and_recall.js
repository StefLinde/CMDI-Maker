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

var save_and_recall = (function(){

	var my = {};
	
	my.interval;
	my.interval_time = 60;

	my.getRecallDataForApp = function(){

		var form = localStorage.getItem(local_storage_key);

		if (!form){
			console.log("No recall data found");
			my.set_autosave_interval(my.interval_time);
			APP.view("default");
			return;
		}
		
		var form_object = JSON.parse(form);
		
		console.log("APP Recall object: ");
		console.log(form_object);
		
		my.fill_form(form_object);	
		
	}
	
	
	my.getRecallDataForEnvironment = function(environment){

		var form = localStorage.getItem(environment.id);

		if (!form){
			console.log("No recall data for environment found");
			return;
		}
		
		var form_object = JSON.parse(form);
		
		console.log("Environment Recall object: ");
		console.log(form_object);
		
		my.recallEnvironmentData(form_object);	
		
	}
	

	my.set_autosave_interval = function(time){

		window.clearInterval(my.interval);
		
		if (time == -1){

			console.log("Auto Save off");
			return;
			//nothing to do here because interval is already cleared. just return
		
		}
		
		console.log("Auto Save Time in seconds: " + time);
		
		my.interval_time = time;
		
		// if not switched off
		my.interval = window.setInterval(function() {
			my.save();
		}, my.interval_time*1000);

	}
	
	
	my.recallEnvironmentData = function (recall_object){

		//recall environment settigns
		APP.active_environment.recall(recall_object.settings);
		
		var workflow = APP.active_environment.workflow;
		
		//for every workflow module, recall its save data
		for (var m=0; m<workflow.length; m++){
		
			if (workflow[m].recall){
				workflow[m].recall(recall_object[workflow[m].identity.id]);
			}
			
		}
	
	}


	my.fill_form = function(recall_object){

		console.log("Filling the form with recalled data");
		
		g("metadata_language_select").selectedIndex = recall_object.settings.metadata_language;
		g("metadata_creator").value = recall_object.settings.metadata_creator;
		

		my.set_autosave_interval(recall_object.settings.save_interval_time);
		
		if (recall_object.active_environment_id){
		
			var environment = APP.getEnvironmentFromID(recall_object.active_environment_id);
			APP.createEnvironment(environment);
			my.getRecallDataForEnvironment(environment);
		
		}
		
		APP.view(recall_object.active_view);
	}
	
	
	my.deleteAllData = function(){
	
		localStorage.clear();
		
	}


	my.deleteEnvironmentData = function(){

		try {
			localStorage.removeItem(APP.active_environment.id);
		}
		
		catch (e){
			alertify.log("No data for active profile found","",5000);
			return;
		}
		
		alertify.log("Recall data for active profile deleted","",5000);

	}
	
	
	my.userSave = function(){
		my.save();
		alertify.log("Form saved","",5000);
	}

	
	my.save = function(){
	//This saves the app data and the data of the active environment
		
		var form_object = my.retrieveDataToSave();
		localStorage.setItem(local_storage_key, JSON.stringify(form_object));
		
		if (APP.active_environment){
			var environment_object = my.retrieveEnvironmentDataToSave();
			localStorage.setItem(APP.active_environment.id, JSON.stringify(environment_object));
		}
		
		console.log("Form saved");

	}
	
	my.saveAllToFile = function(){
	
		var CMP_object = {};
		
		CMP_object.app = my.retrieveDataToSave();
		
		if (APP.active_environment){
			var environment_object = my.retrieveEnvironmentDataToSave();
			CMP_object.environments = {};
			CMP_object.environments[APP.active_environment.id] = environment_object;
		}
	
		APP.save_file(JSON.stringify(CMP_object), "CMDI-Maker-Project.cmp");
	
	}

	
	my.retrieveDataToSave = function(){

		var object = {
		
			settings: {
				metadata_creator: get("metadata_creator"),
				metadata_language: g("metadata_language_select").selectedIndex,
				save_interval_time: document.metadata_form.radio_auto_save.value
			}
			
		};
		
		object.active_view = APP.active_view;
		
		if (APP.active_environment){
			object.active_environment_id = APP.active_environment.id;
		}
		
		return object;

	}
	
	
	my.retrieveEnvironmentDataToSave = function(){

		var object = {};
		
		//get environment settings
		object.settings = APP.active_environment.getSaveData();
		
		var workflow = APP.active_environment.workflow;
		
		for (var m=0; m<workflow.length; m++){
			
			if (workflow[m].getSaveData){
				object[workflow[m].identity.id] = workflow[m].getSaveData();
			}
			
		}
		
		return object;

	}

	
	return my;
	
})();