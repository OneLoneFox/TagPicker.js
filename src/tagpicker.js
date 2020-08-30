class TagPicker {
	constructor(_selectElement, _options = {}){
		if(typeof _selectElement === "string"){
			this.selectElement = document.querySelector(_selectElement);
		}else{
			this.selectElement = _selectElement;
		}
		this.selectOptions = this.selectElement.querySelectorAll('option');
		let defaultOptions = {
			closeOnSelect: false,
			openOnDeselect: true,
			defaultTransition: {
				duration: 300,
				easing: 'ease-in-out',
			}
			//open, close, select, deselect — transitions
			//customRemoveIconElement — ToDo
			//customToggleIconElement — ToDo
		}
		this.options = {...defaultOptions, ..._options};
		this.fancySelect = document.createElement('div');
		
		this.fancySelect.classList.add('tagPicker');

		this.selectedTags = document.createElement('div');

		this.selectedTags.classList.add('tagPicker_selectedTags');
		let placeholder = this.selectElement.dataset.placeholder || this.selectElement.querySelector('[data-placeholder]').dataset.placeholder;
		let placeholderContainer = document.createElement('span');
		placeholderContainer.classList.add('tagPicker-placeholder');
		placeholderContainer.innerText = placeholder;
		
		this.placeholderContainer = placeholderContainer;
		
		this.selectedTags.appendChild(placeholderContainer);
		let arrow = document.createElement('div');
		arrow.classList.add('tagPicker_toggleArrow');
		this.selectedTags.appendChild(arrow);

		this.optionList = this._createOptionList();

		this.fancySelect.append(this.selectedTags, this.optionList);
		this.selectElementWrapper = document.createElement('div');
		this.selectElementWrapper.classList.add('originalSelect');
		this.selectElementWrapper.appendChild(this.selectElement);
	}

	_createOption(text, value){
		let item = document.createElement('li');
		item.classList.add('tagPicker_optionList-option');
		item.dataset.value = value;
		item.innerText = text;
		return item;
	}
	_generateOptions(){
		let customOptions = [];
		this.selectOptions.forEach((option, idx) => {
			let optionText = option.innerText;
			if (option.selected){
				// selectedTags.push(this._createTag(optionText, option.value));
				this._selectOption(idx);
			}else{
				customOptions.push(this._createOption(optionText, option.value));	
			}

		});
		return customOptions;
	}
	_createOptionList(){
		let optionList = document.createElement('ul');
		optionlist.classList.add('tagPicker_optionList')
		let customOptions = this._generateOptions();
		optionList.append(customOptions);
		return optionList;
	}
	_createTag(text, value){
		let tag = document.createElement('a');
		tag.classList.add('tagPicker_selectedTags-tag');
		tag.dataset.value = option.value;
		tag.innerHTML = `<em>${text}</em><i class="remove-icon"></i>`;
		return tag;
	}
	_selectOption(idx){ // preselected options in original select
		let optionText = this.selectOptions[idx].innerText;
		let optionValue = this.selectOptions[idx].value;
		let optionTag = this._createTag(optionText, optionValue);
		this.selectedTags.appendChild(optionTag);
		this._hidePlaceholder();
	}
	_removeOptions(){
		this._removeProxies();
		// loop the damn thing
	}
	_showPlaceholder(){this.placeholderContainer.classList.remove("hidden");}
	_hidePlaceholder(){this.placeholderContainer.classList.add("hidden");}
	
	_animateOptionRemove(option){
		let styles = window.getComputedStyle(option);
        let optionHeight = styles.height;
        let optionPadding = styles.padding;
        let transitionOptions = this.options.selectTransition || this.options.defaultTransition;
        let animation = option.animate([
            {
                height: optionHeight,
                padding: optionPadding
            },
            {
                height: '0px',
                padding: '0px'
            }
        ], {
            ...transitionOptions
        });
        return animation;
	}
	_toggleProxy(e){
		let toggleArrow = e.target.closest('.toggleArrow');
		if (toggleArrow){
			this.toggle();
		}
	}
	_optionsProxy(e){
		this._toggleProxy(e);
		let option = e.target.closest('tagPicker_optionList-option');
		if(!option){return;}
		if(option.classList.contains('removing')){return;}
		
		if(option.previousElementSibling){
			option.previousElementSibling.classList.add('beforeRemoving');
		}
		if(option.nextElementSibling){
			option.nextElementSibling.classList.add('afterRemoving');
		}
		option.classList.add('removing');
		let selectedTag = this.selectOption(option.dataset.value);
		
		setTimeout(() => {
			selectedTag.classlist.add('shown'); // delayed show (animation choreography)
			let removing = this._animateOptionRemove(option);
			removing.onfinish = () => {
				if(option.previousElementSibling){
					option.previousElementSibling.classlist.remove('beforeRemoving');
				}
				if(option.nextElementSibling){
					option.nextElementSibling.classlist.remove('afterRemoving');
				}
	            option.remove();
	            if(this.options.closeOnSelect){
					this.close();
				}
	        }
		}, 
		this.options.selectTransition.duration || this.options.defaultTransition.duration);
	}
	_addOptionsProxy(){
		this.optionsList.addEventListener("click", this._optionsProxy);
	}
	_animateTagRemove(tag){
		let styles = window.getComputedStyle(tag);
        let padding = styles.padding;
        let deltaWidth = styles.width;
        let deltaHeight = styles.height;
        let transitionOptions = this.options.deselectTransition || this.options.defaultTransition;
        let animation = tag.animate([
            {
                width: deltaWidth,
                height: deltaHeight,
                padding: padding
            },
            {
                width: '0px',
                height: '0px',
                padding: '0px'
            }
        ], {...transitionOptions});
        return animation;
	}
	_tagsProxy(e){
		// ToDo: clicking only on remove icon instead of anywhere on the tag(?)
		let tag = e.closest('tagPicker_selectedTags-tag');
		if(!tag){return;}
		if(tag.classList.contains('removing')){return;}
		tag.className = '';
		tag.classList.add('removing');
		tag.classList.add('disappear');

		let createdOption = this.deselectOption(tag.dataset.value);
		createdOption.classList.add('show');
		if(this.options.openOnDeselect){
			this.open();
			/* In case I remove the transform delay on .tagPicker_optionList-option
			setTimeout(() => {
				createdOption.classList.add('shown');
			}, this.options.openTransition.duration || this.options.defaultTransition.duration);
			*/
		}
		/* Same reason stated above
		else{
			createdOption.classList.add('show');
		}
		*/

		setTimeout(() => {
			let removing = this._animateTagRemove(tag);
			removing.onfinish = () => {
				tag.remove();
				if (optionsList.length === 0){
					this._showPlaceholder();
				}
				createdOption.className = '';
			}
		}, this.options.deselectTransition.duration || this.options.defaultTransition.duration);
		
	}
	_addTagsProxy(){
		this.selectedTags.addEventListener("click", this._tagsProxy);
	} // event listener in this.selectedTags
	_removeProxies(){
		this.optionsList.removeEventListener("click", this._optionsProxy);
		this.selectedTags.removeEventListener("click", this._tagsProxy);
	}

	selectOption(optionValue){
		let option = this.selectOptions.querySelector(`[value="${optionValue}"]`);
		
		option.selected = true;
		let event = new CustomEvent('change');
		this.selectElement.dispatchEvent(event);
		
		let optionText = option.innerText;
		let optionValue = option.value;
		let optionTag = this._createTag(optionText, optionValue);
		this.selectedTags.appendChild(optionTag);
		this._hidePlaceholder();
		return optionTag;
	}
	deselectOption(optionValue){
		let option = this.selectOptions.querySelector(`[value="${optionValue}"`);
		
		option.selected = false;
		let event = new CustomEvent('change');
		this.selectElement.dispatchEvent(event);
		
		let optionText = option.innerText;
		let optionValue = option.value;
		let customOption = this._createOption(optionText, optionValue);
		this.optionList.appendChild(customOption);
		return customOption;
	}
	open(){
		this.fancySelect.style = `--t: ${this.options.openTransition.duration || this.options.defaultTransition.duration}`;
		if(!this.fancySelect.classList.contains('open')){
			this.fancySelect.classList.add('open');
		}
	}; // style = '--t: this.options.openTransition.duration'
	close(){
		this.fancySelect.style = `--t: ${this.options.closeTransition.duration || this.options.defaultTransition.duration}`;
		this.fancySelect.classList.remove('open');
	};
	toggle(){
		if(this.fancySelect.classList.contains('open')){
			this.close();
		}else{
			this.open();
		}
	};
	disable(){
		this._removeProxies();
		if(!this.fancySelect.classList.contains('disabled')){
			this.fancySelect.classList.add('disabled');
		}
	}
	enable(){
		this._addOptionsProxy();
		this._addTagsProxy();
		this.fancySelect.classList.remove('disabled');
	}
	getSelectedOptions(){return;}
	update(){return;}
}