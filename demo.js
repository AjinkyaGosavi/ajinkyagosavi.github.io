const dat = require("dat.gui");
const Mustache = require("mustache");
const config = require("./config");
const search = require("./search-ui");

const updateUrl = () => {
    let center = rts.map.getCenter(),
        zoom = rts.map.getZoom();

    let lat = center["lat"].toFixed(6),
        lng = center["lng"].toFixed(6);

    let mapPosition = `${lat},${lng},${zoom}`,
        mapState = rts.getMapState();

    let pushState = `#${mapPosition}/${mapState}`;
    window.history.pushState({}, "", `${pushState}`);
};

class RasterTileService {
    constructor() {
        this.gui = null;
        this.map = null;

        this.host = config.host;
        this.apiKey = config.apiKey;

        this.path = config.path;

        this.resources = [];
        this.resource = config.defaultResource;
        this.zoomLevelMin = "";
        this.zoomLevelMax = "";
        this.formats = [];
        this.format = config.defaultFormat;

        this.langs = [];
        this.lang = "";
        this.lang2s = [];
        this.lang2 = "";
        this.pviews = [];
        this.pview = "";
        this.styles = [];
        this.style = "";

        this.ppis = [config.emptyParamValue].concat(config.ppis);
        this.ppi = this.ppis[0];

        this.styleFeatureMapping = null;
        this.featuresSelected = {};
        this.featureControllers = [];

        this.sizes = [];
        this.size = "";

        this.scales = [config.emptyParamValue].concat(config.scales);
        this.scale = this.scales[0];

        this.locations = Object.keys(config.locations);
        this.location = this.locations[0];
        this.center = config.locations[this.location];
        this.zoom = config.defaultZoom;

        this.hiRes =
            window.devicePixelRatio && window.devicePixelRatio >= 2
                ? true
                : false;

        this.engineType = config.engineType;

        this.queryParamControllers = [];
        this.mapConfigFolder =
            this.locationDropDown =
            this.pathParamsFolder =
            this.resourceDropdown =
            this.formatDropdown =
            this.queryParamsFolder =
            this.langDropdown =
            this.lang2Dropdown =
            this.pviewDropdown =
            this.styleDropdown =
            this.ppiDropdown =
            this.sizeDropdown =
            this.scaleDropdown =
            this.apiKeyTextBox =
            this.linksFolder =
            this.featuresFolder =
            this.featuresLink =
            this.searchUI =
            this.exportFolder =
                null;

        this.urlTemplateUIDomElement = document.getElementById("urlTemplateUI");
        this.urlTemplateDomElement = document.getElementById("urlTemplate");
        this.urlTemplate = "";
    }

    showMetadataEndpoint = (url) => {
        window.open(`${url}`, "_blank");
    };

