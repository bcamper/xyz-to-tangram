(async () => {
    // Test XYZ project ids
    // daf86376-b159-4b9e-bee3-04aa6aca6a10 // school polys
    // 8ec36215-1d0c-4c63-8120-fad8770dd36c // lines/subways
    // 33c236e0-d0ef-4338-b0e0-5de3b97f4c0c // NYC transit
    // a2449f3f-e72a-4076-a927-7ac539a05b0e // points/flags
    // bdc2d760-a580-11e8-897b-3f13b99e70ae // Amsterdam
    // ac2b5bc0-a58b-11e8-897b-3f13b99e70ae // HERE offices
    // da5107a0-a56a-11e8-897b-3f13b99e70ae // SF parks/parklets

    // Get `project_id` query string parameter
    let xyzProjectId;
    const params = new URLSearchParams(document.location.search);
    const query = [...params.entries()]
        .reduce((obj, { 0: k, 1: v }) => Object.assign(obj, { [k]: v }), {}); // convert entries to object

    if (query.project_id) {
        xyzProjectId = query.project_id;
    }
    else {
        document.getElementById('no-viz').style.display = 'block';
    }

    // Load XYZ studio viz JSON
    const xyzURL = `https://xyz.api.here.com/project-api/projects/${xyzProjectId}`;
    const xyzStyle = await fetch(xyzURL).then(r => {
        if (!r.ok) {
            // alert(`Couldn't load XYZ Studio project id ${xyzProjectId}!`);
            document.getElementById('no-viz').style.display = 'block';
            document.getElementById('no-viz').innerHTML =
                `Couldn't load XYZ Studio project id '${xyzProjectId}'!`;
            throw Error(`Couldn't load XYZ Studio project id ${xyzProjectId}!`);
        }
        return r.json();
    });

    // Conversion options
    const options = {
        basemap: query.basemap
    };

    if (query.collide != null) {
        options.collide = Boolean(parseFloat(query.collide));
    }

    if (query.labelsOnTop != null) {
        options.labelsOnTop = Boolean(parseFloat(query.labelsOnTop));
    }

    // Convert to Tangram scene
    const { scene: tgScene, legends } = xyzToTangram(xyzStyle, options);

    window.console.log('tangram scene', tgScene);

    // Create a Leaflet map
    const map = L.map('map', {
        maxZoom: 22,
        zoomControl: false,
        zoomSnap: 0,
        keyboard: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default start position
    map.setView([40.70531887544228, -74.00976419448853], 11);

    const basemapAPIKey = query.basemap_api_key || 'xC0YyOMJRHidUaLujO1b0g';
    tgScene.global = tgScene.global || {};
    tgScene.global.sdk_api_key = basemapAPIKey;

    // Create Tangram as a Leaflet layer
    const layer = Tangram.leafletLayer({
        scene: tgScene,
        events: {
            click: e => featureSelection(e, 'click') // default to just click events
        }
    });

    layer.addTo(map);

    // Feature selection
    function featureSelection(event, type) {
        // console.log(event, type);
        const { feature, changed, pixel, leaflet_event } = event;

        // skip event if doesn't match expected type
        if ((showCardsOnHover && type === 'click') ||
            (!showCardsOnHover && type === 'hover')) {
            return;
        }

        // if (xyzMeta.publish_settings.display && !xyzMeta.publish_settings.display.cards) {
        //     return; // don't show if cards aren't enabled
        // }

        // Update and show card if feature changed
        if (feature) {
            if (changed) {
                // Find XYZ card info
                const xyzLayer = xyzMeta.layers.find(l => l.meta.title === feature.source_name);
                if (xyzLayer &&
                    xyzLayer.cards &&
                    xyzLayer.cards[0] &&
                    xyzLayer.cards[0].length > 0 &&
                    xyzLayer.cards[0][0] !== '__id') { // special default identifier, empty card (?)

                    const items = Array.from(xyzLayer.cards[0]); // copy array to not modify original

                    // first card item is title
                    const title = items.shift();
                    document.querySelector('.card .card-title').innerText = feature.properties[title];

                    // rest of the items are rows below
                    document.querySelector('.card .card-rows-container').innerHTML = buildCardRows(feature, items);

                    document.querySelector('.card').style.display = 'block';

                    // now update the sidebar content as well
                    document.querySelector('.card-sidebar .card-title').innerText = feature.properties[title];

                    // rest of the items are rows below
                    let separatorIndex;
                    if (xyzLayer.cards[1] && xyzLayer.cards[1].length > 0) {
                        separatorIndex = items.length;
                        items.push(...xyzLayer.cards[1]);
                    }

                    document.querySelector('.card-sidebar .card-rows-container').innerHTML = buildCardRows(feature, items, separatorIndex);
                }
                else {
                    document.querySelector('.card').style.display = 'none';
                }

                document.querySelector('.card').style.left = pixel.x + 'px';
                document.querySelector('.card').style.top = pixel.y + 'px';
            }
        }
        // Hide card if no feature to show, but not on mouse out events
        // (otherwise card gets hidden when user tries to house over it to click)
        else if (leaflet_event.type !== 'mouseout') {
            document.querySelector('.card').style.display = 'none';
        }
    }

    // build HTML for cards (either standalone/floating card, or fixed "more info" sidebar card)
    function buildCardRows (feature, items, separatorIndex = null) {
        return items.map((prop, index) => {
            return `
                <div class="card-row ${index === separatorIndex ? 'card-row-separator' : ''}">
                    <div class="card-row-title">
                        ${prop}
                    </div>
                    <div class="card-row-description">
                        ${feature.properties[prop] == null ? '' : feature.properties[prop]}
                    </div>
                </div>`;
        }).join('');
    }

    // Set document title and sidebar
    const xyzMeta = tgScene.meta.xyz;
    document.title = 'XYZ Studio - ' + xyzMeta.meta.name;

    const display = xyzMeta.publish_settings.display;
    if (display && display.name) {
        document.querySelector('.project-details > .name').innerText = xyzMeta.meta.name;
    }
    else {
        document.querySelector('.project-details > .name').style.display = 'none';
    }

    if (display && display.description) {
        document.querySelector('.project-details > .description').innerText = xyzMeta.meta.description;
    }
    else {
        document.querySelector('.project-details > .description').style.display = 'none';
    }

    // Build legends
    if (display && display.legend && legends.length > 0) {
        document.querySelector('.legend-rows').innerHTML = legends.map(legend => {
            let symbol = '';
            if (legend.style) {
                if (legend.style.type === 'Image') {
                    symbol = `<img width="28" height="28" src="${legend.style.src}">`;
                }
                else if (legend.style.type === 'Line') {
                    symbol = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                            <path fill="${legend.style.stroke}" d="M21 24.556l-3.444 1.556L7 3.444l3.444-1.556L21 24.556z"></path>
                        </svg>`;
                }
                else if (legend.style.type === 'Polygon') {
                    symbol = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                            <path fill="${legend.style.fill}" stroke="${legend.style.stroke}" stroke-width="2" d="M14,2.165l12.5,9.043l-4.787,14.627H6.288L1.5,11.207L14,2.165z"></path>
                        </svg>`;
                }
            }

            return `<div class="legend">
                <!-- <div style="border-top: 3px solid ${layer.color};" class="line"></div> -->
                <span>${symbol}</span>
                <span style="padding-left: 8px;">${legend.name}</span>
            </div>`;
        }).join('');
    }
    else {
        document.querySelector('.legend-container').style.display = 'none';
    }

    // if (display && !display.cards) {
    //     document.querySelector('.project-details > .card-toggle-container').style.display = 'none';
    // }

    // show sidebar
    document.querySelector('.sidebar').style.display = 'flex';

    // Setup project box collapse/show
    // let project
    document.querySelector('.project-collapse-button').onclick = () => {
        if (document.querySelector('.project-details').style.display === 'none') {
            document.querySelector('.project-collapse-button').classList.remove('closed');
            document.querySelector('.project-details').style.display = 'block';
        }
        else {
            document.querySelector('.project-collapse-button').classList.add('closed');
            document.querySelector('.project-details').style.display = 'none';
        }
    };

    // Setup sidebar hover toggle/animation
    let showCardsOnHover = false;
    document.querySelector('.card-toggle-container').onclick = () => {
        if (Array.from(document.querySelector('.card-toggle').classList).indexOf('right') === -1) {
            document.querySelector('.card-toggle').classList.add('right');
            showCardsOnHover = true;
            layer.setSelectionEvents({
                hover: e => featureSelection(e, 'hover'),
                click: null
            });
        }
        else {
            document.querySelector('.card-toggle').classList.remove('right');
            showCardsOnHover = false;
            layer.setSelectionEvents({
                hover: null,
                click: e => featureSelection(e, 'click'),
            });
        }
    };

    // Setup card sidebar open link and close button
    document.querySelector('.card-more-link').onclick = () => {
        // enable full-height column for stacked module layout
        document.querySelector('.sidebar').style.height = 'calc(100vh - 40px)';
        document.querySelector('.card-sidebar').style.display = 'flex';
    };

    document.querySelector('.card-more-close-button').onclick = () => {
        // disable full-height column (blocks pointer events)
        document.querySelector('.sidebar').style.height = '';
        document.querySelector('.card-sidebar').style.display = 'none';
    };

    // Debug
    Object.assign(window, { xyzStyle, tgScene, layer, scene: layer.scene });
})();
