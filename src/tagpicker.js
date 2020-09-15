class TagPicker {
	constructor(_selectElement, _options = {}){
		if(typeof _selectElement === "string"){
			this.selectElement = document.querySelector(_selectElement);
		}else{
			this.selectElement = _selectElement;
		}
		this.selectElement.tagPicker = this;
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

		this._init();
		this.selectElement.parentNode.insertBefore(this.fancySelect, this.selectElement);
		this.selectElementWrapper = document.createElement('div');
		this.selectElementWrapper.classList.add('originalSelect');
		this.selectElementWrapper.appendChild(this.selectElement);
		this.fancySelect.appendChild(this.selectElementWrapper);
	}
	_init(){
		this.selectOptions = this.selectElement.querySelectorAll('option');
		this.selectedTags = this._createSelectedTagsContainer();
		this.optionList = this._createOptionList();

		this.fancySelect.append(this.selectedTags, this.optionList);

		this._addOptionsProxy();
		this._addTagsProxy();
	}
	_clear(){
		this.selectedTags.remove();
		this.optionList.remove();
		this._removeProxies();
	}
	_createSelectedTagsContainer(){
		let selectedTags = document.createElement('div');
		selectedTags.classList.add('tagPicker_selectedTags');
		
		let placeholder = this.selectElement.dataset.placeholder ?? this.selectElement.querySelector('[data-placeholder]').dataset.placeholder;
		let placeholderContainer = document.createElement('span');
		placeholderContainer.classList.add('tagPicker-placeholder');
		placeholderContainer.innerText = placeholder;
		
		this.placeholderContainer = placeholderContainer;
		
		selectedTags.appendChild(placeholderContainer);
		let arrow = document.createElement('div');
		arrow.classList.add('tagPicker_toggleArrow');
		selectedTags.appendChild(arrow);

		return selectedTags;
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
				this._selectOptionByIndex(idx);
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
	_selectOptionByIndex(idx){
		let optionTag = this._appendTag(this.selectOptions[idx]);
		this.selectedTags.appendChild(optionTag);
		this._hidePlaceholder();
	}
	_selectOption(value){
		let option = this.selectElement.querySelector(`option[value="${value}"]`);
		
		option.selected = true;
		this._dispatchEvent('change');
		
		let optionTag = this._appendTag(option);
		return optionTag;
	}
	_deselectOption(value){
		let option = this.selectElement.querySelector(`option[value="${value}"`);
		
		option.selected = false;
		this._dispatchEvent('change');
		
		let customOption = this._appendOption(option);
		return customOption;
	}
	_appendTag(option){
		let optionText = option.innerText;
		let optionValue = option.value;
		let optionTag = this._createTag(optionText, optionValue);
		this.selectedTags.appendChild(optionTag);
		this._hidePlaceholder();
		return optionTag;
	}
	_appendOption(option){
		let optionText = option.innerText;
		let optionValue = option.value;
		let customOption = this._createOption(optionText, optionValue);
		this.optionList.appendChild(customOption);
		return customOption;
	}
	_removeOptions(){
		this._removeProxies();
	}
	_showPlaceholder(){this.placeholderContainer.classList.remove("hidden");}
	_hidePlaceholder(){this.placeholderContainer.classList.add("hidden");}
	_dispatchEvent(eventName){
		let event = new CustomEvent(eventName);
		this.selectElement.dispatchEvent(event);
	}
	
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
		if(this.options.maxItems){
			if(this.selectElement.selectedOptions.length == this.options.maxItems){
				this._dispatchEvent('maxItemsExceeded');

				option.classList.add('removing');
				setTimeout(() => {
					option.classList.remove('removing');
				}, this.options.selectTransition.duration ?? this.options.defaultTransition.duration);
				return;
			}
		}
		
		if(option.previousElementSibling){
			option.previousElementSibling.classList.add('beforeRemoving');
		}
		if(option.nextElementSibling){
			option.nextElementSibling.classList.add('afterRemoving');
		}
		option.classList.add('removing');
		let selectedTag = this._selectOption(option.dataset.value);
		selectedTag.classList.add('notShown');
		
		setTimeout(() => {
			selectedTag.classList.add('shown');
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
		tag.classList.remove('notShown');
		tag.classList.remove('shown');
		
		tag.classList.add('removing');
		tag.classList.add('disappear');

		let createdOption = this._deselectOption(tag.dataset.value);
		createdOption.classList.add('show');
		if(this.options.openOnDeselect){
			this.open();
		}

		setTimeout(() => {
			let removing = this._animateTagRemove(tag);
			removing.onfinish = () => {
				tag.remove();
				if (this.selectElement.selectedOptions.length === 0){
					this._showPlaceholder();
				}
				createdOption.classList.remove('show');
			}
		}, (this.options.deselectTransition && this.options.deselectTransition.duration) ?? this.options.defaultTransition.duration);
		
	}
	_addTagsProxy(){
		this.selectedTags.addEventListener("click", this._tagsProxy);
	}
	_removeProxies(){
		this.optionList.removeEventListener("click", this._optionsProxy);
		this.selectedTags.removeEventListener("click", this._tagsProxy);
	}
	_checkValueIntegrity(value){
		for(let i = 0; i < this.selectOptions.length; i++){
			if(this.selectOptions[i].value == value){
				throw new Error(`Option with value ${value} already exists.`);
				break;
			}
		}
	}

	selectOption(value, fireEvent = false){
		let option = this.selectElement.querySelector(`option[value="${value}"]`);
		let customOption = this.optionList.querySelector(`[data-value="${value}"]`);

		if(!option){return false;}
		if(option.selected){return false;}
		option.selected = true;
		if(fireEvent){
			this._dispatchEvent('change');
		}

		this._appendTag(option);
		customOption.remove();
		
		return true;
	}
	deselectOption(value, fireEvent = false){
		let option = this.selectElement.querySelector(`option[value="${value}"]`);
		let tag = this.selectedTags.querySelector(`[data-value="${value}"]`);

		if(!option){return false;}
		if(!option.selected) {return false;}
		option.selected = false;
		if(fireEvent){
			this._dispatchEvent('change');
		}

		this._appendOption(option);
		tag.remove();
		if (this.selectElement.selectedOptions.length === 0){
			this._showPlaceholder();
		}

		return true;
	}
	deselectAll(fireEvent = false){
		let selectedOptions = this.getSelectedOptions();
		selectedOptions.forEach((option) => {
			this.deselectOption(option.value);
		});
		if(fireEvent){
			this._dispatchEvent('change');	
		}
	}
	setMaxItems(limit){
		this.options.maxItems = limit;
	}
	getMaxItems(){
		return this.options.maxItems;
	}
	addOption(text, value){
		this._checkValueIntegrity(value);
		let option = document.createElement('option');
		option.innerText = text;
		option.value = value;
		this.selectElement.add(option)
		this.update();
		return option;
	}
	removeOption(value){
		let option = this.selectElement.querySelector(`option[value="${value}"`);
		if(!option){
			throw new Error(`Option with value ${value} not found.`);
		}
		option.remove();
		this.update();
		return option;
	}
	open(){
		this.fancySelect.style = `--t: ${(this.options.openTransition && this.options.openTransition.duration) ?? this.options.defaultTransition.duration}`;
		if(!this.fancySelect.classList.contains('open')){
			this.fancySelect.classList.add('open');
		}
	};
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
	}
	update(){
		this._clear();
		this._init();
	}
}