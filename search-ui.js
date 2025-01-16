const dat = require("dat.gui");

const INPUT_TYPE = {
    ZXY: "z/x/y",
    LAT_LNG_ZOOM: "lat,lng,zoom",
    LAT_LNG: "lat,lng",
    TILE_ID: "tileId",
};

const INPUT_COLOR = {
    RED: "#ed4337",
    GREEN: "#99e898",
    WHITE: "#eee",
};

const regexConfig = {
    // Use of computed property names introduced in ES6
    [INPUT_TYPE.ZXY]: "^([0-2]?[0-9])\\/(\\d+)\\/(\\d+)$",
    [INPUT_TYPE.LAT_LNG_ZOOM]:
        "^([-+]?\\d{1,3}[.]?\\d*),\\s*([-+]?\\d{1,3}[.]?\\d*),\\s*([0-2]?[0-9])$",
    [INPUT_TYPE.LAT_LNG]:
        "^([-+]?\\d{1,3}[.]?\\d*),\\s*([-+]?\\d{1,3}[.]?\\d*)$",
    [INPUT_TYPE.TILE_ID]: "^(\\d+)$",
};

/**
 * Calculates the zoom's addend based on map's pixelRatio
 * and base layer's current tile size.
 */
const getZoomAddend = (pixelRatio, tileSize) => {
    let defaultTileSize = pixelRatio >= 1.5 ? 512 : 256,
        zoomAddend = Math.log2(defaultTileSize) - Math.log2(tileSize);

    return zoomAddend;
};

/**
 * Calculates x,y,z tile keys based on quadKey.
 */
const quadKeyToXyz = (quadKey) => {
    let x = 0,
        y = 0,
        quadKeyArr = quadKey.toString().split(""),
        z = quadKey.length;

    for (var i = z; i > 0; i--) {
        var mask = 1 << (i - 1);
        var q = +quadKey[z - i];
        if (q === 1) x |= mask;
        if (q === 2) y |= mask;
        if (q === 3) {
            x |= mask;
            y |= mask;
        }
    }

    return { x, y, z };
};

/**
 * Calculates geo point based on x,y,z tile keys.
 * It uses maps API's internal method `H.geo.mercator.xyToGeo`.
 */
const xyzToGeoPoint = (x, y, z) => {
    const size = Math.pow(2, z);
    return H.geo.mercator.xyToGeo((x + 0.5) / size, (y + 0.5) / size);
};

/**
 * Calculates LookAt {position, zoom} based on x,y,z tile keys
 */
const xyzToLookAt = (x, y, z, pixelRatio, tileSize) => {
    let geo = xyzToGeoPoint(x, y, z),
        zoomAddend = getZoomAddend(pixelRatio, tileSize);

    return {
        position: geo,
        zoom: z - zoomAddend,
    };
};

/**
 * Calculates LookAt {position, zoom} based on tile ID
 */
const tileIdToLookAt = (tileId, pixelRatio, tileSize) => {
    let quadKey = tileId.toString(4).slice(1),
        { x, y, z } = quadKeyToXyz(quadKey),
        geo = xyzToGeoPoint(x, y, z);

    z = z - getZoomAddend(pixelRatio, tileSize);

    return {
        position: geo,
        zoom: z,
    };
};
/**
 * Creates search box UI and updates map's view
 * based on input provided by user
 */
class SearchUI {
    constructor(map) {
        let config = {
            input: "",
        };

        // Create UI
        const gui = new dat.GUI();
        gui.domElement.id = "searchUI";
        gui.width = 300;

        // Add search input box
        const inputController = gui
            .add(config, "input")
            .onFinishChange((val) => {
                if (val) {
                    this.matchInputAndUpdate(val);
                }
            })
            .onChange((val) => {
                // reset input color on change
                this.inputDomElement.style.color = INPUT_COLOR.WHITE;
            });
        inputController.name(""); // Remove controller name

        // Update css styles and placeholder text
        const guiDom = gui.domElement,
            controllerDom = inputController.domElement,
            inputDom = controllerDom.querySelector("input");

        guiDom.style.cssFloat = "left";
        guiDom.style.margin = "10px";
        guiDom.querySelector(".close-button").style.display = "none";
        guiDom.querySelector("li.string").style.height = "36px";
        controllerDom.style.width = "100%";
        controllerDom.style.marginLeft = "2px";
        inputDom.style.height = "23px";
        inputDom.style.fontSize = "14px";
        inputDom.placeholder = "Search for lat,lng[,zoom] or z/x/y or tileId";

        // Create class global properties
        this.map = map;
        this.config = config;
        this.pixelRatio = this.map.getPixelRatio();
        this.inputDomElement =
            inputController.domElement.querySelector("input");
    }

    /**
     * This function updates map object property and map related properties.
     * Useful if map object is re-created.
     */
    updateProperties(map) {
        this.map = map;
        this.pixelRatio = this.map.getPixelRatio();
    }

    /**
     * This function matches the input against each regex and
     * updates map if a match is found.
     */
    matchInputAndUpdate(input) {
        let keys = Object.keys(regexConfig),
            found = false;

        // Check the input string against each regex from the config
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i],
                regex = regexConfig[key],
                match = input.match(regex);

            if (match) {
                found = true;
                this.updateMap(key, match);
                break;
            }
        }

        // Change input color if no match found
        if (!found) {
            this.inputDomElement.style.color = INPUT_COLOR.RED;
        }
    }

    /**
     * Asks for proper geo coordinate and zoom level
     * and updates the map view accordingly
     */
    updateMap(key, match) {
        let pixelRatio = this.pixelRatio,
            tileSize = this.map.getBaseLayer().tileSize;

        switch (key) {
            case INPUT_TYPE.ZXY: {
                let z = parseInt(match[1]),
                    x = parseInt(match[2]),
                    y = parseInt(match[3]),
                    lookAt = xyzToLookAt(x, y, z, pixelRatio, tileSize);

                this.setLookAt(lookAt, true);
                break;
            }
            case INPUT_TYPE.LAT_LNG_ZOOM: {
                let lookAt = {
                    position: { lat: match[1], lng: match[2] },
                    zoom: parseInt(match[3]),
                };

                this.setLookAt(lookAt, true);
                break;
            }
            case INPUT_TYPE.LAT_LNG: {
                let lookAt = {
                    position: { lat: match[1], lng: match[2] },
                };

                this.setLookAt(lookAt, true);
                break;
            }
            case INPUT_TYPE.TILE_ID: {
                let tileId = parseInt(match[1]),
                    lookAt = tileIdToLookAt(tileId, pixelRatio, tileSize);

                this.setLookAt(lookAt, true);
                break;
            }
        }
    }

    /**
     * This function updates map's lookAt point and input's color
     */
    setLookAt(lookAt, animation) {
        this.inputDomElement.style.color = INPUT_COLOR.GREEN;
        this.map.getViewModel().setLookAtData(lookAt, animation);
    }
}

module.exports = { SearchUI };