    info() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "info",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    politicalViews() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "politicalViews",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    features() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "features",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    languages() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "languages",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    copyright() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "copyright",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    openapi() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(this.host, this.path, "openapi")
        );
    }

    version() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "version",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    resetParameters() {
        if (this.resourceDropdown.isModified()) {
            this.resourceDropdown.setValue(config.defaultResource);
        }

        if (this.formatDropdown.isModified()) {
            this.formatDropdown.setValue(config.defaultFormat);
        }

        this.queryParamControllers.forEach((queryParamController) => {
            if (queryParamController.isModified()) {
                queryParamController.setValue(config.emptyParamValue);
            }
        });

        this.featureControllers.forEach((featureController) => {
            if (featureController.isModified()) {
                featureController.setValue(config.emptyParamValue);
            }
        });

        if (this.apiKeyTextBox.isModified()) {
            this.apiKeyTextBox.setValue(config.apiKey);
            this.updateMap();
        }
    }

    fetchObject = async (uri) => {
        return fetch(uri).then((response) => {
            if (!response.ok) {
                throw new Error(response.status + " - " + response.statusText);
            } else {
                return response.json();
            }
        });
    };

    buildMetadataURI = (hostURI, path, endpoint, params) => {
        params ? "" : (params = "");
        return `${hostURI}/${path}/${endpoint}${params}`;
    };

    buildParamsString = (apiKey) => {
        return apiKey ? `?apiKey=${apiKey}` : "";
    };

    setMapConfig = async () => {
        let params = this.buildParamsString(this.apiKey);

        let infoObjPromise,
            politicalViewsObjPromise,
            languagesObjPromise,
            featuresObjPromise = null;

        // Fetch data from endpoints
        infoObjPromise = this.fetchObject(
            this.buildMetadataURI(this.host, this.path, "info", params)
        );

        languagesObjPromise = this.fetchObject(
            this.buildMetadataURI(this.host, this.path, "languages", params)
        );
        politicalViewsObjPromise = this.fetchObject(
            this.buildMetadataURI(
                this.host,
                this.path,
                "politicalViews",
                params
            )
        );
        featuresObjPromise = this.fetchObject(
            this.buildMetadataURI(this.host, this.path, "features", params)
        );

        // Update control parameters only if data is successfully fetched from all endpoints
        return Promise.all([
            infoObjPromise,
            languagesObjPromise,
            politicalViewsObjPromise,
            featuresObjPromise,
        ])
            .then((metadataObjects) => {
                let infoObj = metadataObjects[0],
                    languagesObj = metadataObjects[1],
                    politicalViewsObj = metadataObjects[2],
                    featuresObj = metadataObjects[3],
                    resources,
                    zoomLevelMin,
                    zoomLevelMax,
                    formats,
                    langs,
                    lang2s,
                    pviews,
                    styles,
                    styleFeatureMapping,
                    sizes = null;

                langs = languagesObj[config.defaultResource];
                lang2s = languagesObj[config.defaultResource];
                pviews = politicalViewsObj[config.defaultResource];

                resources = infoObj.resources;
                zoomLevelMin = infoObj.zoomLevels["min"];
                zoomLevelMax = infoObj.zoomLevels["max"];
                formats = infoObj.imageFormats;
                styles = infoObj.styles;
                styleFeatureMapping = featuresObj.features;
                sizes = infoObj.imageSizes;

                // Insert empty string to optional params, so they are not passed by default
                styles = [config.emptyParamValue].concat(styles);
                sizes = [config.emptyParamValue].concat(sizes);
                pviews = [config.emptyParamValue].concat(pviews);
                langs = [config.emptyParamValue].concat(langs);
                lang2s = [config.emptyParamValue].concat(lang2s);

                // Set values received from endpoints
                this.resources = resources;
                this.resource =
                    config.defaultResource &&
                    resources.includes(config.defaultResource)
                        ? config.defaultResource
                        : resources[0];
                this.zoomLevelMin = zoomLevelMin;
                this.zoomLevelMax = zoomLevelMax;
                this.formats = formats;
                this.format =
                    config.defaultFormat &&
                    formats.includes(config.defaultFormat)
                        ? config.defaultFormat
                        : formats[0];

                this.langs = langs;
                this.lang = langs[0];
                this.lang2s = lang2s;
                this.lang2 = lang2s[0];
                this.pviews = pviews;
                this.pview = pviews[0];
                this.styles = styles;
                this.style = styles[0];
                this.sizes = sizes;
                this.size = sizes[0];

                this.styleFeatureMapping = styleFeatureMapping;
            })
            .catch((error) => {
                console.warn(
                    `Error while initializing/updating ui state: ${error.stack}`
                );
            });
    };

    getResourceParam() {
        return this.resource;
    }

    getFormatParam() {
        return this.format;
    }

    getLangParam() {
        return this.lang && this.lang != config.emptyParamValue
            ? `lang=${this.lang}`
            : "";
    }

    getLang2Param() {
        return this.lang2 && this.lang2 != config.emptyParamValue
            ? `lang2=${this.lang2}`
            : "";
    }

    getPviewParam() {
        return this.pview && this.pview != config.emptyParamValue
            ? `pview=${this.pview}`
            : "";
    }

    getStyleParam() {
        return this.style && this.style != config.emptyParamValue
            ? `style=${this.style}`
            : "";
    }

    getPpiParam() {
        return this.ppi && this.ppi != config.emptyParamValue
            ? `ppi=${this.ppi}`
            : "";
    }

    getFeaturesParam() {
        let style =
            this.style == config.emptyParamValue
                ? config.defaultStyle
                : this.style;

        if (style in this.styleFeatureMapping) {
            let featuresParams = [];

            // Traverse through features and form `features` param string
            for (let key of Object.keys(this.featuresSelected)) {
                if (this.featuresSelected[key] != config.emptyParamValue) {
                    featuresParams.push(key + ":" + this.featuresSelected[key]);
                }
            }

            let featuresParamString =
                this.filterEmptyStrings(featuresParams).join(",");
            return featuresParamString === ""
                ? ""
                : `features=${featuresParamString}`;
        }
    }

    getSizeParam() {
        return this.size && this.size != config.emptyParamValue
            ? `size=${this.size}`
            : "";
    }

    getScaleParam() {
        return this.scale && this.scale != config.emptyParamValue
            ? `scale=${this.scale}`
            : "";
    }

    getApiKeyParam() {
        return this.apiKey ? `apiKey=${this.apiKey}` : "apiKey=";
    }

    filterEmptyStrings(params) {
        return params.filter(function (e) {
            return e;
        });
    }

    getQueryParamsString() {
        let queryParams = [
            this.getLangParam(),
            this.getLang2Param(),
            this.getPviewParam(),
            this.getStyleParam(),
            this.getPpiParam(),
            this.getFeaturesParam(),
            this.getSizeParam(),
            this.getScaleParam(),
        ];
        return this.filterEmptyStrings(queryParams).join("&");
    }

    // Returns query parameter string to generate Raster Tile Layer
    getQueryParamsMapping() {
        let queryParamsMapping = {};

        let queryParams = [
            this.getLangParam(),
            this.getLang2Param(),
            this.getPviewParam(),
            this.getStyleParam(),
            this.getPpiParam(),
            this.getFeaturesParam(),
            this.getScaleParam(),
        ];
        queryParams.forEach((queryParam) => {
            if (queryParam) {
                let queryParamDetails = queryParam.split("=");
                queryParamsMapping[queryParamDetails[0]] = queryParamDetails[1];
            }
        });
        return queryParamsMapping;
    }

    addFeatureControls = () => {
        // Remove features folder
        if (this.featuresFolder) {
            this.featuresLink.remove();
            this.featuresLink = null;
            this.queryParamsFolder.removeFolder(this.featuresFolder);
            this.featuresFolder = null;
            this.featureControllers = [];
        }

        this.featuresLink = this.linksFolder
            .add(this, "features")
            .name("features");

        this.featuresFolder = this.queryParamsFolder.addFolder("Features");
        this.featuresFolder.close();

        let style =
            this.style == config.emptyParamValue
                ? config.defaultStyle
                : this.style;
        if (style in this.styleFeatureMapping) {
            let features = JSON.parse(
                JSON.stringify(this.styleFeatureMapping[style])
            );

            for (let feature of features) {
                let featureName = feature.name,
                    featureModes = feature.modes;

                // Insert empty string so optional param `features` is not passed by default
                featureModes.unshift(config.emptyParamValue);

                // Set feature value if feature is selected already
                let featureValue =
                    featureName in this.featuresSelected &&
                    featureModes.includes(this.featuresSelected[featureName])
                        ? this.featuresSelected[featureName]
                        : config.emptyParamValue;

                // Add controller for each feature
                let featureController = this.featuresFolder
                    .add(feature, "name", featureModes)
                    .name(featureName)
                    .setValue(featureValue);

                // Add tooltip and info icon
                let featureParamLabelElement =
                    featureController.domElement.previousSibling;
                featureParamLabelElement.setAttribute(
                    "data-title",
                    config.tooltips[featureName]
                );
                this.addInfoIcon(
                    featureParamLabelElement,
                    config.infoUrls[featureName]
                );

                featureController.onChange((val) => {
                    this.featuresSelected[featureName] = val;
                    this.updateMap();
                });
                this.featureControllers.push(featureController);
            }
        }
    };

    // Returns map state to store in URL
    getMapState() {
        let mapStateParams = [
            `resource=${this.getResourceParam()}`,
            `format=${this.getFormatParam()}`,
            this.getQueryParamsString(),
        ];

        let mapStateParamsString =
            this.filterEmptyStrings(mapStateParams).join("&");

        return mapStateParamsString;
    }

    createControlUI() {
        this.gui = new dat.GUI({
            closeOnTop: true,
        });
        this.gui.domElement.id = "rtsControlUI";
        this.gui.width = 350;

        this.mapConfigFolder = this.gui.addFolder("Map config");
        this.mapConfigFolder.open();

        this.locationDropDown = this.mapConfigFolder
            .add(this, "location", this.locations)
            .name("Location")
            .onChange((val) => {
                this.map.setCenter(config.locations[val]);
            });

        this.mapConfigFolder
            .add(this, "resetParameters")
            .name("Reset parameters");

        this.pathParamsFolder = this.gui.addFolder("Path parameters");
        this.pathParamsFolder.open();

        this.resourceDropdown = this.pathParamsFolder
            .add(this, "resource", this.resources)
            .onChange((val) => {
                this.updateMap();
            });

        this.formatDropdown = this.pathParamsFolder
            .add(this, "format", this.formats)
            .onChange((val) => {
                this.updateMap();
            });

        this.queryParamsFolder = this.gui.addFolder("Query parameters");
        this.queryParamsFolder.open();

        this.langDropdown = this.queryParamsFolder
            .add(this, "lang", this.langs)
            .onChange((val) => {
                this.updateMap();
            });

        this.lang2Dropdown = this.queryParamsFolder
            .add(this, "lang2", this.langs)
            .onChange((val) => {
                this.updateMap();
            });

        this.pviewDropdown = this.queryParamsFolder
            .add(this, "pview", this.pviews)
            .onChange((val) => {
                this.updateMap();
            });

        this.styleDropdown = this.queryParamsFolder
            .add(this, "style", this.styles)
            .onChange((val) => {
                this.updateMap();
                this.addFeatureControls();
            });

        this.ppiDropdown = this.queryParamsFolder
            .add(this, "ppi", this.ppis)
            .onChange((val) => {
                this.updateMap();
            });

        this.sizeDropdown = this.queryParamsFolder
            .add(this, "size", this.sizes)
            .onChange((val) => {
                this.updateMap();
            });

        this.scaleDropdown = this.queryParamsFolder
            .add(this, "scale", this.scales)
            .onChange((val) => {
                this.updateMap();
            });

        this.apiKeyTextBox = this.queryParamsFolder
            .add(this, "apiKey")
            .onFinishChange((val) => {
                this.updateMap();
            });

        this.linksFolder = this.gui.addFolder("Metadata endpoints");
        this.linksFolder.close();

        this.linksFolder.add(this, "info");
        this.linksFolder.add(this, "politicalViews");
        this.linksFolder.add(this, "languages");
        this.linksFolder.add(this, "copyright");
        this.linksFolder.add(this, "openapi");
        this.linksFolder.add(this, "version");

        this.addFeatureControls();

        this.queryParamControllers = [
            this.langDropdown,
            this.lang2Dropdown,
            this.pviewDropdown,
            this.styleDropdown,
            this.ppiDropdown,
            this.sizeDropdown,
            this.scaleDropdown,
        ];
        this.addToolTipsAndInfoIcons();
    }

    addInfoIcon(parentElement, url) {
        let infoIconElement = document.createElement("a");
        infoIconElement.setAttribute("href", url);
        infoIconElement.setAttribute("target", "_blank");
        infoIconElement.classList.add("info");
        infoIconElement.innerHTML = " &#9432;";
        parentElement.appendChild(infoIconElement);
    }

    addToolTipsAndInfoIcons() {
        // Path parameters
        let resourceParamLabelElement =
            this.resourceDropdown.domElement.previousSibling;
        resourceParamLabelElement.setAttribute(
            "data-title",
            config.tooltips.resource
        );
        this.addInfoIcon(resourceParamLabelElement, config.infoUrls.resource);

        let formatParamLabelElement =
            this.formatDropdown.domElement.previousSibling;
        formatParamLabelElement.setAttribute(
            "data-title",
            config.tooltips.format
        );
        this.addInfoIcon(formatParamLabelElement, config.infoUrls.format);

        // Query parameters
        this.queryParamControllers.forEach((queryParamController) => {
            let queryParamLabelElement =
                queryParamController.domElement.previousSibling;
            queryParamLabelElement.setAttribute(
                "data-title",
                config.tooltips[queryParamLabelElement.textContent]
            );
            this.addInfoIcon(
                queryParamLabelElement,
                config.infoUrls[queryParamLabelElement.textContent]
            );
        });

        let apiKeyParamLabelElement =
            this.apiKeyTextBox.domElement.previousSibling;
        apiKeyParamLabelElement.setAttribute(
            "data-title",
            config.tooltips.apiKey
        );
        this.addInfoIcon(apiKeyParamLabelElement, config.infoUrls.apiKey);
    }

    updateMap() {
        this.gui.updateDisplay(); // Refresh controller UI

        this.map.setBaseLayer(this.getRasterTileLayer());

        this.updateUrlTemplate();
        updateUrl();
    }

    buildMapUI = (map) => {
        try {
            new H.ui.UI(map, {
                zoom: {
                    fractionalZoom: false,
                    alignment: H.ui.LayoutAlignment.RIGHT_BOTTOM,
                },
            });
        } catch (error) {
            console.warn("Error attempting to build map UI: " + error);
        }
    };

    getRasterTileLayer() {
        let tileSize =
            this.size == config.emptyParamValue
                ? config.defaultSize
                : parseInt(this.size);

        let platform = new H.service.Platform({
            apikey: this.apiKey,
        });

        let rasterTileService = platform.getRasterTileService({
            resource: this.getResourceParam(),
            format: this.getFormatParam(),
            queryParams: this.getQueryParamsMapping(),
        });

        let rasterTileProvider = new H.service.rasterTile.Provider(
            rasterTileService,
            {
                tileSize: tileSize,
                engineType: this.engineType,
            }
        );

        let rasterTileLayer = new H.map.layer.TileLayer(rasterTileProvider);
        return rasterTileLayer;
    }

    createMap() {
        // Dispose old map if exists
        this.map && this.map.dispose();

        if (window.location.hash) {
            let mapPosition = window.location.hash
                .substring(1)
                .split("/")[0]
                .split(",");

            let lat = Number(mapPosition[0]),
                lng = Number(mapPosition[1]);
            this.zoom = Number(mapPosition[2]);
            this.center = { lat: lat, lng: lng };
        }

        let rasterTileLayer = this.getRasterTileLayer();
        this.map = new H.Map(document.getElementById("map"), rasterTileLayer, {
            zoom: this.zoom,
            center: this.center,
            engineType: this.engineType,
        });

        // MapEvents enables the event system.
        // The behavior variable implements default interactions for pan/zoom (also on touch devices).
        const behavior = new H.mapevents.Behavior(
            new H.mapevents.MapEvents(this.map)
        );

        // Enable dynamic resizing of the map, based on the current size of the enclosing container
        window.addEventListener("resize", () =>
            this.map.getViewPort().resize()
        );

        // Create zoom control UI
        this.buildMapUI(this.map);

        this.map.addEventListener("mapviewchangeend", updateUrl);
    }

    setMapState() {
        if (window.location.hash) {
            let mapStateParams = window.location.hash
                .substring(1)
                .split("/")[1]
                .split("&");
            for (let mapStateParam of mapStateParams) {
                let paramDetails = mapStateParam.split("=");
                let paramName = paramDetails[0],
                    paramValue = paramDetails[1];

                if (paramName == "features") {
                    let features = paramValue.split(",");

                    features.forEach((feature) => {
                        let featureDetails = feature.split(":");
                        let featureName = featureDetails[0],
                            modeValue = featureDetails[1];

                        // For each feature dropdown, check if feature name matches.
                        // If yes, set the value of corresponding dropdown.
                        this.featureControllers.forEach((featureController) => {
                            if (featureController.initialValue == featureName) {
                                featureController.setValue(modeValue);
                            }
                        });
                    });
                } else {
                    this[paramName] = paramValue;
                }

                if (paramName == "style") {
                    this.addFeatureControls(); // To update feature controls as per style
                }
            }
        }

        this.updateMap();
    }

    addSearchUI() {
        this.searchUI = new search.SearchUI(this.map);
    }

    buildQueryParamsString(apiKey) {
        let queryParamsString = this.getQueryParamsString();
        queryParamsString = queryParamsString
            ? `?${queryParamsString}&${apiKey}`
            : `?${apiKey}`;

        return queryParamsString;
    }

    updateUrlTemplate() {
        let pathParamString = `/${config.path}/${this.getResourceParam()}/${
            config.projection
        }/{z}/{x}/{y}/${this.getFormatParam()}`;

        let apiKeyTemplate = "apiKey={API_KEY}";
        let queryParamsString = this.buildQueryParamsString(apiKeyTemplate);

        this.urlTemplate = `${pathParamString}${queryParamsString}`;

        this.urlTemplateDomElement.innerText = this.urlTemplate;
    }

    downloadClientCodeFile(templateFile, htmlFile, view) {
        fetch(`templates/${templateFile}`)
            .then((response) => response.text())
            .then((template) => {
                let rendered = Mustache.render(template, view);
                this.downloadFile(htmlFile, rendered);
            });
    }

    exportClientCodeHereMapsApiForJs() {
        let tileSize =
            this.size == config.emptyParamValue
                ? config.defaultSize
                : parseInt(this.size);

        let view = {
            resource: this.getResourceParam(),
            format: this.getFormatParam(),
            center: JSON.stringify(this.map.getCenter()),
            zoom: this.map.getZoom(),
            tileSize: tileSize,
            queryParams: JSON.stringify(this.getQueryParamsMapping()),
            apiKey: this.apiKey,
        };

        this.downloadClientCodeFile(
            "here-maps-api-for-js-client-code.mustache",
            "rts_here_maps_api_for_js.html",
            view
        );
    }

    exportClientCodeLeaflet() {
        console.log("inside exportClientCodeLeaflet()...");
        let center = this.map.getCenter();
        let latLng = [center["lat"].toFixed(6), center["lng"].toFixed(6)],
            queryParamsString = this.buildQueryParamsString(
                this.getApiKeyParam()
            );

        let view = {
            latLng: latLng,
            zoom: this.map.getZoom(),
            resource: this.getResourceParam(),
            format: this.getFormatParam(),
            queryParamsString: queryParamsString,
            year: new Date().getFullYear(),
        };

        this.downloadClientCodeFile(
            "leaflet-client-code.mustache",
            "rts_leaflet.html",
            view
        );
    }

    addExportControls() {
        this.exportFolder = this.gui.addFolder("Export");

        this.exportFolder
            .add(this, "exportClientCodeHereMapsApiForJs")
            .name("Client Code - HERE Maps API for JavaScript");
        this.exportFolder
            .add(this, "exportClientCodeLeaflet")
            .name("Client Code - Leaflet");
    }

    downloadFile(fileName, text) {
        var element = document.createElement("a");
        element.setAttribute(
            "href",
            "data:text/plain;charset=utf-8," + encodeURIComponent(text)
        );
        element.setAttribute("download", fileName);

        element.style.display = "none";
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    buildDemo() {
        this.setMapConfig().then(() => {
            this.createControlUI();
            this.createMap();
            this.setMapState();
            this.addSearchUI();
            this.addExportControls();
            this.updateUrlTemplate();
        });
    }
}

rts = new RasterTileService();
rts.buildDemo();
