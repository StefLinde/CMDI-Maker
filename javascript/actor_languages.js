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


actor.languages = (function (parent){
//Sub-object of actor

	var my = {};

	my.languages_of_active_actor = [];
	
	my.id_counter = 0;

	my.remove = function (al_id){


		var index = my.getActorLanguageObjectIndexFromID(al_id);

		my.languages_of_active_actor.splice(index,1);
		
		var child = g("actor_language_"+al_id+"_div");
		
		g("current_actor_languages_display").removeChild(child);

	}


	my.clearActiveActorLanguages = function(){

		while (my.languages_of_active_actor.length > 0){

			my.remove(my.languages_of_active_actor[0].id);
			
		}
		
		my.id_counter = 0;

	}
	

	my.getActorLanguageObjectIndexFromID = function (al_id){

		for (var l=0; l<my.languages_of_active_actor.length; l++){
		
			if (my.languages_of_active_actor[l].id == al_id){
				return l;
			}
		
		}

	}


	my.search = function(){

		var input = g("actor_language_select").value;
		
		if (input.length < 3){
		
			g("actor_language_results_div").innerHTML = "";
			
			close_actor_language_select();
			
			alertify.alert("Please specify your search request.\nType in at least 3 characters.");
			
			return;
		}
		
		var name_hits = [];
		
		var results = [];

		for (var i=0;i<LanguageIndex.length;i++){

			if (isSubstringAStartOfAWordInString(LanguageIndex[i][3],input)){
				
				//get an array with all relevant IDs
				name_hits.push(LanguageIndex[i][0]);
			}

		}
		
		//now we have all relevant languageIDs in name_hits. next step: get the L-names of theses language IDs.
		
		for (var j=0;j<LanguageIndex.length;j++){
		
			if ( (name_hits.indexOf(LanguageIndex[j][0]) != -1)  &&  (LanguageIndex[j][2] == "L" )){		//look for their l-name entry
			
				results.push(LanguageIndex[j]);
				
			}
		
		}
		
		g("ac_view").style.display = "none";
		
		var alrd = g("actor_language_results_div");	
		
		alrd.style.display = "block";
		alrd.innerHTML = "";
		
		dom.newElement("h1", "", "", alrd, "Language Search: " + results.length + " result" + ((results.length == 1) ? "" : "s")); 
		
		var img = dom.newElement("img","close_alrd_icon","",alrd);
		img.src = "img/icons/reset.png";
		img.addEventListener('click', function() { 
			actor.languages.closeLanguageSelect();  
		} );
		
		var h3 = dom.newElement("h3","","",alrd,"(ISO639-3 Code, Country ID, Language Name)");
		
		for (var j=0;j<results.length;j++){
		
			var a = dom.newElement("a", 'al_results_link_'+j, 'al_results_link',alrd,
			"<div class='actor_lang_search_entry'>" + results[j][0] + ", "+results[j][1]+", " + results[j][3] + "</div>");
			a.href = '#';
		
		}
		
		for (var j=0;j<results.length;j++){
			//adding event listeners to objects has to be executed in a separate for loop. otherwise .innerHTML would overwrite them again.
			
			g('al_results_link_'+j).addEventListener('click', function(num) { 
				return function(){ 
					
					actor.languages.addFromForm(num);
					
				};
			}(results[j]) );
		}

	}


	my.set = function(ActorLanguageObject){

		//LanguageObject is only a reference to the original array in the LanguageIndex.
		// We have to clone our Language Object from the DB first.
		// Otherwise we would overwrite the DB array which we do not want.
		// More info: http://davidwalsh.name/javascript-clone-array
		var LanguageObject = ActorLanguageObject.LanguageObject.slice(0);

		ActorLanguageObject.id = my.id_counter;
		
		my.languages_of_active_actor.push(ActorLanguageObject);
		
		var div = dom.newElement("div","actor_language_"+my.id_counter+"_div","current_actor_language_entry",g("current_actor_languages_display"));
		var img = dom.newElement("img","delete_lang_"+my.id_counter+"_icon","delete_lang_icon",div);
		img.src = path_to_icons+"reset.png";
		img.addEventListener('click', function(num) { 
			return function(){ actor.languages.remove(num);  
			};
		}(my.id_counter) );
		
		dom.newElement("span","","",div, "ISO639-3 Code: " + LanguageObject[0]);
		dom.newElement("br","","",div);
		dom.newElement("span","","",div, "Name: " + LanguageObject[3]);
		dom.newElement("br","","",div);
		dom.newElement("span","","",div, "Country ID: " + LanguageObject[1]);
		dom.newElement("br","","",div);
		
		var input = dom.newElement("input", "mothertongue_" + my.id_counter, "", div);
		input.type = "checkbox";
		
		if (ActorLanguageObject.MotherTongue == true){
			input.checked = true;
		}

		dom.newElement("span","","",div, "Mother Tongue  ");
		var input = dom.newElement("input", "primarylanguage_" + my.id_counter, "", div);
		input.type = "checkbox";
		
		if (ActorLanguageObject.PrimaryLanguage == true){
			input.checked = true;
		}
		
		dom.newElement("span","","",div, "Primary Language");

		my.closeLanguageSelect();

		my.id_counter += 1;

	}


	my.addFromForm = function(LanguageObject){
	//if actor language is added by user

		if (my.languages_of_active_actor.length == 0){
			var first_added_language = true;
		}
		
		else {
			var first_added_language = false;	
		}			
		
		//Let's create a new ActorLanguageObject
		var ActorLanguageObject = {
		
			LanguageObject: LanguageObject,
			MotherTongue: first_added_language,
			PrimaryLanguage: first_added_language

		};

		my.set(ActorLanguageObject);  

	}


	my.addByISO = function(){

		var input = g("actor_language_iso_input").value;
		console.log("ADDING ISO LANGUAGE " + input);
		
		for (var j=0;j<LanguageIndex.length;j++){   //for all entries in LanguageIndex
		
			if ( (LanguageIndex[j][0] == input)  &&  (LanguageIndex[j][2] == "L")){		//look for their l-name entry
				
				my.addFromForm(LanguageIndex[j]);
				
				g("actor_language_iso_input").value = "";
				return;

			}

		}
		
		alertify.set({ labels: {
			ok: "OK"
		}});	
		
		alertify.alert("ISO code " + input + " not found in database.");

	}



	my.closeLanguageSelect = function(){

		g("actor_language_results_div").style.display = "none";
		g("ac_view").style.display = "inline";

	}
	
	
	return my;
	
})();
