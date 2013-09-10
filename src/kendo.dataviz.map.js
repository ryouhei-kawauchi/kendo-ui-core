kendo_module({
    id: "dataviz.map",
    name: "Map",
    category: "dataviz",
    description: "",
    depends: [ "data", "userevents", "dataviz.core", "dataviz.svg", "dataviz.themes" ]
});

(function ($, undefined) {
    // Imports ================================================================
    var math = Math,
        atan = math.atan,
        exp = math.exp,
        pow = math.pow,
        sin = math.sin,
        log = math.log,
        tan = math.tan,

        kendo = window.kendo,
        Class = kendo.Class,
        Widget = kendo.ui.Widget,

        dataviz = kendo.dataviz,
        Point = dataviz.Point2D,
        deepExtend = kendo.deepExtend,
        limit = dataviz.limitValue;

    // Constants ==============================================================
    var PI = math.PI,
        PI_DIV_2 = PI / 2,
        PI_DIV_4 = PI / 4,
        DEG_TO_RAD = PI / 180;

    // Map ====================================================================
    var Map = Widget.extend({
        init: function(element, options) {
        },

        options: {
            name: "Map"
        }
    });

    var Location = function(lat, lng) {
        this.lat = lat;
        this.lng = lng;
    };

    var WGS84Datum = {
        a: 6378137,                 // Semi-major radius
        b: 6356752.314245179,       // Semi-minor radius
        f: 0.0033528106647474805,   // Flattening
        e: 0.08181919084262149      // Eccentricity
    };

    // Used by EPSG:3857
    var SphericalMercator = {
        MAX_LNG: 180,
        MAX_LAT: 85.0511287798,

        project: function(ll) {
            var proj = this,
                lat = limit(ll.lat, -proj.MAX_LAT, proj.MAX_LAT),
                lng = limit(ll.lng, -proj.MAX_LNG, proj.MAX_LNG),
                x = rad(lng),
                y = log(tan(PI_DIV_4 + rad(ll.lat) / 2));

            return new Point(x, y);
        }
    };

    // Used by EPSG:3395
    var Mercator = Class.extend({
        init: function(options) {
            this.options = deepExtend({}, this.options, options);
        },

        MAX_LNG: 180,
        MAX_LAT: 85.0840590501,
        REVERSE_ITERATIONS: 15,
        REVERSE_CONVERGENCE: 1e-12,

        options: {
            centralMeridian: 0,
            datum: WGS84Datum
        },

        project: function(geo) {
            var proj = this,
                options = proj.options,
                datum = options.datum,
                r = datum.a,
                ecc = datum.e,
                lng0 = options.centralMeridian,
                lat = limit(geo.lat, -proj.MAX_LAT, proj.MAX_LAT),
                lng = limit(geo.lng, -proj.MAX_LNG, proj.MAX_LNG),
                x = rad(lng - lng0) * r,
                y = rad(lat),
                ts = tan(PI_DIV_4 + y / 2),
                con = ecc * sin(y),
                p = pow((1 - con) / (1 + con), ecc / 2);

            // See:
            // http://en.wikipedia.org/wiki/Mercator_projection#Generalization_to_the_ellipsoid
            y = r * log(ts * p);

            return new Point(x, y);
        },

        reverse: function(point) {
            var proj = this,
                options = proj.options,
                datum = options.datum,
                r = datum.a,
                ecc = datum.e,
                ecch = ecc / 2,
                lng0 = options.centralMeridian,
                lng = point.x / (DEG_TO_RAD * r) + lng0,
                ts = exp(-point.y / r),
                phi = PI_DIV_2 - 2 * atan(ts),
                i;

            for (i = 0; i <= proj.REVERSE_ITERATIONS; i++) {
                var con = ecc * sin(phi),
                    p = pow((1 - con) / (1 + con), ecch),
                    dphi = PI_DIV_2 - 2 * atan(ts * p) - phi;

                phi += dphi;

                if (math.abs(dphi) <= proj.REVERSE_CONVERGENCE) {
                    break;
                }
            }

            return new Location(deg(phi), lng);
        }
    });

    function rad(degrees) {
        return degrees * DEG_TO_RAD;
    }

    function deg(radians) {
        return radians / DEG_TO_RAD;
    }

    // Exports ================================================================
    dataviz.ui.plugin(Map);

    deepExtend(dataviz, {
        spatial: {
            projections: {
                Mercator: Mercator,
                SphericalMercator: SphericalMercator,

                WGS84Datum: WGS84Datum
            },

            Location: Location
        }
    });

})(window.kendo.jQuery);
