import parseCSSFont from 'css-font-parser';

export default function xyzToTangram(xyzStyle, {
        setStartPosition = true, // create a Tangram camera to set the scene position on load
    } = {}) {

    // Add Tangram scene elements so that insertion order matches Tangram idioms
    // (camera first, then sources, styles before layers, etc.)
    const scene = {};
    if (setStartPosition) {
        scene.cameras = makeCamera(xyzStyle);
    }
    scene.sources = makeSources(xyzStyle);
    scene.styles = makeStyles();
    scene.layers = makeLayers(xyzStyle);

    return scene;
}

function makeCamera(xyz) {
    const pos = xyz.map_settings;
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
    return (xyzLayer.meta && xyzLayer.meta.title) || `layer-${index}`;
}

function makeSources(xyz) {
    // https://xyz.api.here.com/hub/spaces/{space}/tile/web/{z}_{x}_{y}
    return xyz.layers.reduce((tgSources, xyzLayer, index) => {
        const spaceId = xyzLayer.geospace.id;
        const name = getXYZLayerName(xyzLayer, index);
        const access_token = xyz.rot;

        tgSources[name] = {
            type: 'GeoJSON',
            url: `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/web/{z}_{x}_{y}`,
            url_params: {
                access_token,
                clip: true
            },
            max_zoom: 16 // best default?
        };
        return tgSources;
    }, {});
}

function makeStyles() {
    // One style per geometry type, with overlay blending
    return ['polygons', 'lines', 'points', 'text'].reduce((tgStyles, geomType) => {
        tgStyles[`XYZ_${geomType}`] = {
            base: geomType,
            blend: 'overlay'
        };
        return tgStyles;
    }, {});
}

function makeLayers(xyz) {
    // TODO: more general handling of visible flag
    return xyz.layers.filter(x => x.visible).reduce((tgLayers, xyzLayer, xyzLayerIndex) => {
        // Make one enclosing Tangram layer for the entire XYZ layer,
        // and then one sub-layer for each geometry type present in the XYZ layer
        const xyzLayerName = getXYZLayerName(xyzLayer, xyzLayerIndex);
        tgLayers[xyzLayerName] = {
            data: {
                source: xyzLayerName
            }
        };

        // The geometry types in this XYZ layer (Point, Line, Polygon)
        const geomTypes = []; // `geometries` field is unreliable, doesn't always match features present in layer
        const geomCounts = xyzLayer.geometriesCount; // use `geometriesCount` instead
        if (geomCounts) {
            if (geomCounts['Point'] || geomCounts['MultiPoint']) geomTypes.push('Point');
            if (geomCounts['LineString'] || geomCounts['MultiLineString']) geomTypes.push('Line');
            if (geomCounts['Polygon'] || geomCounts['MultiPolygon']) geomTypes.push('Polygon');
        }
        else { // sometimes `geometriesCount` is also missing, check for all geometry types in this case
            geomTypes.push('Point', 'Line', 'Polygon');
        }

        geomTypes.forEach(geomType => {
            makeGeometryTypeLayer({ xyz, xyzLayer, xyzLayerIndex, geomType, tgLayers });
         });

        return tgLayers;
    }, {});
}

function makeGeometryTypeLayer({
    xyz,
    xyzLayer,
    xyzLayerIndex,
    geomType,
    tgLayers }) {

    // Tangram sub-layer for all features with this geometry type
    const xyzLayerName = getXYZLayerName(xyzLayer, xyzLayerIndex);
    const tgGeomLayer = tgLayers[xyzLayerName][geomType] = {
        filter: {
            $geometry: geomType.toLowerCase()
        }
    };

    // Make further Tagram sub-layers, one per XYZ layer style group
    const styleGroupPrefix = `${geomType.toLowerCase()}Style`;
    const styleGroups = Object.entries(xyzLayer.styleGroups).filter(([k]) => k.startsWith(styleGroupPrefix));
    const styleRules = (xyzLayer.styleRules && xyzLayer.styleRules[geomType]) || [];

    styleGroups.forEach(([styleGroupName, styleGroup]) => {
        // Find XYZ style rule for this style (if one exists), and create Tangram layer filter
        makeStyleGroupLayer({
            xyz, xyzLayerName, xyzLayerIndex,
            styleRules, styleGroupName, styleGroup, styleGroupPrefix,
            tgGeomLayer
        });
    });
}

