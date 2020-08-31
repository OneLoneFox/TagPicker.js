class TagPicker {
	constructor(_selectElement, _options = {}){
		if(typeof _selectElement === "string"){
			this.selectElement = document.querySelector(_selectElement);
		}else{
			this.selectElement = _selectElement;
		}
		this.selectElement.tagPicker = this;
		this.selectOptions = this.selectElement.querySelectorAll('option');
		let defaultOptions = {
			closeOnSelect: false,
			openOnDeselect: true,
			defaultTransition: {
				duration: 300,
				easing: 'ease-in-out',
			},
			//open, close, select, deselect — transitions
			defaultRemoveTransition: {
				delay: 300,
			}
			//optionRemove, tagRemove — transition delays
			//customRemoveIconElement — ToDo
			//customToggleIconElement — ToDo
		}
		this.options = {...defaultOptions, ..._options};
		this.fancySelect = document.createElement('div');
		
		this.fancySelect.classList.add('tagPicker');

		this.selectedTags = document.createElement('div');

		this.selectedTags.classList.add('tagPicker_selectedTags');
		let placeholder = this.selectElement.dataset.placeholder ?? this.selectElement.querySelector('[data-placeholder]').dataset.placeholder;
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
		this.selectElement.parentNode.insertBefore(this.fancySelect, this.selectElement);
		this.selectElementWrapper = document.createElement('div');
		this.selectElementWrapper.classList.add('originalSelect');
		this.selectElementWrapper.appendChild(this.selectElement);

		this._addOptionsProxy();
		this._addTagsProxy();
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
		optionList.classList.add('tagPicker_optionList')
		let customOptions = this._generateOptions();
		optionList.append(...customOptions);
		return optionList;
	}
	_createTag(text, value){
		let tag = document.createElement('a');
		tag.classList.add('tagPicker_selectedTags-tag');
		tag.dataset.value = value;
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
        let transitionOptions = this.options.selectTransition ?? this.options.defaultTransition;
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
	_optionsProxy = (e) => {
		let option = e.target.closest('.tagPicker_optionList-option');
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
		selectedTag.classList.add('notShown');
		
		setTimeout(() => {
			selectedTag.classList.add('shown'); // delayed show (animation choreography)
			setTimeout(() => {
				let removing = this._animateOptionRemove(option);
				removing.onfinish = () => {
					if(option.previousElementSibling){
						option.previousElementSibling.classList.remove('beforeRemoving');
					}
					if(option.nextElementSibling){
						option.nextElementSibling.classList.remove('afterRemoving');
					}
		            option.remove();
		            if(this.options.closeOnSelect){
						this.close();
					}
		        }
			}, (this.options.optionRemoveTransition && this.options.optionRemoveTransition.delay) ?? this.options.defaultRemoveTransition.delay)
		}, 
		(this.options.selectTransition && this.options.selectTransition.duration) ?? this.options.defaultTransition.duration);
	}
	_addOptionsProxy(){
		this.optionList.addEventListener("click", this._optionsProxy);
	}
	_animateTagRemove(tag){
		let styles = window.getComputedStyle(tag);
        let padding = styles.padding;
        let deltaWidth = styles.width;
        let deltaHeight = styles.height;
        let transitionOptions = this.options.deselectTransition ?? this.options.defaultTransition;
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
	_toggleProxy = (e) => {
		let toggleArrow = e.target.closest('.tagPicker_toggleArrow');
		if (toggleArrow){
			this.toggle();
		}
	}
	_tagsProxy = (e) => {
		this._toggleProxy(e);
		// ToDo: clicking only on remove icon instead of anywhere on the tag(?)
		let tag = e.target.closest('.tagPicker_selectedTags-tag');
		if(!tag){return;}
		if(tag.classList.contains('removing')){return;}
		// tag.className = '';
		tag.classList.remove('notShown');
		tag.classList.remove('shown');
		
		tag.classList.add('removing');
		tag.classList.add('disappear');

		let createdOption = this.deselectOption(tag.dataset.value);
		createdOption.classList.add('show');
		if(this.options.openOnDeselect){
			this.open();
			/* In case I remove the transform delay on .tagPicker_optionList-option
			setTimeout(() => {
				createdOption.classList.add('shown');
			}, this.options.openTransition.duration ?? this.options.defaultTransition.duration);
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
				if (this.selectElement.selectedOptions.length === 0){
					this._showPlaceholder();
				}
				// createdOption.className = '';
				createdOption.classList.remove('show');
			}
		}, (this.options.deselectTransition && this.options.deselectTransition.duration) ?? this.options.defaultTransition.duration);
		
	}
	_addTagsProxy(){
		this.selectedTags.addEventListener("click", this._tagsProxy);
	} // event listener in this.selectedTags
	_removeProxies(){
		this.optionList.removeEventListener("click", this._optionsProxy);
		this.selectedTags.removeEventListener("click", this._tagsProxy);
	}

	selectOption(value){
		let option = this.selectElement.querySelector(`option[value="${value}"]`);
		
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
	deselectOption(value){
		let option = this.selectElement.querySelector(`option[value="${value}"`);
		
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
		this.fancySelect.style = `--t: ${(this.options.openTransition && this.options.openTransition.duration) ?? this.options.defaultTransition.duration}`;
		if(!this.fancySelect.classList.contains('open')){
			this.fancySelect.classList.add('open');
		}
	}; // style = '--t: this.options.openTransition.duration'
	close(){
		this.fancySelect.style = `--t: ${(this.options.closeTransition && this.options.closeTransition.duration) ?? this.options.defaultTransition.duration}`;
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
			this.close();
			this.fancySelect.classList.add('disabled');
		}
	}
	enable(){
		this._addOptionsProxy();
		this._addTagsProxy();
		this.fancySelect.classList.remove('disabled');
	}
	getSelectedOptions(){
		let selectedOptions = [];
		for(let i = 0; i < this.selectOptions.length; i++){
			if(this.selectOptions[i].selected){
				selectedOptions.push(this.selectOptions[i]);
			}
		}
		return selectedOptions;
		
		/* Danger experimental zone wiu wiu wiu
		*/
		/**
		return this.selectElement.querySelectorAll('option[selected]:not(:disabled)');
		/**/
	}
	update(){return;}
}