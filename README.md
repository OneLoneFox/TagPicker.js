# TagPicker.js
A fancy select multiple

## CDN
load css and js files via jsdelivr
```html
<!-- choose one -->
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/OneLoneFox/TagPicker.js/src/tagpicker.css">
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/OneLoneFox/TagPicker.js/src/tagpicker.min.css">

<!-- choose one -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/OneLoneFox/TagPicker.js/src/tagpicker.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/OneLoneFox/TagPicker.js/src/tagpicker.min.js"></script>
```

## Usage example
```javascript
var selectEl = document.getElementById("my-select");
var tagPickerOptions = {
	// your settings here
};
var myPicker = new TagPicker(selectEl, tagPickerOptions);
selectEl.addEventListener('change', function(e){
	let selectedTags = this.tagPicker.getSelectedOptions();
	// expected output: [HTMLOptionElement, HTMLOptionElement, ...]
});
```

## Creation
| Constructor | Description |
|:------------|:------------|
| TagPicker(\<DOMString\> *selector*, \<Object\> *?options*) | Instantiates a TagPicker object with the given css selector. In the case of a class selector (.selector) it will only take the first element matching. |
| TagPicker(\<HTMLElement\> *element*, \<Object\> *?options*) | Instantiates a TagPicker object with the given html element. |

## Options
| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| closeOnSelect | Boolean | false | The picker will be closed after every selection if set to *true*. |
| openOnDeselect | Boolean | true | The picker will be opened after an option is deselected if set to *true*. |
| <a name="maxItems"></a>maxItems | Integer | Undefined | Limits the amount of items that can be selected. A **maxItemsExceeded** event will be fired at the original select element if you try to select more than the defined value with either manual select or the selectOption() method. |
| <a name="minItems"></a>minItems | Integer | Undefined | Limits the minimum amount of items that can be selected. A **minItemsExceeded** event will be fired at the original select element if you try to deselect an item when the minimum is already reached with either manual deselection or the deselectOption(). |
| defaultTransition | Object | [\<Transition Options\>](#TransitionOptions) | The fallback options when no specific \<Transition Options\> is set. |
| defaultRemoveTransition | Object | [\<Remove Transition Options\>](#RemoveTransitionOptions) | The fallback options when no specific \<Remove Transition Options\> is set. |

Available specific transition options are open, close, select and deselect in the format of:
```javascript
let tagPickerOptions = {
	[open,close,select,deselect]Transition: {
		// <Transition Options>
	}
```

### <a name="TransitionOptions"></a>Transition Options
Transition options used for the web animations API, more info at [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)
It is recomended to set only *duration*, *easing* and maybe *delay* properties to prevent breaking the css class based transitions.
| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| duration | Integer | 300 | The number of milliseconds each iteration of the animation takes to complete. |
| easing | String | 'ease-in-out' | The rate of the animation's change over time. |
| delay | Integer | 300 | The number of milliseconds to delay the start of the animation. Defaults to 0. Default only set within \<Remove Transition Option\>. |
| ... | ... | ... | ... |

### <a name="RemoveTransitionOptions"></a>Remove Transition Options
| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| delay | Integer | 300 | The delay in milliseconds before the element (tag or option) is removed. |

## Methods
| Method| Returns | Description |
|:------|:--------|:------------|
| selectOption(\<String\> *value*, \<Boolean\> *?fireEvent=false*) | Boolean | Selects an option. Returns *true* if the selection is successful and *false* if the option does not exist or is already selected or the [maxItems](#maxItems) value is reached. If fireEvent (optional) is set to *true* a **change** event will be fired in the original select element. |
| deselectOption(\<String\> *value*, \<Boolean\> *?fireEvent=false*) | Boolean | Deselects an option. Returns *true* if the deselection is successful and *false* if the option does not exist or is not selected or the [minItems](#minitems) value is reached. If fireEvent (optional) is set to *true* a **change** event will be fired in the original select element. |
| deselectAll(\<Boolean\> *?fireEvent=false*) |  | Deselects all options at once. If fireEvent (optional) is set to *true* a **change** event will be fired in the original select element after all the options have been deselected. |
| getSelectedOptions() | HTMLOptionElement[] | Returns an Array with all the selected options from the original select element. |
| getLastOptionSelected() | HTMLOptionElement | Returns the last Option element that has been selected through manual selection or the selectOption() method. |
| setMinItems(\<Integer\> *limit*) |  | Sets or updates the value of [minItems](#minItems) option. |
| getMinItems() | Integer | Gets the value of [minItems](#minItems) option. |
| setMaxItems(\<Integer\> *limit*) |  | Sets or updates the value of [maxItems](#maxItems) option. |
| getMaxItems() | Integer | Gets the value of [maxItems](#maxItems) option. |
| addOption(\<String\> *text*, \<String\> *value*) | HTMLOptionElement | Creates and adds an option to the original select element and calls the **update()** method. Returns an instance of the created **Option** element. Throws an exception if the option value already exists. |
| removeOption(\<String\> *value*) | HTMLOptionElement | Removes an option from the original select element. Returns an instance of the removed **Option** element. Throws an exception if no option is found with the given value. |
| open() |  | Opens the options list. |
| close() |  | Closes the options list. |
| toggle() |  | Toggles between open and closed. |
| disable() |  | Disables the picker and calls close() |
| enable() |  | Enables the picker. |
| update() |  | Removes the selectedTags and optionList elements, removes event proxies and rebuilds them, that includes the placeholder. Will "sort" your selected tags and options to the actual order in the original select element. |

## Update example
```javascript
var selectEl = document.getElementById("my-select");
var tagPickerOptions = {
	// your settings here
};
var myPicker = new TagPicker(selectEl, tagPickerOptions);
/*
	Update your original selectEl, you can also access the element via myPicker.selectElement
	You can also select options without the selectOption method, changes will still be reflected
*/
myPicker.update();
```