function makeStyleGroupLayer({
    styleRules,
    styleGroupName,
    styleGroupPrefix,
    styleGroup,
    tgGeomLayer,
    xyzLayerName,
    xyz,
    xyzLayerIndex }) {

    // Match XYZ style rules for this style group, and create Tangram filter
    const { tgFilter, priority } = matchStyleRules({ styleRules, styleGroupName, styleGroupPrefix });

    // Create Tangram sub-layer for this XYZ style group
    // These layers are mutually exclusive, and matching priority is determined by the order of styleRules
    // Style groups that don't match a rule (e.g. default / not-conditional style groups) are matched last
    const tgStyleLayer = tgGeomLayer[styleGroupName] = {
        priority,
        exclusive: true
    };
    if (tgFilter != null) {
        tgStyleLayer.filter = tgFilter;
    }

    // Combine circle styles: XYZ has two circle styles (one for the outline, one for the fill),
    // while Tangram can represent this as a single draw group, as a point with an outline.
    coalesceCircleStyles(styleGroup);

    // Create Tangram draw groups, one for each XYZ style in this style group
    tgStyleLayer.draw = styleGroup
        .filter(s => s.opacity > 0) // this seems to be used as a general filter to disable symbolizers?
        .filter(s => !s.isOutline) // filter coalesced circle outlines
        .reduce((draw, style, styleIndex) => {
            // Add Tangram draw groups for each XYZ style object
            if (style.type === 'Polygon') {
                // Polygon fill
                makePolygonStyleLayer({ style, styleIndex, draw, xyzLayerName, xyz, xyzLayerIndex });
            }
            else if (style.type === 'Line') {
                // Line stroke
                makeLineStyleLayer({ style, styleIndex, draw, xyzLayerName, xyz, xyzLayerIndex });
            }
            else if (style.type === 'Circle') {
                // Circle point
                makeCircleStyleLayer({ style, styleIndex, draw, xyzLayerName, xyz, xyzLayerIndex });
            }
            else if (style.type === 'Image') {
                // Circle point
                makeImageStyleLayer({ style, styleIndex, draw, xyzLayerName, xyz, xyzLayerIndex });
            }
            else if (style.type === 'Text') {
                // Text label
                makeTextStyleLayer({ style, styleIndex, draw, xyzLayerName, xyz, xyzLayerIndex });
            }
            return draw;
        }, {});
}

function matchStyleRules({ styleRules, styleGroupName, styleGroupPrefix }) {
    const rule = styleRules.find(rule => styleGroupName === `${styleGroupPrefix}_${rule.id}`);
    let priority = styleRules.length;
    let tgFilter;
    if (rule) {
        priority = styleRules.findIndex(rule => styleGroupName === `${styleGroupPrefix}_${rule.id}`);
        tgFilter = makeFilter(rule);
    }
    return { tgFilter, priority };
}

// Build a Tangram layer filter for an XYZ style rule
function makeFilter(styleRule) {
    if (styleRule == null) {
        return;
    }

    const rules = styleRule.r[0]; // TODO: handle multi-element OR properties (Studio doesn't currently support)
    let conditions = [];
    rules.forEach(rule => {
        switch (rule.operator) {
            case 'eq': // equals
                conditions.push(`feature['${rule.property}'] === ${quoteValue(rule.value)}`);
                break;
            case 'neq': // not equals
                conditions.push(`feature['${rule.property}'] !== ${quoteValue(rule.value)}`);
                break;
            case 'lt': // less than
                conditions.push(`feature['${rule.property}'] < ${quoteValue(rule.value)}`);
                break;
            case 'gt': // greater than
                conditions.push(`feature['${rule.property}'] > ${quoteValue(rule.value)}`);
                break;
            case 'em': // is empty
                conditions.push(`feature['${rule.property}'] == null`);
                break;
            case 'nem': // is not empty
                conditions.push(`feature['${rule.property}'] != null`);
                break;
        }
    });

    if (conditions.length === 0) {
        return;
    }

    let filter = `function() { return ${conditions/*.map(c => `(${c})`)*/.join(' && ')}; }`;
    return filter;
}

