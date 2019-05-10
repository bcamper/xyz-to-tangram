(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.xyzToTangram = factory());
}(this, function () { 'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var btoa = createCommonjsModule(function (module) {
	(function () {

	  function btoa(str) {
	    var buffer;

	    if (str instanceof Buffer) {
	      buffer = str;
	    } else {
	      buffer = Buffer.from(str.toString(), 'binary');
	    }

	    return buffer.toString('base64');
	  }

	  module.exports = btoa;
	}());
	});

	var parser = createCommonjsModule(function (module) {
	(function (root, factory) {
	    if (module.exports) {
	        // Node. Does not work with strict CommonJS, but
	        // only CommonJS-like environments that support module.exports,
	        // like Node.
	        module.exports = factory();
	    } else {
	        // Browser globals
	        root.cssFontParser = factory();
	    }
	}(commonjsGlobal, function (b) {
	  /**
	   * @enum {number}
	   */
	  var states = {
	    VARIATION: 1,
	    LINE_HEIGHT: 2,
	    FONT_FAMILY: 3,
	    BEFORE_FONT_FAMILY: 4
	  };

	  /**
	   * Attempt to parse a string as an identifier. Return
	   * a normalized identifier, or null when the string
	   * contains an invalid identifier.
	   *
	   * @param {string} str
	   * @return {string|null}
	   */
	  function parseIdentifier(str) {
	    var identifiers = str.replace(/^\s+|\s+$/, '').replace(/\s+/g, ' ').split(' ');

	    for (var i = 0; i < identifiers.length; i += 1) {
	      if (/^(-?\d|--)/.test(identifiers[i]) ||
	           !/^([_a-zA-Z0-9-]|[^\0-\237]|(\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\\[^\n\r\f0-9a-f]))+$/.test(identifiers[i])) {
	        return null;
	      }
	    }
	    return identifiers.join(' ');
	  }

	  /**
	   * @param {string} input
	   * @return {Object|null}
	   */
	  function parse(input) {
	    var state = states.VARIATION,
	        buffer = '',
	        result = {
	          'font-family': []
	        };

	    for (var c, i = 0; c = input.charAt(i); i += 1) {
	      if (state === states.BEFORE_FONT_FAMILY && (c === '"' || c === "'")) {
	        var index = i + 1;

	        // consume the entire string
	        do {
	          index = input.indexOf(c, index) + 1;
	          if (!index) {
	            // If a string is not closed by a ' or " return null.
	            return null;
	          }
	        } while (input.charAt(index - 2) === '\\');

	        result['font-family'].push(input.slice(i, index));

	        i = index - 1;
	        state = states.FONT_FAMILY;
	        buffer = '';
	      } else if (state === states.FONT_FAMILY && c === ',') {
	        state = states.BEFORE_FONT_FAMILY;
	        buffer = '';
	      } else if (state === states.BEFORE_FONT_FAMILY && c === ',') {
	        var identifier = parseIdentifier(buffer);

	        if (identifier) {
	          result['font-family'].push(identifier);
	        }
	        buffer = '';
	      } else if (state === states.VARIATION && (c === ' ' || c === '/')) {
	        if (/^((xx|x)-large|(xx|s)-small|small|large|medium)$/.test(buffer) ||
	            /^(larg|small)er$/.test(buffer) ||
	            /^(\+|-)?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)$/.test(buffer)) {
	          state = c === '/' ? states.LINE_HEIGHT : states.BEFORE_FONT_FAMILY;
	          result['font-size'] = buffer;
	        } else if (/^(italic|oblique)$/.test(buffer)) {
	          result['font-style'] = buffer;
	        } else if (/^small-caps$/.test(buffer)) {
	          result['font-variant'] = buffer;
	        } else if (/^(bold(er)?|lighter|[1-9]00)$/.test(buffer)) {
	          result['font-weight'] = buffer;
	        } else if (/^((ultra|extra|semi)-)?(condensed|expanded)$/.test(buffer)) {
	          result['font-stretch'] = buffer;
	        }
	        buffer = '';
	      } else if (state === states.LINE_HEIGHT && c === ' ') {
	        if (/^(\+|-)?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)?$/.test(buffer)) {
	          result['line-height'] = buffer;
	        }
	        state = states.BEFORE_FONT_FAMILY;
	        buffer = '';
	      } else {
	        buffer += c;
	      }
	    }

	    // This is for the case where a string was specified followed by
	    // an identifier, but without a separating comma.
	    if (state === states.FONT_FAMILY && !/^\s*$/.test(buffer)) {
	      return null;
	    }

	    if (state === states.BEFORE_FONT_FAMILY) {
	      var identifier = parseIdentifier(buffer);

	      if (identifier) {
	        result['font-family'].push(identifier);
	      }
	    }

	    if (result['font-size'] && result['font-family'].length) {
	      return result;
	    } else {
	      return null;
	    }
	  }

	  return parse;
	}));
	});

	// choose browser or node implementation of btoa
	var btoa$1 = (typeof window !== 'undefined' && window.btoa) || btoa;

	function xyzToTangram(xyzStyle, ref) {
	    if ( ref === void 0 ) ref = {};
	    var setStartPosition = ref.setStartPosition; if ( setStartPosition === void 0 ) setStartPosition = true;
	    var collide = ref.collide; if ( collide === void 0 ) collide = true;


	    // Add Tangram scene elements so that insertion order matches Tangram idioms
	    // (camera first, then sources, styles before layers, etc.)
	    var scene = {};
	    if (setStartPosition) {
	        scene.cameras = makeCamera(xyzStyle);
	    }
	    scene.sources = makeSources(xyzStyle);
	    scene.styles = makeStyles();
	    scene.layers = makeLayers(xyzStyle, { collide: collide });
	    scene.meta = makeMeta(xyzStyle);

	    return scene;
	}

	// add subject of XYZ Studio JSON as scene metadata
	// useful for cards functionality, and general reference/debugging
	function makeMeta(xyz) {
	    var meta = {};
	    meta.xyz = { // put under XYZ-specific namespace
	        id: xyz.id,
	        meta: xyz.meta,
	        bookmarks: xyz.bookmarks,
	        publish_settings: xyz.publish_settings,
	        layers: xyz.layers.map(function (layer) {
	            return {
	                id: layer.id,
	                meta: layer.meta,
	                geospace: layer.geospace,
	                cards: layer.cards.filter(function (c) { return c.length > 0; })
	            };
	        })
	    };
	    return meta;
	}

	function makeCamera(xyz) {
	    var pos = xyz.map_settings;
	    if (pos &&
	        pos.center &&
	        pos.center.length === 2 &&
	        pos.zoom) {
	        return {
	            xyz: {
	                position: [pos.center[1], pos.center[0], pos.zoom].map(Number),
	                active: true
	            }
	        };
	    }
	}

	function getXYZLayerName(xyzLayer, index) {
	    return (xyzLayer.meta && xyzLayer.meta.title) || ("layer-" + index);
	}

	function makeSources(xyz) {
	    // https://xyz.api.here.com/hub/spaces/{space}/tile/web/{z}_{x}_{y}
	    return xyz.layers.reduce(function (tgSources, xyzLayer, index) {
	        var spaceId = xyzLayer.geospace.id;
	        var name = getXYZLayerName(xyzLayer, index);
	        var access_token = xyz.rot;

	        tgSources[name] = {
	            type: 'GeoJSON',
	            // url: `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/web/{z}_{x}_{y}`,
	            url: ("https://xyz.api.here.com/hub/spaces/" + spaceId + "/tile/quadkey/{q}"),
	            url_params: {
	                access_token: access_token,
	                clip: true
	            },
	            max_zoom: 16, // best default?
	            zooms: [0, 2, 4, 6, 8, 10, 12, 14, 16] // load every other zoom
	        };

	        // add layer bounding box if available (sometimes `bbox` property is an empty array)
	        if (Array.isArray(xyzLayer.bbox) && xyzLayer.bbox.length === 4) {
	            tgSources[name].bounds = xyzLayer.bbox;
	        }

	        return tgSources;
	    }, {});
	}

	function makeStyles() {
	    // One style per geometry type, with overlay blending
	    return ['polygons', 'lines', 'points', 'text'].reduce(function (tgStyles, geomType) {
	        tgStyles[("XYZ_" + geomType)] = {
	            base: geomType,
	            blend: 'overlay'
	        };
	        return tgStyles;
	    }, {});
	}

	function makeLayers(xyz, tgOptions) {
	    // TODO: more general handling of visible flag
	    return xyz.layers.filter(function (x) { return x.visible; }).reduce(function (tgLayers, xyzLayer, xyzLayerIndex) {
	        // Make one enclosing Tangram layer for the entire XYZ layer,
	        // and then one sub-layer for each geometry type present in the XYZ layer
	        var xyzLayerName = getXYZLayerName(xyzLayer, xyzLayerIndex);
	        tgLayers[xyzLayerName] = {
	            data: {
	                source: xyzLayerName
	            }
	        };

	        // The geometry types in this XYZ layer (Point, Line, Polygon)
	        var geomTypes = []; // `geometries` field is unreliable, doesn't always match features present in layer
	        var geomCounts = xyzLayer.geometriesCount; // use `geometriesCount` instead
	        if (geomCounts) {
	            if (geomCounts['Point'] || geomCounts['MultiPoint']) { geomTypes.push('Point'); }
	            if (geomCounts['LineString'] || geomCounts['MultiLineString']) { geomTypes.push('Line'); }
	            if (geomCounts['Polygon'] || geomCounts['MultiPolygon']) { geomTypes.push('Polygon'); }
	        }
	        else { // sometimes `geometriesCount` is also missing, check for all geometry types in this case
	            geomTypes.push('Point', 'Line', 'Polygon');
	        }

	        geomTypes.forEach(function (geomType) {
	            makeGeometryTypeLayer({ xyz: xyz, xyzLayer: xyzLayer, xyzLayerIndex: xyzLayerIndex, geomType: geomType, tgLayers: tgLayers, tgOptions: tgOptions });
	        });

	        return tgLayers;
	    }, {});
	}

	function makeGeometryTypeLayer(ref) {
	    var xyz = ref.xyz;
	    var xyzLayer = ref.xyzLayer;
	    var xyzLayerIndex = ref.xyzLayerIndex;
	    var geomType = ref.geomType;
	    var tgLayers = ref.tgLayers;
	    var tgOptions = ref.tgOptions;


	    // Tangram sub-layer for all features with this geometry type
	    var xyzLayerName = getXYZLayerName(xyzLayer, xyzLayerIndex);
	    var tgGeomLayer = tgLayers[xyzLayerName][geomType] = {
	        filter: {
	            $geometry: geomType.toLowerCase()
	        }
	    };

	    // Make further Tagram sub-layers, one per XYZ layer style group
	    var styleGroupPrefix = (geomType.toLowerCase()) + "Style";
	    var styleGroups = Object.entries(xyzLayer.styleGroups).filter(function (ref) {
	        var k = ref[0];

	        return k.startsWith(styleGroupPrefix);
	    });
	    var styleRules = (xyzLayer.styleRules && xyzLayer.styleRules[geomType]) || [];

	    styleGroups.forEach(function (ref) {
	        var styleGroupName = ref[0];
	        var styleGroup = ref[1];

	        // Find XYZ style rule for this style (if one exists), and create Tangram layer filter
	        makeStyleGroupLayer({
	            xyz: xyz, xyzLayerName: xyzLayerName, xyzLayerIndex: xyzLayerIndex,
	            styleRules: styleRules, styleGroupName: styleGroupName, styleGroup: styleGroup, styleGroupPrefix: styleGroupPrefix,
	            tgGeomLayer: tgGeomLayer, tgOptions: tgOptions
	        });
	    });
	}

	function makeStyleGroupLayer(ref) {
	    var styleRules = ref.styleRules;
	    var styleGroupName = ref.styleGroupName;
	    var styleGroupPrefix = ref.styleGroupPrefix;
	    var styleGroup = ref.styleGroup;
	    var tgGeomLayer = ref.tgGeomLayer;
	    var tgOptions = ref.tgOptions;
	    var xyzLayerName = ref.xyzLayerName;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;


	    // Match XYZ style rules for this style group, and create Tangram filter
	    var ref$1 = matchStyleRules({ styleRules: styleRules, styleGroupName: styleGroupName, styleGroupPrefix: styleGroupPrefix });
	    var tgFilter = ref$1.tgFilter;
	    var priority = ref$1.priority;

	    // Create Tangram sub-layer for this XYZ style group
	    // These layers are mutually exclusive, and matching priority is determined by the order of styleRules
	    // Style groups that don't match a rule (e.g. default / not-conditional style groups) are matched last
	    var tgStyleLayer = tgGeomLayer[styleGroupName] = {
	        priority: priority,
	        exclusive: true
	    };
	    if (tgFilter != null) {
	        tgStyleLayer.filter = tgFilter;
	    }

	    // Combine circle styles: XYZ has two circle styles (one for the outline, one for the fill),
	    // while Tangram can represent this as a single draw group, as a point with an outline.
	    // coalesceCircleStyles(styleGroup);

	    // Combine icon and circle/rect shapes into a single SVG
	    compositeIcons(styleGroup);

	    // Create Tangram draw groups, one for each XYZ style in this style group
	    tgStyleLayer.draw = styleGroup
	        .filter(function (s) { return s.opacity > 0; }) // this seems to be used as a general filter to disable symbolizers?
	        .filter(function (s) { return !s.skip; }) // skip pre-processed styles (they've been coalesced into others)
	        .reduce(function (draw, style, styleIndex) {
	            // Add Tangram draw groups for each XYZ style object
	            if (style.type === 'Polygon') {
	                // Polygon fill
	                makePolygonStyleLayer({ style: style, styleIndex: styleIndex, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex, tgOptions: tgOptions });
	            }
	            else if (style.type === 'Line') {
	                // Line stroke
	                makeLineStyleLayer({ style: style, styleIndex: styleIndex, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex, tgOptions: tgOptions });
	            }
	            else if (style.type === 'Circle') {
	                // Circle point
	                makeCircleStyleLayer({ style: style, styleIndex: styleIndex, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex, tgOptions: tgOptions });
	            }
	            else if (style.type === 'Image') {
	                // Circle point
	                makeImageStyleLayer({ style: style, styleIndex: styleIndex, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex, tgOptions: tgOptions });
	            }
	            else if (style.type === 'Text') {
	                // Text label
	                makeTextStyleLayer({ style: style, styleIndex: styleIndex, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex, tgOptions: tgOptions });
	            }
	            return draw;
	        }, {});
	}

	function matchStyleRules(ref) {
	    var styleRules = ref.styleRules;
	    var styleGroupName = ref.styleGroupName;
	    var styleGroupPrefix = ref.styleGroupPrefix;

	    var rule = styleRules.find(function (rule) { return styleGroupName === (styleGroupPrefix + "_" + (rule.id)); });
	    var priority = styleRules.length;
	    var tgFilter;
	    if (rule) {
	        priority = styleRules.findIndex(function (rule) { return styleGroupName === (styleGroupPrefix + "_" + (rule.id)); });
	        tgFilter = makeFilter(rule);
	    }
	    return { tgFilter: tgFilter, priority: priority };
	}

	// Build a Tangram layer filter for an XYZ style rule
	function makeFilter(styleRule) {
	    if (styleRule == null) {
	        return;
	    }

	    var rules = styleRule.r[0]; // TODO: handle multi-element OR properties (Studio doesn't currently support)
	    var conditions = [];
	    rules.forEach(function (rule) {
	        switch (rule.operator) {
	            case 'eq': // equals
	                conditions.push(("feature['" + (rule.property) + "'] === " + (quoteValue(rule.value))));
	                break;
	            case 'neq': // not equals
	                conditions.push(("feature['" + (rule.property) + "'] !== " + (quoteValue(rule.value))));
	                break;
	            case 'lt': // less than
	                conditions.push(("feature['" + (rule.property) + "'] < " + (quoteValue(rule.value))));
	                break;
	            case 'gt': // greater than
	                conditions.push(("feature['" + (rule.property) + "'] > " + (quoteValue(rule.value))));
	                break;
	            case 'em': // is empty
	                conditions.push(("feature['" + (rule.property) + "'] == null"));
	                break;
	            case 'nem': // is not empty
	                conditions.push(("feature['" + (rule.property) + "'] != null"));
	                break;
	        }
	    });

	    if (conditions.length === 0) {
	        return;
	    }

	    var filter = "function() { return " + (conditions/*.map(c => `(${c})`)*/.join(' && ')) + "; }";
	    return filter;
	}

	function makePolygonStyleLayer(ref) {
	    var style = ref.style;
	    var styleIndex = ref.styleIndex;
	    var draw = ref.draw;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;

	    // Polygon fill
	    var tgFillDrawGroupName = (style.type) + "_" + styleIndex + "_fill";
	    draw[tgFillDrawGroupName] = {
	        interactive: true,
	        style: 'XYZ_polygons',
	        color: style.fill,
	        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
	    };

	    // Polygon stroke
	    var tgStrokeDrawGroupName = (style.type) + "_" + styleIndex + "_stroke";
	    draw[tgStrokeDrawGroupName] = {
	        interactive: true,
	        style: 'XYZ_lines',
	        color: style.stroke,
	        width: ((style.strokeWidth) + "px"),
	        cap: style.strokeLinecap,
	        join: style.strokeLinejoin,
	        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
	    };

	    if (hasDash(style.strokeDasharray)) {
	        draw[tgStrokeDrawGroupName].dash = style.strokeDasharray;
	    }
	}

	function makeLineStyleLayer(ref) {
	    var style = ref.style;
	    var styleIndex = ref.styleIndex;
	    var draw = ref.draw;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;

	    var tgStrokeDrawGroupName = (style.type) + "_" + styleIndex + "_stroke";
	    draw[tgStrokeDrawGroupName] = {
	        interactive: true,
	        style: 'XYZ_lines',
	        color: style.stroke,
	        width: ((style.strokeWidth) + "px"),
	        cap: style.strokeLinecap,
	        join: style.strokeLinejoin,
	        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
	    };

	    if (hasDash(style.strokeDasharray)) {
	        draw[tgStrokeDrawGroupName].dash = style.strokeDasharray;
	    }
	}

	function makeCircleStyleLayer(ref) {
	    var style = ref.style;
	    var styleIndex = ref.styleIndex;
	    var draw = ref.draw;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;
	    var tgOptions = ref.tgOptions;

	    var tgPointDrawGroupName = (style.type) + "_" + styleIndex + "_point";
	    draw[tgPointDrawGroupName] = {
	        interactive: true,
	        collide: tgOptions.collide,
	        priority: getLabelPriority(xyz.layers, xyzLayerIndex, tgOptions),
	        style: 'XYZ_points',
	        color: style.fill,
	        size: ((style.radius * 2) + "px"),
	        // size: [`${style.width}px`, `${style.height}px`],
	        offset: getOffset(style),
	        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
	    };
	    if (style.outline) {
	        draw[tgPointDrawGroupName].outline = {
	            color: style.outline.fill,
	            width: ((style.outline.radius - style.radius) + "px")
	        };
	    }
	}

	function makeImageStyleLayer(ref) {
	    var style = ref.style;
	    var styleIndex = ref.styleIndex;
	    var draw = ref.draw;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;
	    var tgOptions = ref.tgOptions;

	    var tgPointDrawGroupName = (style.type) + "_" + styleIndex + "_point";
	    draw[tgPointDrawGroupName] = {
	        interactive: true,
	        collide: tgOptions.collide,
	        priority: getLabelPriority(xyz.layers, xyzLayerIndex, tgOptions),
	        style: 'XYZ_points',
	        size: [((style.width) + "px"), ((style.height) + "px")],
	        texture: style.src,
	        offset: getOffset(style),
	        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
	    };

	    // optionally attached text label
	    if (style.text) {
	        var textDraws = {};
	        makeTextStyleLayer({
	            style: style.text, styleIndex: 0,
	            draw: textDraws,
	            xyz: xyz, xyzLayerIndex: xyzLayerIndex,
	            tgOptions: Object.assign({}, tgOptions, {priority: 2}) // default attached text labels to lower priority than parent
	        });
	        var text = Object.values(textDraws)[0];
	        if (text) {
	            draw[tgPointDrawGroupName].text = text;
	            text.optional = true; // attached text labels are preferred but optional
	        }
	    }
	}

	function makeTextStyleLayer(ref) {
	    var style = ref.style;
	    var styleIndex = ref.styleIndex;
	    var draw = ref.draw;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;
	    var tgOptions = ref.tgOptions;

	    var tgTextDrawGroupName = (style.type) + "_" + styleIndex + "_text";
	    draw[tgTextDrawGroupName] = {
	        interactive: true,
	        collide: true, // always collide text labels (no real downside)
	        priority: getLabelPriority(xyz.layers, xyzLayerIndex, tgOptions),
	        style: 'XYZ_text',
	        text_source: ("function() { var properties = feature; return " + (style.textRef) + "; }"),
	        font: {
	            fill: style.fill,
	            stroke: {
	                color: style.stroke,
	                width: ((style.strokeWidth) + "px")
	            }
	        },
	        offset: getOffset(style),
	        anchor: 'center',
	        // repeat_distance: '1000px',
	        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
	    };

	    // parse XYZ font field
	    var font = parser(style.font);
	    if (font['font-family'].length > 0) {
	        draw[tgTextDrawGroupName].font.family = font['font-family'][0]; // use first family in list
	    }

	    draw[tgTextDrawGroupName].font.size = font['font-size'] || '12px';

	    if (font['font-style']) {
	        draw[tgTextDrawGroupName].font.style = font['font-style'];
	    }

	    if (font['font-weight']) {
	        draw[tgTextDrawGroupName].font.weight = font['font-weight'];
	    }
	}

	// Calculate Tangram blend order based on XYZ layer position and style zIndex
	function getBlendOrder(style, xyzLayers, xyzLayerIndex) {
	    var tgBlendOrderBase = 1;
	    var tgBlendOrderMultiplier = 0.001;
	    var blendOrder = style.zIndex * tgBlendOrderMultiplier + (xyzLayers.length - xyzLayerIndex) + tgBlendOrderBase;
	    return Number(blendOrder.toFixed(3)); // cap digit precision
	}

	// Calculate Tangram label priority based on XYZ layer position
	function getLabelPriority(xyzLayers, xyzLayerIndex, tgOptions) {
	    var tgPriorityBase = 0;
	    var tgPriorityMultiplier = 0.1;
	    return (xyzLayerIndex * tgPriorityMultiplier + tgPriorityBase) +
	        ((tgOptions.priority == null ? 1 : tgOptions.priority) * tgPriorityMultiplier * 0.5);
	}

	// Filters out XYZ style placeholder dasharray values that actually indicate solid line
	function hasDash(strokeDasharray) {
	    if (strokeDasharray && strokeDasharray[0] == 0 && strokeDasharray[1] == 0) {
	        return false;
	    }
	    return true;
	}

	// Get the offset value from an XYZ style as an array
	function getOffset(style) {
	    return [style.offsetX || 0, style.offsetY || 0];
	}

	// Combine icon and circle/rect shapes into a single SVG
	// This allows markers to properly overlap and collide
	function compositeIcons(styleGroup) {
	    var shapes = styleGroup
	        .filter(function (s) { return s.opacity > 0; })
	        .filter(function (s) { return ['Circle', 'Rect', 'Image'].indexOf(s.type) > -1; })
	        .sort(function (a, b) { return a.zIndex - b.zIndex; });

	    if (shapes.length === 0) {
	        return;
	    }

	    // find width/height incorporating offsets
	    var maxOffsetWidth = Math.max.apply(Math, shapes.map(function (s) { return Math.abs(s.offsetX || 0); }).filter(function (x) { return x != null; }));
	    var maxOffsetHeight = Math.max.apply(Math, shapes.map(function (s) { return Math.abs(s.offsetY || 0); }).filter(function (x) { return x != null; }));
	    var width = Math.max.apply(Math, shapes.map(function (s) { return s.width; }).filter(function (x) { return x != null; })) + maxOffsetWidth;
	    var height = Math.max.apply(Math, shapes.map(function (s) { return s.height; }).filter(function (x) { return x != null; })) + maxOffsetHeight;

	    var svg =
	        "<svg width=\"" + width + "\" height=\"" + height + "\" viewBox=\"0 0 " + width + " " + height + "\" version=\"1.1\"\n            xmlns=\"http://www.w3.org/2000/svg\"\n            xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n";

	    shapes.forEach(function (s) {
	        // <circle cx="25" cy="25" r="20" style="fill: red; stroke: black; stroke-width: 3px;" />
	        // <rect x="5" y="5" width="30" height="30" style="fill: red; stroke: black; stroke-width: 3px;" />
	        // <image x="0" y="0" width="50" height="50" xlink:href="${url}" />

	        var offsetX = (s.offsetX || 0) + (width / 2);
	        var offsetY = (s.offsetY || 0) + (height / 2);

	        if (s.type === 'Circle') {
	            var style = "fill: " + (s.fill) + "; ";
	            if (s.stroke && s.strokeWidth) {
	                style += "stroke: " + (s.stroke) + "; stroke-width: " + (s.strokeWidth) + "px;";
	            }
	            svg += "<circle cx=\"" + offsetX + "\" cy=\"" + offsetY + "\" r=\"" + (s.radius) + "\" style=\"" + style + "\" />\n";
	        }
	        if (s.type === 'Rect') {
	            var style$1 = "fill: " + (s.fill) + "; ";
	            if (s.stroke && s.strokeWidth) {
	                style$1 += "stroke: " + (s.stroke) + "; stroke-width: " + (s.strokeWidth) + "px;";
	            }
	            svg += "<rect x=\"" + (offsetX - s.width / 2) + "\" y=\"" + (offsetY - s.height / 2) + "\" width=\"" + (s.width) + "\" height=\"" + (s.height) + "\" style=\"" + style$1 + "\" />\n";
	        }
	        else if (s.type === 'Image') {
	            svg += "<image x=\"" + (offsetX - s.width / 2) + "\" y=\"" + (offsetY - s.height / 2) + "\" width=\"" + (s.width) + "\" height=\"" + (s.height) + "\" xlink:href=\"" + (s.src) + "\"/>\n";
	        }

	        s.skip = true;
	    });

	    svg += '</svg>';
	    var url = "data:image/svg+xml;base64," + (btoa$1(svg)); // encode SVG as data URL

	    // Create a new Image style for the composited SVG
	    var image = {
	        type: 'Image',
	        width: width,
	        height: height,
	        zIndex: shapes[shapes.length - 1].zIndex, // max zIndex is last
	        src: url,
	        opacity: 1
	    };

	    // Optionally attach a text label, if exactly one is found
	    var texts = styleGroup.filter(function (s) { return s.type === 'Text' && s.opacity > 0; });
	    if (texts.length === 1) {
	        var text = texts[0];
	        image.text = text;
	        text.skip = true;
	    }

	    styleGroup.push(image); // add new composited SVG
	}

	// Utility functions

	function quoteValue(value) {
	    // quote non-numeric values
	    return (isNaN(Number(value)) ? ("'" + value + "'") : Number(value));
	}

	return xyzToTangram;

}));
