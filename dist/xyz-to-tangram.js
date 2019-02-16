(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.xyzToTangram = factory());
}(this, function () { 'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

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

	function xyzToTangram(xyzStyle, ref) {
	    if ( ref === void 0 ) ref = {};
	    var setStartPosition = ref.setStartPosition; if ( setStartPosition === void 0 ) setStartPosition = true;

	    var scene = {
	        sources: makeSources(xyzStyle),
	        styles: makeStyles(xyzStyle),
	        layers: makeLayers(xyzStyle)
	    };

	    if (setStartPosition) {
	        scene.cameras = makeCamera(xyzStyle);
	    }

	    return scene;
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
	            url: ("https://xyz.api.here.com/hub/spaces/" + spaceId + "/tile/web/{z}_{x}_{y}"),
	            url_params: {
	                access_token: access_token,
	                clip: true
	            }
	        };
	        return tgSources;
	    }, {});
	}

	function makeStyles(xyz) {
	    return xyz.layers.reduce(function (tgStyles, xyzLayer, index) {
	        // One style per layer per geometry type
	        var xyzLayerName = getXYZLayerName(xyzLayer, index);
	        ['polygons', 'lines', 'points', 'text'].forEach(function (geomType, geomIndex) {
	            tgStyles[(xyzLayerName + "_" + geomType)] = {
	                base: geomType,
	                blend: (geomType === 'polygons' || geomType === 'lines') ? 'translucent' : 'overlay',
	                // blend: 'overlay',
	                blend_order: (xyz.layers.length - index + geomIndex/4) // TODO: revisit fractional blend order?
	            };
	        });
	        return tgStyles;
	    }, {});
	}

	var tgLayerOrderBase = 1000; // Tangram layer order starting position for XYZ layers
	var tgLayerOrderMultiplier = 100; // Tangram layer order "space" inserted between XYZ layers

	function makeLayers(xyz) {
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
	            makeGeometryTypeLayer({ xyz: xyz, xyzLayer: xyzLayer, xyzLayerIndex: xyzLayerIndex, geomType: geomType, tgLayers: tgLayers });
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

	    var tgDrawGroups = []; // list of Tangram draw groups generated for this geometry layer
	    var tgStyleLayers = {}; // Tangram sub-layer keyed by XYZ style group

	    styleGroups.forEach(function (ref) {
	        var styleGroupName = ref[0];
	        var styleGroup = ref[1];

	        // Find XYZ style rule for this style (if one exists), and create Tangram layer filter
	        makeStyleGroupLayer({
	            styleRules: styleRules, styleGroupName: styleGroupName, styleGroupPrefix: styleGroupPrefix, tgGeomLayer: tgGeomLayer, tgStyleLayers: tgStyleLayers, styleGroup: styleGroup, tgDrawGroups: tgDrawGroups,
	            xyz: xyz, xyzLayerName: xyzLayerName, xyzLayerIndex: xyzLayerIndex
	        });
	    });

	    // Second pass to turn off visibility for Tangram draw groups from other XYZ style groups
	    styleGroups.forEach(function (ref) {
	        var styleGroupName = ref[0];

	        tgDrawGroups.forEach(function (ref) {
	            var layerName = ref.layerName;
	            var drawGroupName = ref.drawGroupName;

	            var tgStyleLayerName = tgStyleLayers[styleGroupName];
	            var tgStyleLayer = tgGeomLayer[tgStyleLayerName];
	            if (layerName !== tgStyleLayerName) {
	                tgStyleLayer.draw[drawGroupName] = {
	                    visible: false
	                };
	            }
	        });
	    });
	}

	function makeStyleGroupLayer(ref) {
	    var styleRules = ref.styleRules;
	    var styleGroupName = ref.styleGroupName;
	    var styleGroupPrefix = ref.styleGroupPrefix;
	    var tgGeomLayer = ref.tgGeomLayer;
	    var tgStyleLayers = ref.tgStyleLayers;
	    var styleGroup = ref.styleGroup;
	    var tgDrawGroups = ref.tgDrawGroups;
	    var xyzLayerName = ref.xyzLayerName;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;


	    // Match XYZ style rules for this style group, and create Tangram filter
	    var ref$1 = matchStyleRules({ styleRules: styleRules, styleGroupName: styleGroupName, styleGroupPrefix: styleGroupPrefix });
	    var sortPrefix = ref$1.sortPrefix;
	    var tgFilter = ref$1.tgFilter;

	    // Create Tangram sub-layer for this XYZ style group
	    var tgStyleLayerName = tgStyleLayers[styleGroupName] = sortPrefix + "_" + styleGroupName;
	    var tgStyleLayer = tgGeomLayer[tgStyleLayerName] = {};
	    if (tgFilter != null) {
	        tgStyleLayer.filter = tgFilter;
	    }

	    // Combine circle styles: XYZ has two circle styles (one for the outline, one for the fill),
	    // while Tangram can represent this as a single draw group, as a point with an outline.
	    coalesceCircleStyles(styleGroup);

	    // Create Tangram draw groups, one for each XYZ style in this style group
	    tgStyleLayer.draw = styleGroup
	        .filter(function (s) { return s.opacity > 0; }) // this seems to be used as a general filter to disable symbolizers?
	        .filter(function (s) { return !s.isOutline; }) // filter coalesced circle outlines
	        // .filter(s => s.type === 'Polygon' || s.type === 'Line') // TODO: other symbolizer types
	        .reduce(function (draw, style, styleIndex) {
	            // Add Tangram draw groups for each XYZ style object
	            if (style.type === 'Polygon') {
	                // Polygon fill
	                makePolygonStyleLayer({ tgStyleLayerName: tgStyleLayerName, style: style, styleIndex: styleIndex, tgDrawGroups: tgDrawGroups, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex });
	            }
	            else if (style.type === 'Line') {
	                // Line stroke
	                makeLineStyleLayer({ tgStyleLayerName: tgStyleLayerName, style: style, styleIndex: styleIndex, tgDrawGroups: tgDrawGroups, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex });
	            }
	            else if (style.type === 'Circle') {
	                // Circle point
	                makeCircleStyleLayer({ tgStyleLayerName: tgStyleLayerName, style: style, styleIndex: styleIndex, tgDrawGroups: tgDrawGroups, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex });
	            }
	            else if (style.type === 'Image') {
	                // Circle point
	                makeImageStyleLayer({ tgStyleLayerName: tgStyleLayerName, style: style, styleIndex: styleIndex, tgDrawGroups: tgDrawGroups, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex });
	            }
	            else if (style.type === 'Text') {
	                // Text label
	                makeTextStyleLayer({ tgStyleLayerName: tgStyleLayerName, style: style, styleIndex: styleIndex, tgDrawGroups: tgDrawGroups, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex });
	            }
	            return draw;
	        }, {});
	}

	function matchStyleRules(ref) {
	    var styleRules = ref.styleRules;
	    var styleGroupName = ref.styleGroupName;
	    var styleGroupPrefix = ref.styleGroupPrefix;

	    var rule = styleRules.find(function (rule) { return styleGroupName === (styleGroupPrefix + "_" + (rule.id)); });
	    var ruleIndex;
	    var tgFilter;
	    if (rule) {
	        ruleIndex = styleRules.findIndex(function (rule) { return styleGroupName === (styleGroupPrefix + "_" + (rule.id)); });
	        tgFilter = makeFilter(rule);
	    }

	    var sortPrefix;
	    if (ruleIndex != null) {
	        var sort = styleRules.length - ruleIndex;
	        sortPrefix = "s" + (leftPad(sort, numDigits(styleRules.length)));
	    }
	    else {
	        sortPrefix = "s" + (leftPad(0, numDigits(styleRules.length)));
	    }

	    return { sortPrefix: sortPrefix, tgFilter: tgFilter };
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
	    var tgStyleLayerName = ref.tgStyleLayerName;
	    var style = ref.style;
	    var styleIndex = ref.styleIndex;
	    var tgDrawGroups = ref.tgDrawGroups;
	    var draw = ref.draw;
	    var xyzLayerName = ref.xyzLayerName;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;

	    // Polygon fill
	    var tgFillDrawGroupName = tgStyleLayerName + "_" + (style.type) + "_" + styleIndex + "_fill";
	    tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgFillDrawGroupName });
	    draw[tgFillDrawGroupName] = {
	        visible: true,
	        interactive: true,
	        style: (xyzLayerName + "_polygons"),
	        color: style.fill,
	        order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
	    };

	    // Polygon stroke
	    var tgStrokeDrawGroupName = tgStyleLayerName + "_" + (style.type) + "_" + styleIndex + "_stroke";
	    tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgStrokeDrawGroupName });
	    draw[tgStrokeDrawGroupName] = {
	        visible: true,
	        interactive: true,
	        style: (xyzLayerName + "_lines"),
	        color: style.stroke,
	        width: ((style.strokeWidth) + "px"),
	        cap: style.strokeLinecap,
	        join: style.strokeLinejoin,
	        dash: hasDash(style.strokeDasharray) ? style.strokeDasharray : null,
	        order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
	    };
	}

	function makeLineStyleLayer(ref) {
	    var tgStyleLayerName = ref.tgStyleLayerName;
	    var style = ref.style;
	    var styleIndex = ref.styleIndex;
	    var tgDrawGroups = ref.tgDrawGroups;
	    var draw = ref.draw;
	    var xyzLayerName = ref.xyzLayerName;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;

	    var tgStrokeDrawGroupName = tgStyleLayerName + "_" + (style.type) + "_" + styleIndex + "_stroke";
	    tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgStrokeDrawGroupName });
	    draw[tgStrokeDrawGroupName] = {
	        visible: true,
	        interactive: true,
	        style: (xyzLayerName + "_lines"),
	        color: style.stroke,
	        width: ((style.strokeWidth) + "px"),
	        cap: style.strokeLinecap,
	        join: style.strokeLinejoin,
	        dash: hasDash(style.strokeDasharray) ? style.strokeDasharray : null,
	        order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
	    };
	}

	function makeCircleStyleLayer(ref) {
	    var tgStyleLayerName = ref.tgStyleLayerName;
	    var style = ref.style;
	    var styleIndex = ref.styleIndex;
	    var tgDrawGroups = ref.tgDrawGroups;
	    var draw = ref.draw;
	    var xyzLayerName = ref.xyzLayerName;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;

	    var tgPointDrawGroupName = tgStyleLayerName + "_" + (style.type) + "_" + styleIndex + "_point";
	    tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgPointDrawGroupName });
	    draw[tgPointDrawGroupName] = {
	        visible: true,
	        interactive: true,
	        collide: false,
	        style: (xyzLayerName + "_points"),
	        color: style.fill,
	        size: ((style.radius * 2) + "px"),
	        // size: [`${style.width}px`, `${style.height}px`],
	        offset: getOffset(style),
	        order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
	    };
	    if (style.outline) {
	        draw[tgPointDrawGroupName].outline = {
	            color: style.outline.fill,
	            width: ((style.outline.radius - style.radius) + "px")
	        };
	    }
	}

	function makeImageStyleLayer(ref) {
	    var tgStyleLayerName = ref.tgStyleLayerName;
	    var style = ref.style;
	    var styleIndex = ref.styleIndex;
	    var tgDrawGroups = ref.tgDrawGroups;
	    var draw = ref.draw;
	    var xyzLayerName = ref.xyzLayerName;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;

	    var tgPointDrawGroupName = tgStyleLayerName + "_" + (style.type) + "_" + styleIndex + "_point";
	    tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgPointDrawGroupName });
	    draw[tgPointDrawGroupName] = {
	        visible: true,
	        interactive: true,
	        collide: false,
	        style: (xyzLayerName + "_points"),
	        size: [((style.width) + "px"), ((style.height) + "px")],
	        texture: style.src,
	        offset: getOffset(style),
	        order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
	    };
	}

	function makeTextStyleLayer(ref) {
	    var tgStyleLayerName = ref.tgStyleLayerName;
	    var style = ref.style;
	    var styleIndex = ref.styleIndex;
	    var tgDrawGroups = ref.tgDrawGroups;
	    var draw = ref.draw;
	    var xyzLayerName = ref.xyzLayerName;
	    var xyz = ref.xyz;
	    var xyzLayerIndex = ref.xyzLayerIndex;

	    var tgTextDrawGroupName = tgStyleLayerName + "_" + (style.type) + "_" + styleIndex + "_text";
	    tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgTextDrawGroupName });

	    draw[tgTextDrawGroupName] = {
	        visible: true,
	        interactive: true,
	        collide: false,
	        style: (xyzLayerName + "_text"),
	        text_source: ("function() { var properties = feature; return " + (style.textRef) + "; }"),
	        font: {
	            fill: style.fill,
	            stroke: {
	                color: style.stroke,
	                width: ((style.strokeWidth) + "px")
	            }
	        },
	        offset: getOffset(style),
	        // repeat_distance: '1000px',
	        order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
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

	// If a style group has two circle styles, mark them as combined
	// Tangram can represent htem as a single `points` draw group, with an outline
	function coalesceCircleStyles(styleGroup) {
	    var assign;

	    if (styleGroup.filter(function (s) { return s.type === 'Circle'; }).length === 2) {
	        var first = styleGroup.findIndex(function (s) { return s.type === 'Circle'; });
	        if (first > -1) {
	            var second = styleGroup.slice(first + 1).findIndex(function (s) { return s.type === 'Circle'; });
	            if (second > -1) {
	                second += first + 1;
	                if (styleGroup[first].radius > styleGroup[second].radius) {
	                    (assign = [second, first], first = assign[0], second = assign[1]);
	                }
	                styleGroup[first].outline = styleGroup[second];
	                styleGroup[second].isOutline = true;
	            }
	        }
	    }
	}

	// Utility functions

	function quoteValue(value) {
	    // quote non-numeric values
	    return (isNaN(Number(value)) ? ("'" + value + "'") : Number(value));
	}

	function leftPad(value, digits) {
	    var sign = Math.sign(value) === -1 ? '-' : '';
	    return sign + new Array(digits).concat([Math.abs(value)]).join('0').slice(-digits);
	}

	function numDigits(value) {
	    return (value + '').replace('.', '').length;
	}

	return xyzToTangram;

}));