function makePolygonStyleLayer({ style, styleIndex, draw, xyz, xyzLayerIndex }) {
    // Polygon fill
    const tgFillDrawGroupName = `${style.type}_${styleIndex}_fill`;
    draw[tgFillDrawGroupName] = {
        interactive: true,
        style: 'XYZ_polygons',
        color: style.fill,
        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
    };

    // Polygon stroke
    const tgStrokeDrawGroupName = `${style.type}_${styleIndex}_stroke`;
    draw[tgStrokeDrawGroupName] = {
        interactive: true,
        style: 'XYZ_lines',
        color: style.stroke,
        width: `${style.strokeWidth}px`,
        cap: style.strokeLinecap,
        join: style.strokeLinejoin,
        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
    };

    if (hasDash(style.strokeDasharray)) {
        draw[tgStrokeDrawGroupName].dash = style.strokeDasharray;
    }
}

function makeLineStyleLayer({ style, styleIndex, draw, xyz, xyzLayerIndex }) {
    const tgStrokeDrawGroupName = `${style.type}_${styleIndex}_stroke`;
    draw[tgStrokeDrawGroupName] = {
        interactive: true,
        style: 'XYZ_lines',
        color: style.stroke,
        width: `${style.strokeWidth}px`,
        cap: style.strokeLinecap,
        join: style.strokeLinejoin,
        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
    };

    if (hasDash(style.strokeDasharray)) {
        draw[tgStrokeDrawGroupName].dash = style.strokeDasharray;
    }
}

function makeCircleStyleLayer({ style, styleIndex, draw, xyz, xyzLayerIndex }) {
    const tgPointDrawGroupName = `${style.type}_${styleIndex}_point`;
    draw[tgPointDrawGroupName] = {
        interactive: true,
        collide: false,
        style: 'XYZ_points',
        color: style.fill,
        size: `${style.radius * 2}px`,
        // size: [`${style.width}px`, `${style.height}px`],
        offset: getOffset(style),
        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
    };
    if (style.outline) {
        draw[tgPointDrawGroupName].outline = {
            color: style.outline.fill,
            width: `${style.outline.radius - style.radius}px`
        };
    }
}

function makeImageStyleLayer({ style, styleIndex, draw, xyz, xyzLayerIndex }) {
    const tgPointDrawGroupName = `${style.type}_${styleIndex}_point`;
    draw[tgPointDrawGroupName] = {
        interactive: true,
        collide: false,
        style: 'XYZ_points',
        size: [`${style.width}px`, `${style.height}px`],
        texture: style.src,
        offset: getOffset(style),
        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
    };
}

function makeTextStyleLayer({ style, styleIndex, draw, xyz, xyzLayerIndex }) {
    const tgTextDrawGroupName = `${style.type}_${styleIndex}_text`;
    draw[tgTextDrawGroupName] = {
        interactive: true,
        collide: false,
        style: 'XYZ_text',
        text_source: `function() { var properties = feature; return ${style.textRef}; }`,
        font: {
            fill: style.fill,
            stroke: {
                color: style.stroke,
                width: `${style.strokeWidth}px`
            }
        },
        offset: getOffset(style),
        anchor: 'center',
        // repeat_distance: '1000px',
        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
    };

    // parse XYZ font field
    const font = parseCSSFont(style.font);
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
    const tgBlendOrderBase = 1;
    const tgBlendOrderMultiplier = 0.001;
    const blendOrder = style.zIndex * tgBlendOrderMultiplier + (xyzLayers.length - xyzLayerIndex) + tgBlendOrderBase;
    return Number(blendOrder.toFixed(3)); // cap digit precision
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
    if (styleGroup.filter(s => s.type === 'Circle').length === 2) {
        let first = styleGroup.findIndex(s => s.type === 'Circle');
        if (first > -1) {
            let second = styleGroup.slice(first + 1).findIndex(s => s.type === 'Circle');
            if (second > -1) {
                second += first + 1;
                if (styleGroup[first].radius > styleGroup[second].radius) {
                    [first, second] = [second, first];
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
    return (isNaN(Number(value)) ? `'${value}'` : Number(value));
}
