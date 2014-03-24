(function ($) {

	var defaults = {
		cyContainer: 'cy', // id being used for cytoscape core instance
		tools: [ // an array of tools to list in the toolbar
			[
				{
					icon: 'fa fa-search-plus', // icon from font-awesome-4.0.3, if you want to use something else, then this becomes a class specific for this tool item
					event: ['tap'], // array of cytoscape events that correlates with action variable
					selector: 'cy', // cytoscape selector (cy = core instance, node, edge) - currently not supporting full selection selectors from the documentation
					factors: {
						cy: {
							zoom: 0.1,
							minZoom: 0.1,
							maxZoom: 10,
							zoomDelay: 45
						}
					}, // pass through different parameters for separate selectors
					bubbleToCore: false, // say whether or not the event should be performed if the core instance was not clicked
					tooltip: 'Zoom In', // value for the title attribute of a span element
					action: [performZoomIn] // array of action methods that correlates with the event variable
				}
			],
			[
				{
					icon: 'fa fa-search-minus',
					event: ['tap'],
					selector: 'cy',
					factors: {
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
			],
			[
				{
					icon: 'fa fa-arrow-right',
					event: ['tap'],
					selector: 'cy',
					factors: {
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
					factors: {
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
					factors: {
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
					factors: {
						cy: {
							distance: 80,
						}
					},
					bubbleToCore: true,
					tooltip: 'Pan Up',
					action: [performPanUp]
				}
			],
			[
				{
					icon: 'fa fa-male',
					event: ['tap'],
					selector: 'cy',
					bubbleToCore: false,
					tooltip: 'Person',
					action: [addPersonToGraph]
				},
				{
					icon: 'fa fa-home',
					event: ['tap'],
					selector: 'cy',
					bubbleToCore: false,
					tooltip: 'House',
					action: [addHouseToGraph]
				},
				{
					icon: 'fa fa-building-o',
					event: ['tap'],
					selector: 'cy',
					bubbleToCore: false,
					tooltip: 'Business',
					action: [addBusinessToGraph]
				},
				{
					icon: 'fa fa-truck',
					event: ['tap'],
					selector: 'cy',
					bubbleToCore: false,
					tooltip: 'Automobile',
					action: [addAutoToGraph]
				},
				{
					icon: 'fa fa-plane',
					event: ['tap'],
					selector: 'cy',
					bubbleToCore: false,
					tooltip: 'Asset',
					action: [addAssetToGraph]
				}
			],
			[
				{
					icon: 'fa fa-link',
					event: ['tap'],
					selector: 'node',
					bubbleToCore: false,
					tooltip: 'Link',
					action: [performLink]
				},
				{
					icon: 'fa fa-unlink',
					event: ['tap'],
					selector: 'node',
					bubbleToCore: false,
					tooltip: 'Unlink',
					action: [performUnlink]
				}
			]
		],
		appendTools: false, // set whether or not to append your custom tools list to the default tools list
		position: 'right', // set position of toolbar (top, right, bottom, left)
		toolbarClass: 'ui-cytoscape-toolbar', // set a class name for the toolbar to help with styling
		multipleToolsClass: 'tool-item-list', // set a class name for the tools that should be shown in the same position
		toolItemClass: 'tool-item', //set a class name for a toolbar item to help with styling
		autodisableForMobile: true, // disable the toolbar completely for mobile (since we don't really need it with gestures like pinch to zoom)
		zIndex: 9999 // the z-index of the ui div
	};

	//#region zooming
	function performZoomIn(e) {
		performZoom(e, performZoomIn);
	}

	function performZoomOut(e) {
		performZoom(e, performZoomOut);
	}

	function performZoom(e, action) {
		if (!e.data.canPerform(e, action)) {
			return;
		}

		var toolIndexes = e.data.data.selectedTool;
		var tool = e.data.data.options.tools[toolIndexes[0]][toolIndexes[1]];

		zoom(e.cy, e.originalEvent.offsetX, e.originalEvent.offsetY, tool.factors.cy);
	}

	function zoom(core, x, y, factors) {
		var factor = 1 + factors.zoom;

		var zoom = cy.zoom();
		var lvl = cy.zoom() * factor;

		if (lvl < factors.minZoom) {
			lvl = factors.minZoom;
		}

		if (lvl > factors.maxZoom) {
			lvl = factors.maxZoom;
		}

		if ((lvl == factors.maxZoom && zoom == factors.maxZoom) ||
			(lvl == factors.minZoom && zoom == factors.minZoom)
		) {
			return;
		}

		zoomTo(core, x, y, lvl);
	}

	var zx, zy;
	function zoomTo(core, x, y, level) {
		core.zoom({
			level: level,
			renderedPosition: { x: x, y: y }
		});
	}
	//#endregion

	//#region panning
	function performPanRight(e) {
		performPan(e, performPanRight, 0);
	}

	function performPanDown(e) {
		performPan(e, performPanDown, 1);
	}

	function performPanLeft(e) {
		performPan(e, performPanLeft, 2);
	}

	function performPanUp(e) {
		performPan(e, performPanUp, 3);
	}

	function performPan(e, action, direction) {
		if (!e.data.canPerform(e, action)) {
			return;
		}

		var toolIndexes = e.data.data.selectedTool;
		var tool = e.data.data.options.tools[toolIndexes[0]][toolIndexes[1]];

		pan(e.cy, direction, tool.factors.cy);
	}

	function pan(core, direction, factors) {
		switch (direction) {
			case 0:
			case 2:
				core.panBy({ x: factors.distance, y: 0 });
				break;
			case 1:
			case 3:
				core.panBy({ x: 0, y: factors.distance });
				break;
		}
	}

	function handle2pan(e) {
		var v = {
			x: e.originalEvent.pageX - $panner.offset().left - $panner.width() / 2,
			y: e.originalEvent.pageY - $panner.offset().top - $panner.height() / 2
		}

		var r = options.panDragAreaSize;
		var d = Math.sqrt(v.x * v.x + v.y * v.y);
		var percent = Math.min(d / r, 1);

		if (d < options.panInactiveArea) {
			return {
				x: NaN,
				y: NaN
			};
		}

		v = {
			x: v.x / d,
			y: v.y / d
		};

		percent = Math.max(options.panMinPercentSpeed, percent);

		var vnorm = {
			x: -1 * v.x * (percent * options.panDistance),
			y: -1 * v.y * (percent * options.panDistance)
		};

		return vnorm;
	}

	function positionIndicator(pan) {
		var v = pan;
		var d = Math.sqrt(v.x * v.x + v.y * v.y);
		var vnorm = {
			x: -1 * v.x / d,
			y: -1 * v.y / d
		};

		var w = $panner.width();
		var h = $panner.height();
		var percent = d / options.panDistance;
		var opacity = Math.max(options.panIndicatorMinOpacity, percent);
		var color = 255 - Math.round(opacity * 255);

		$pIndicator.show().css({
			left: w / 2 * vnorm.x + w / 2,
			top: h / 2 * vnorm.y + h / 2,
			background: "rgb(" + color + ", " + color + ", " + color + ")"
		});
	}
	//#endregion

	//#region node tools
	function addPersonToGraph(e) {

	}

	function addHouseToGraph(e) {

	}

	function addBusinessToGraph(e) {

	}

	function addAutoToGraph(e) {

	}

	function addAssetToGraph(e) {

	}
	//#endregion

	//#region linking
	var srcSelection;
	function performLink(e) {
		if (!e.data.canPerform(e, performLink)) {
			return;
		}
	}

	function performUnlink(e) {

	}
	//#endregion

	$.fn.cytoscapeToolbar = function (params) {
		var options = $.extend(true, {}, defaults, params);

		if (options.appendTools) {
			for (var i = 0; i < defaults.tools.length; i++) {
				options.tools.splice(i, 0, defaults.tools[i]);
			}
		}

		var fn = params;
		var $container = $('#' + options.cyContainer);
		var cy;
		var hoveredTool;

		var functions = {
			destroy: function () {
				var data = $(this).data('cytoscapeToolbar');
				var options = data.options;
				var handlers = data.handlers;
				var cy = data.cy;

				// remove bound cy handlers
				for (var i = 0; i < handlers.length; i++) {
					var handler = handlers[i];
					cy.off(handler.events, handler.selector, handler.fn);
				}

				// remove container from dom
				data.$container.remove();
			},

			canPerform: function (e, fn) {
				var toolIndexes = e.data.data.selectedTool;
				var tool = e.data.data.options.tools[toolIndexes[0]][toolIndexes[1]];
				var handlerIndex = e.data.handlerIndex;

				if (!(toolIndexes === undefined) && $.inArray(fn, tool.action) > -1) {
					var selector = e.data.data.handlers[handlerIndex].selector;

					switch (selector) {
						case 'node':
							return e.cyTarget.isNode();
						case 'edge':
							return e.cyTarget.isEdge();
						case 'cy':
							return e.cyTarget == cy || tool.bubbleToCore;
					}
				}

				return false;
			},

			init: function () {
				// check for a mobile device
				var browserIsMobile = 'ontouchstart' in window;

				// **** REMOVE THIS CHECK IF YOU DON'T CARE ABOUT SHOWING IT IN MOBILE 
				// don't do anything because this plugin hasn't been tested for mobile
				if (browserIsMobile && options.autodisableForMobile) {
					return $(this);
				}

				// setup an object to hold data needed for the future
				var data = {
					selectedTool: undefined,
					options: options,
					handlers: []
				};

				// setup default css values
				var cssOptions = {
					position: 'absolute',
					top: 0,
					left: 0,
					width: 0,
					height: 0,
					minWidth: 0,
					minHeight: 0,
					maxWidth: 0,
					maxHeight: 0,
					zIndex: options.zIndex
				};

				// check for toolbar position to calculate CSS position values
				if (options.position === 'top') {
					cssOptions.top = $container.offset().top - 45;
					cssOptions.left = $container.offset().left;
					cssOptions.width = $container.outerWidth(true);
					cssOptions.minWidth = $container.outerWidth(true);
					cssOptions.maxWidth = $container.outerWidth(true);
				} else if (options.position === 'bottom') {
					cssOptions.top = $container.offset().top + $container.outerHeight(true);
					cssOptions.left = $container.offset().left;
					cssOptions.width = $container.outerWidth(true);
					cssOptions.minWidth = $container.outerWidth(true);
					cssOptions.maxWidth = $container.outerWidth(true);
				} else if (options.position === 'left') {
					cssOptions.top = $container.offset().top;
					cssOptions.left = $container.offset().left - 45;
					cssOptions.height = $container.outerHeight(true);
					cssOptions.minHeight = $container.outerHeight(true);
					cssOptions.maxHeight = $container.outerHeight(true);
				} else { // default - it is either 'right' or it is something we don't know so we use the default value of 'right'
					cssOptions.top = $container.offset().top;
					cssOptions.left = $container.offset().left + $container.outerWidth(true);
					cssOptions.height = $container.outerHeight(true);
					cssOptions.minHeight = $container.outerHeight(true);
					cssOptions.maxHeight = $container.outerHeight(true);
				}

				// create toolbar element with applied css
				var $toolbar = $('<div class="' + options.toolbarClass + '"></div>')
									.css(cssOptions)
				data.$container = $toolbar;

				$toolbar.appendTo('body');

				$.each(options.tools, function (toolListIndex, toolList) {
					var $toolListWrapper = $('<div class="' + options.multipleToolsClass + '-wrapper"></div>')
												.css({
													width: 45,
													height: 45,
													position: 'relative',
													overflow: 'hidden'
												});

					$toolbar.append($toolListWrapper);

					if (toolList.length > 1) {
						var $moreArrow = $('<span class="fa fa-caret-right"></span>')
											.css({
												'background-color': 'transparent',
												position: 'absolute',
												top: 28,
												left: 35,
												zIndex: 9999
											});
						$toolListWrapper.append($moreArrow);
					}

					var $toolList = $('<div class="' + options.multipleToolsClass + '"></div>')
										.css({
											position: 'absolute',
											width: toolList.length * 45,
											height: 45,
											'background-color': '#ddd'
										});

					$toolListWrapper.append($toolList);

					$.each(toolList, function (toolIndex, element) {
						var padding = "";

						if (toolIndex != options.tools.length - 1) {
							if (options.position === 'top' || options.position === 'bottom') {
								padding = "padding: 10px 0 10px 10px;";
							} else if (options.position === 'right' || options.position === 'left') {
								padding = "padding: 10px 10px 0 10px;";
							}
						} else {
							padding = "padding: 10px;";
						}

						var clazz = options.toolItemClass + ' icon ' + element.icon + ' tooltip';
						var style = 'cursor: pointer; color: #aaa; font-size: 24px; ' + padding;

						var jElement = $('<span ' +
							'id="tool-' + toolListIndex + '-' + toolIndex + '" ' +
							'class="' + clazz + '" ' +
							'style="' + style + '" ' +
							'title="' + element.tooltip + '" ' +
							'data-tool="' + toolListIndex + ',' + toolIndex + '"' +
							'></span>');

						data.options.tools[toolListIndex][toolIndex].element = jElement;

						$toolList.append(jElement);

						var pressTimer;
						var startTime, endTime;
						var toolItemLongHold = false;

						jElement
							.mousedown(function () {
								startTime = new Date().getTime();
								endTime = startTime;

								pressTimer = window.setTimeout(function () {
									if (startTime == endTime) {
										toolItemLongHold = true;
										$toolListWrapper.css('overflow', 'visible');
									}
								}, 1000);
							})
							.mouseup(function () {
								endTime = new Date().getTime();

								if (data.selectedTool != [toolListIndex, toolIndex] && !toolItemLongHold) {
									if (data.selectedTool != undefined) {
										data.options.tools[data.selectedTool[0]][data.selectedTool[1]].element.css('color', '#aaa');
									}
									data.selectedTool = [toolListIndex, toolIndex];
									$('.' + options.toolbarClass).find('.selected-tool').removeClass('selected-tool');
									$(this).addClass('selected-tool');
									$(this).css('color', '#000');
								}
							});
						;

						$(window)
							.mouseup(function (e) {
								if (toolItemLongHold) {
									var moveLeft = 0;
									$.each(hoveredTool.parent().children(), function (index, element) {
										if (hoveredTool.index() == index) {
											return false;
										}

										moveLeft += $(element).outerWidth(true);
									});
									var indexes = hoveredTool.attr('data-tool').split(',');
									data.selectedTool = indexes;
									var offsetLeft = 0 - moveLeft;
									$toolList.css('left', offsetLeft);
									$toolListWrapper.css('overflow', 'hidden');
									$('.' + options.toolbarClass).find('.selected-tool').removeClass('selected-tool');
									hoveredTool.addClass('selected-tool');
									clearTimeout(pressTimer);
									toolItemLongHold = false;
									startTime = -1;
									endTime = -1;
									return false;
								}
							})
						;

						jElement
							.hover(function () {
								hoveredTool = $(this);

								hoveredTool.css('color', '#000');
							}, function () {
								if (hoveredTool.hasClass('selected-tool')) {
									hoveredTool.css('color', '000');
								} else {
									hoveredTool.css('color', '#aaa');
								}
							})
						;
					});
				});

				var bindings = {
					on: function (event, selector, action) {
						var index = data.handlers.push({
							events: event,
							selector: selector,
							action: action
						});

						var eventData = {
							data: data,
							handlerIndex: index - 1,
							canPerform: functions.canPerform
						};

						if (selector === 'cy') {
							cy.bind(event, eventData, action);
						} else {
							cy.on(event, selector, eventData, action);
						}

						return this;
					}
				};

				function addEventListeners() {
					$.each(options.tools, function (index, toolList) {
						$.each(toolList, function (index, toolElement) {
							var unequalsLengths = false;

							if (toolElement.event.length != toolElement.action.length) {
								var tooltip = (toolElement.tooltip) ? toolElement.tooltip : "<no tooltip>";
								console.log("Unequal lengths for event and action variables on " + index + "-" + tooltip);
								unequalsLengths = true;
							}

							if (!unequalsLengths) {
								for (var i = 0; i < toolElement.event.length; i++) {
									bindings.on(toolElement.event[i], toolElement.selector, toolElement.action[i]);
								}
							}
						});
					});
				}

				$container.cytoscape(function (e) {
					cy = this;
					data.cy = cy;

					addEventListeners();

					$container.data('cytoscapeToolbar', data);
				});
			}
		};

		if (functions[fn]) {
			return functions[fn].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof fn == 'object' || !fn) {
			return functions.init.apply(this, arguments);
		} else {
			$.error("No such function `" + fn + "` for jquery.cytoscapeToolbar");
		}

		return $(this);
	};

	$.fn.cyToolbar = $.fn.cytoscapeToolbar;

})(jQuery);