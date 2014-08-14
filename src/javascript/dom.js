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


var dom = (function() {

	var my = {};

	my.getSelectedRadioIndex = function (radios){


		for (var r = 0; r < radios.length; r++){
		
			if (radios[r].checked === true){
			
				return r;
			
			}
		
		}
		
		return 0;

	};
	
	
	my.getSelectedRadioValue = function (radios){
	
		return radios[my.getSelectedRadioIndex(radios)].value;
	
	};
	
	
	my.makeRadios = function(parent, array, name, id_prefix, title_key, value_key, start_value, on_change){
		var input;
		
		for (var f=0; f<array.length; f++){
		
			input = dom.input(parent, id_prefix+f, "", name, "radio", array[f][value_key]);
			
			dom.span(parent, "","", " " + array[f][title_key]);
			
			if (f === start_value){
				input.checked = true;
			}
			
			dom.br(parent);
			
			if (on_change) {
				input.addEventListener("click", function (num) {
					return function () {
						on_change(array[num].value);
					}
				}(f), false);
			}
			
		}
	
	};
	
	
	my.removeOptions = function (selectbox){
		
		var i;
		
		for (i = selectbox.options.length - 1; i >= 0; i--){
			selectbox.remove(i);
		}
		
	};
	
	
	my.setRadiosByValue = function(radios, value){
	
		for (var r=0; r< radios.length; r++){
		
			if (radios[r].value == value){
			
				radios[r].checked = true;
				return;
				
			}
		
		}		
	
		console.error("dom.setRadioByValue: Value " + value + " not available in radios!");
	
	}
	

	my.setRadioIndex = function (radios, index){

		if (typeof index != "number"){
			console.error("dom.setRadioIndex: index is not of type number but " + typeof index);
			return;
		}
	
		radios[index].checked = true;

	};
	
	
	my.getOptionValuesOfSelect = function(select){

		var option_values = [];

		forEach(select.options, function(option){
			
			option_values.push(option.value);
		
		});

		return option_values;

	};


	my.br = function(parent){
	
		var br = my.newElement("br","","",parent);
		return br;
	
	};
	
	
	my.img = function(parent,id,className,src){
	
		var img = my.newElement("img",id,className,parent);
		img.src = src;
		
		return img;	
	
	};
	
	
	my.div = function(parent,id,className,innerHTML){
	
		var div = my.newElement("div",id,className,parent,innerHTML);
		
		return div;	
	
	};
	
	
	my.span = function(parent,id,className,innerHTML){
	
		var span = my.newElement("span",id,className,parent,innerHTML);
		
		return span;	
	
	};
	
	
	my.p = function(parent, innerHTML, id, className){
	
		var p = my.newElement("p",id,className,parent,innerHTML);
		
		return p;	
	
	};
	
	
	my.a = function(parent, id, className, href, innerHTML, onclick){
	
		var a = dom.newElement("a","","",parent,innerHTML);
		a.href = href;
		
		if (typeof onclick != "undefined"){
			a.addEventListener("click", onclick);
		}
		
		return a;
	
	};
	
	
	my.h1 = function(parent, innerHTML){
	
		var h1 = my.newElement("h1","","",parent, innerHTML);
		return h1;
	
	};

	
	my.h2 = function(parent, innerHTML){
	
		var h2 = my.newElement("h2","","",parent, innerHTML);
		return h2;
	
	};
	
	
	my.h3 = function(parent, innerHTML){
	
		var h3 = my.newElement("h3","","",parent, innerHTML);
		return h3;
	
	};
	
	
	my.h5 = function(parent, innerHTML){
	
		var h5 = my.newElement("h5","","",parent, innerHTML);
		return h5;
	
	};
	
	
	my.input = function(parent, id, className, name, type, value){
	
		var input = dom.newElement("input",id,className,parent);
		input.type = type;
		input.name = name;
		
		if (typeof value != "undefined"){
			input.value = value;
		}
		
		return input;
	
	};
	

	my.textarea = function (parent, id, className, rows, cols, value){
		
		var textarea = my.make("textarea", id, className, parent);
		textarea.rows = rows;
		textarea.cols = cols;
		textarea.value = value;
		return textarea;

	};


	my.newElement = function (element_tag,element_id,element_class,parent_to_append_to,innerHTML){

		var element = document.createElement(element_tag);
		
		if (element_id !== ""){
			element.id = element_id;
		}
		
		if (element_class !== ""){
			element.className = element_class;
		}
		
		parent_to_append_to.appendChild(element);

		if (innerHTML){
		
			element.innerHTML = innerHTML;
		
		}
		
		return element;
	};
	
	
	my.make = my.newElement;


	my.remove = function (elem){
	
		if (typeof elem == "string"){
			elem = g(elem);
		}

		return elem.parentNode.removeChild(elem);
		
	};
	
	
	my.hideAllChildren = function(elem){
		
		var children = elem.children;
		forEach(children, my.hideElement);
		
	};
	
	
	my.showAllChildren = function(elem){
		
		var children = elem.children;
	
		for (var c=0; c<children.length; c++){
	
			children[c].style.display = "";
	
		}
		
	};
	
	
	my.hideElement = function(elem){
		elem.style.display = "none";
	};
	
	
	my.hide = my.hideElement;


	my.unhideElement = function(elem){
	
		elem.style.display = "";
	
	};
	
	
	my.scrollTop = function(element){
	
		element.scrollTop = 0;
	
	};
	
	
	my.setSelectOptions = function(select, options, first_option_empty){
	
		my.removeOptions(select);
		
		if (first_option_empty === true){
		
			var NewOption = new Option("", 0, false, true);
			select.options[select.options.length] = NewOption;
		
		}
		
		
		forEach(options, function(option){

			NewOption = new Option(option.title, option.id, false, true);
			select.options[select.options.length] = NewOption;
			
		});
	
		select.selectedIndex = 0;
	
	};
	
	return my;
	
})();

