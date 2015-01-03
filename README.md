cytoscape.js-toolbar
====================

A plugin for cytoscape.js that allows a user to create a custom toolbar to add next to a cytoscape core instance.

Acknowledgements
================

Thanks to the [Cytoscape.js](https://github.com/cytoscape/cytoscape.js) team for providing the ground work and examples for creating this plugin.

Quick Start
===========
Add the following into the head of your page, and make sure that you have included the [Font Awesome 4.0.3](http://fontawesome.io/) as an available CSS file.

```html
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/2.3.7/cytoscape.js"></script>
<script src='jquery.cytoscape.js-toolbar.js' /></script>
```

Now add a DIV element to your page and give it an id that you can reference in jQuery.

```html
<div id="cy-default" class="row cy"></div>
```

Finally create your script to setup your cytoscape instance and then add the toolbar

```html
<script>
    $(function () {
        var cyDefault = window.cyDefault = cytoscape({
            container: document.getElementById('cy-default'),

            // removed for brevity
        });

        cyDefault.toolbar();
    });
</script>
```

Options
=======

***All documentation is available in the index.html, also check out the Kitchen Sink demo for further understanding***

The following are the default options for the toolbar:

`name` (`default value`)
- cyContainer ('cy'): id being used for cytoscape core instance
- tools (See next section): an array of tools to list in the toolbar
- appendTools (false): set whether or not to append your custom tools list to the default tools list
- position ('left'): set position of toolbar (right, left)
- toolbarClass ('ui-cytoscape-toolbar'): set a class name for the toolbar to help with styling
- multipleToolsClass ('tool-item-list'): set a class name for the tools that should be shown in the same position
- toolItemClass ('tool-item') set a class name for a toolbar item to help with styling
- autodisableForMobile (true) disable the toolbar completely for mobile (since we don't really need it with gestures like pinch to zoom)
- zIndex (9999): the z-index of the ui div
- longClickTime (325) time until a multi-tool list will present other tools

Creating a Tool
===============
```javascript
[
	{
		icon: 'fa fa-search-plus', // icon from font-awesome-4.0.3, if you want to use something else, then this becomes a class specific for this tool item
		event: ['tap'], // array of cytoscape events that correlates with action variable
		selector: 'cy', // cytoscape selector ('cy', 'node', 'edge' and 'node,edge') - currently not supporting full selection selectors from the documentation
		options: {
			cy: {
				zoom: 0.1,
				minZoom: 0.1,
				maxZoom: 10,
				zoomDelay: 45
			}
		}, // example of pass usable data for actions (not needed for operation)
		bubbleToCore: false, // say whether or not the event should be performed if the core instance was not clicked
		tooltip: 'Zoom In', // value for the title attribute of a span element (tooltip)
		action: [performZoomIn] // array of action methods that correlates with the event variable
	}
]
```
Diving further...

The `event` array is a collection of events that the cytoscape instance and fire off look at the [events](http://cytoscape.github.io/cytoscape.js/#events) on there site.

The `event` and `action` arrays must have the same number of elements action[1] will be used for event[1] and so on.  For this example on the 'tap' event the 'performZoomIn' action will be performed.

The `bubbleToCore` option allows you to perform an event if a node or edge is clicked but you want the action to be performed during any event.

The `options` is a way to store usable data in this example.  This is not needed to create a tool.


Default Tools
=============
- Zoom Out =
```javascript
[
	{
		icon: 'fa fa-search-plus',
    event: ['tap'],
		selector: 'cy',
		options: {
			cy: {
				zoom: 0.1,
				minZoom: 0.1,
				maxZoom: 10,
				zoomDelay: 45
			}
		},
		bubbleToCore: false,
		tooltip: 'Zoom In',
		action: [performZoomIn]
	}
]
```
- Zoom In =
```javascript
[
	{
		icon: 'fa fa-search-minus',
		event: ['tap'],
		selector: 'cy',
		options: {
			cy: {
				zoom: -0.1,
				minZoom: 0.1,
				maxZoom: 10,
				zoomDelay: 45
			}
		},
		bubbleToCore: false,
		tooltip: 'Zoom Out',
		action: [performZoomOut]
	}
]
```
- Panning =
```javascript
[
	{
		icon: 'fa fa-arrow-right',
		event: ['tap'],
		selector: 'cy',
		options: {
			cy: {
				distance: -80,
			}
		},
		bubbleToCore: true,
		tooltip: 'Pan Right',
		action: [performPanRight]
	},
	{
		icon: 'fa fa-arrow-down',
		event: ['tap'],
		selector: 'cy',
		options: {
			cy: {
				distance: -80,
			}
		},
		bubbleToCore: true,
		tooltip: 'Pan Down',
		action: [performPanDown]
	},
	{
		icon: 'fa fa-arrow-left',
		event: ['tap'],
		selector: 'cy',
		options: {
			cy: {
				distance: 80,
			}
		},
		bubbleToCore: true,
		tooltip: 'Pan Left',
		action: [performPanLeft]
	},
	{
		icon: 'fa fa-arrow-up',
		event: ['tap'],
		selector: 'cy',
		options: {
			cy: {
				distance: 80,
			}
		},
		bubbleToCore: true,
		tooltip: 'Pan Up',
		action: [performPanUp]
	}
]
```
