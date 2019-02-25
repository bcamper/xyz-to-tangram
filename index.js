import btoaNode from 'btoa';
import parseCSSFont from 'css-font-parser';

// choose browser or node implementation of btoa
const btoa = (typeof window !== 'undefined' && window.btoa) || btoaNode;

export default function xyzToTangram(xyzStyle, {
    setStartPosition = true, // create a Tangram camera to set the scene position on load
    collide = false // enable Tangram label collision
} = {}) {

    // Add Tangram scene elements so that insertion order matches Tangram idioms
    // (camera first, then sources, styles before layers, etc.)
    const scene = {};
    if (setStartPosition) {
        scene.cameras = makeCamera(xyzStyle);
    }
    scene.sources = makeSources(xyzStyle);
    scene.styles = makeStyles();
    scene.layers = makeLayers(xyzStyle, { collide });
    scene.meta = makeMeta(xyzStyle);

    return scene;
}

// add subject of XYZ Studio JSON as scene metadata
// useful for cards functionality, and general reference/debugging
function makeMeta(xyz) {
    const meta = {};
    meta.xyz = { // put under XYZ-specific namespace
        id: xyz.id,
        meta: xyz.meta,
        bookmarks: xyz.bookmarks,
        publish_settings: xyz.publish_settings,
        layers: xyz.layers.map(layer => {
            return {
                id: layer.id,
                meta: layer.meta,
                geospace: layer.geospace,
                cards: layer.cards.filter(c => c.length > 0)
            };
        })
    };
    return meta;
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
            // url: `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/web/{z}_{x}_{y}`,
            url: `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/quadkey/{q}`,
            url_params: {
                access_token,
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
    return ['polygons', 'lines', 'points', 'text'].reduce((tgStyles, geomType) => {
        tgStyles[`XYZ_${geomType}`] = {
            base: geomType,
            blend: 'overlay'
        };
        return tgStyles;
    }, {});
}

function makeLayers(xyz, tgOptions) {
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
            makeGeometryTypeLayer({ xyz, xyzLayer, xyzLayerIndex, geomType, tgLayers, tgOptions });
        });

        return tgLayers;
    }, {});
}

function makeGeometryTypeLayer({
    xyz,
    xyzLayer,
    xyzLayerIndex,
    geomType,
    tgLayers,
    tgOptions }) {

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
            tgGeomLayer, tgOptions
        });
    });
}

