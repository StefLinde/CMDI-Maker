﻿lido_environment.workflow[0] = (function(){
	'use strict';

	var my = {};
	var bundle;
	
	my.parent = lido_environment;
	my.l = my.parent.l;

	my.identity = {
		id: "lido_start",
		title: "Start",
		icon: "blocks",
	};

	my.view_id = "VIEW_start";
	
	my.init = function(view){
		
		my.refresh(true);
		
		dom.h3(view, "Hey there! You want to create a LIDO document of your object? That's great! Let's begin by giving information for basic record identification.");
		dom.br(view);
		APP.forms.make(view, my.parent.start_form, "start_", "start_", undefined);
		
	};
	
	
	my.view = function(){
	
		APP.GUI.scrollTop();
	
	};
	
	
	my.recall = function(data){
	
		return;
		my.refresh();
	
	};
	
	
	my.getSaveData = function(){
	
		return APP.forms.makeObjectWithFormData(my.parent.start_form, "start_");
	
	};
	
	
	my.functions = function(){
		return [];
	};
	
	
	my.refresh = function(not_in_bundles) {
	
	};


	my.reset = function(){

		my.refresh();

	};
	
	return my;

})();
  