function makeStyleGroupLayer({
    styleRules,
    styleGroupName,
    styleGroupPrefix,
    styleGroup,
    tgGeomLayer,
    tgOptions,
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
    // coalesceCircleStyles(styleGroup);

    // Combine icon and circle/rect shapes into a single SVG
    compositeIcons(styleGroup);

    // Create Tangram draw groups, one for each XYZ style in this style group
    tgStyleLayer.draw = styleGroup
        .filter(s => s.opacity > 0) // this seems to be used as a general filter to disable symbolizers?
        .filter(s => !s.skip) // skip pre-processed styles (they've been coalesced into others)
        .reduce((draw, style, styleIndex) => {
            // Add Tangram draw groups for each XYZ style object
            if (style.type === 'Polygon') {
                // Polygon fill
                makePolygonStyleLayer({ style, styleIndex, draw, xyzLayerName, xyz, xyzLayerIndex, tgOptions });
            }
            else if (style.type === 'Line') {
                // Line stroke
                makeLineStyleLayer({ style, styleIndex, draw, xyzLayerName, xyz, xyzLayerIndex, tgOptions });
            }
            else if (style.type === 'Circle') {
                // Circle point
                makeCircleStyleLayer({ style, styleIndex, draw, xyzLayerName, xyz, xyzLayerIndex, tgOptions });
            }
            else if (style.type === 'Image') {
                // Circle point
                makeImageStyleLayer({ style, styleIndex, draw, xyzLayerName, xyz, xyzLayerIndex, tgOptions });
            }
            else if (style.type === 'Text') {
                // Text label
                makeTextStyleLayer({ style, styleIndex, draw, xyzLayerName, xyz, xyzLayerIndex, tgOptions });
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

function makeCircleStyleLayer({ style, styleIndex, draw, xyz, xyzLayerIndex, tgOptions }) {
    const tgPointDrawGroupName = `${style.type}_${styleIndex}_point`;
    draw[tgPointDrawGroupName] = {
        interactive: true,
        collide: tgOptions.collide,
        priority: getLabelPriority(xyz.layers, xyzLayerIndex, tgOptions),
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

function makeImageStyleLayer({ style, styleIndex, draw, xyz, xyzLayerIndex, tgOptions }) {
    const tgPointDrawGroupName = `${style.type}_${styleIndex}_point`;
    draw[tgPointDrawGroupName] = {
        interactive: true,
        collide: tgOptions.collide,
        priority: getLabelPriority(xyz.layers, xyzLayerIndex, tgOptions),
        style: 'XYZ_points',
        size: [`${style.width}px`, `${style.height}px`],
        texture: style.src,
        offset: getOffset(style),
        blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
    };

    // optionally attached text label
    if (style.text) {
        const textDraws = {};
        makeTextStyleLayer({
            style: style.text, styleIndex: 0,
            draw: textDraws,
            xyz, xyzLayerIndex,
            tgOptions: { ...tgOptions, priority: 2 } // default attached text labels to lower priority than parent
        });
        const text = Object.values(textDraws)[0];
        if (text) {
            draw[tgPointDrawGroupName].text = text;
            text.optional = true;
        }
    }
}

function makeTextStyleLayer({ style, styleIndex, draw, xyz, xyzLayerIndex, tgOptions }) {
    const tgTextDrawGroupName = `${style.type}_${styleIndex}_text`;
    draw[tgTextDrawGroupName] = {
        interactive: true,
        collide: tgOptions.collide,
        priority: getLabelPriority(xyz.layers, xyzLayerIndex, tgOptions),
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

// Calculate Tangram label priority based on XYZ layer position
function getLabelPriority(xyzLayers, xyzLayerIndex, tgOptions) {
    const tgPriorityBase = 0;
    const tgPriorityMultiplier = 0.1;
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
                styleGroup[second].skip = true;
            }
        }
    }
}

// Combine icon and circle/rect shapes into a single SVG
// This allows markers to properly overlap and collide
function compositeIcons(styleGroup) {
    const shapes = styleGroup
        .filter(s => s.opacity > 0)
        .filter(s => ['Circle', 'Rect', 'Image'].indexOf(s.type) > -1)
        .sort((a, b) => a.zIndex - b.zIndex);

    if (shapes.length === 0) {
        return;
    }

    // find width/height incorporating offsets
    const maxOffsetWidth = Math.max(...shapes.map(s => Math.abs(s.offsetX || 0)).filter(x => x != null));
    const maxOffsetHeight = Math.max(...shapes.map(s => Math.abs(s.offsetY || 0)).filter(x => x != null));
    const width = Math.max(...shapes.map(s => s.width).filter(x => x != null)) + maxOffsetWidth;
    const height = Math.max(...shapes.map(s => s.height).filter(x => x != null)) + maxOffsetHeight;

    let svg =
        `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink">\n`;

    shapes.forEach(s => {
        // <circle cx="25" cy="25" r="20" style="fill: red; stroke: black; stroke-width: 3px;" />
        // <rect x="5" y="5" width="30" height="30" style="fill: red; stroke: black; stroke-width: 3px;" />
        // <image x="0" y="0" width="50" height="50" xlink:href="${url}" />

        const offsetX = (s.offsetX || 0) + (width / 2);
        const offsetY = (s.offsetY || 0) + (height / 2);

        if (s.type === 'Circle') {
            let style = `fill: ${s.fill}; `;
            if (s.stroke && s.strokeWidth) {
                style += `stroke: ${s.stroke}; stroke-width: ${s.strokeWidth}px;`;
            }
            svg += `<circle cx="${offsetX}" cy="${offsetY}" r="${s.radius}" style="${style}" />\n`;
        }
        if (s.type === 'Rect') {
            let style = `fill: ${s.fill}; `;
            if (s.stroke && s.strokeWidth) {
                style += `stroke: ${s.stroke}; stroke-width: ${s.strokeWidth}px;`;
            }
            svg += `<rect x="${offsetX - s.width / 2}" y="${offsetY - s.height / 2}" width="${s.width}" height="${s.height}" style="${style}" />\n`;
        }
        else if (s.type === 'Image') {
            svg += `<image x="${offsetX - s.width / 2}" y="${offsetY - s.height / 2}" width="${s.width}" height="${s.height}" xlink:href="${s.src}"/>\n`;
        }

        s.skip = true;
    });

    svg += '</svg>';
    const url = `data:image/svg+xml;base64,${btoa(svg)}`; // encode SVG as data URL

    // Create a new Image style for the composited SVG
    const image = {
        type: 'Image',
        width,
        height,
        zIndex: shapes[shapes.length - 1].zIndex, // max zIndex is last
        src: url,
        opacity: 1
    };

    // Optionally attach a text label, if exactly one is found
    const texts = styleGroup.filter(s => s.type === 'Text' && s.opacity > 0);
    if (texts.length === 1) {
        let text = texts[0];
        image.text = text;
        text.skip = true;
    }

    styleGroup.push(image); // add new composited SVG
}

// Utility functions

function quoteValue(value) {
    // quote non-numeric values
    return (isNaN(Number(value)) ? `'${value}'` : Number(value));
}
