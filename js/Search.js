var searchBrand = [];
var map;
var directionsDisplay;
var markerArray = [];
var latitude, longitude;
var searchData = [];
var citycoords;
var directionsService;

function changefunc(val) {
    $('#results_panel').hide();
    $('#results_panel').html('');
    //$("#map-canvas").css('height', $(window).height() - 10);

    if (ValueFoundInArray(val).length == 0) {
        $("#txtSearch").val('');
    }
}

function initialize() {
    this.style = function () {
        return [
            {
                featureType: 'water',
                elementType: 'geometry.fill',
                stylers: [
                    { color: '#adc9b8' }
                ]
            }, {
                featureType: 'landscape.natural',
                elementType: 'all',
                stylers: [
                    { hue: '#809f80' },
                    { lightness: -35 }
                ]
            },
            {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [
                    { hue: '#f9e0b7' },
                    { lightness: 30 }
                ]
            }, {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [
                    { color: '#010505' },
                    { weight: .4 },
                    { lightness: 14 }
                ]
            }, {
                featureType: 'road',
                elementType: 'labels',
                stylers: [
                    { saturation: -100 },
                    { invert_lightness: true }
                ]
            }, {
                featureType: 'road.local',
                elementType: 'all',
                stylers: [
                    { hue: '#ffd7a6' },
                    { saturation: 100 },
                    { lightness: -12 }
                ]
            }
        ];
        };

    citycoords = new google.maps.LatLng(latitude, longitude);
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
    var mapOptions = {
        /*mapTypeControlOptions: {
            mapTypeIds: ['Styled']
        },
        mapTypeControl: false, // hide Styled button*/
        zoom: 15,
        zoomControl: true,
        streetViewControl: false,   // hide the man icon
        disableDefaultUI: true,
        scaleControl: true,
        panControl: true,
        panControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        },
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL
                },
        center: citycoords,
        mapTypeId: google.maps.MapTypeId.ROADMAP
        //mapTypeId: 'Styled'
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    google.maps.event.trigger(map, 'resize');

    google.maps.event.addListenerOnce(map, 'idle', function () {
        google.maps.event.trigger(map, 'resize');
        /*setTimeout(function () {
        $('#map-canvas div[title^="Pan"]').css('opacity', 0);
        $('#zoomButtons').css('visibility', 'visible');
        $("#map-canvas").css('visibility', 'visible');
        }, 600);*/
    });

    var styledMapType = new google.maps.StyledMapType(style, { name: 'Styled' });
    //var styledMapType = new google.maps.StyledMapType(styles);
    map.mapTypes.set('Styled', styledMapType);

    var marker = new google.maps.Marker({
        position: citycoords,
        icon: 'img/markercocacola2.png',
        map: map
    });
    map.setCenter(citycoords);

    if (directionsDisplay)
        directionsDisplay.setMap(map);
}

function loadProductData() {
    $.ajax({
        url: 'http://hackathon-env-x4mhi9y3zp.elasticbeanstalk.com/products?callback=foo',
        type: 'GET',
        dataType: 'jsonp',
        crossDomain: true,
        cache: false,
        timeout: 20000, // sets timeout to 15 seconds
        success: function (data) {
            searchBrand = data;
        },
        error: function (x, y, z) {
            if (y === 'timeout')
                alert('Product data timed out');
            else
                alert("Can't get products data");
        }
    });
}

function init() {
    resizeDivs();
    
    $('#txtSearchButton').click(function (e) {
        clearPath();
        GetResultsForString();
    });

    $('#btnMainScreen').click(function (e) {
        var _val = $.trim($("#txtMainScreen").val());

        if (_val.length == 0) {
            alert('Enter a product search string');
            return;
        }

        $("#txtSearch").val($("#txtMainScreen").val()); //ui.item is your object from the array
        initialize();
        $('#mainscreen').hide();
        $("#otherscreen").css("display", "block");
        //$('#otherscreen').show();
        GetResultsForString();
    });

    $('#btnFind').click(function (e) {
        Email();
    });

    // on window resize run function
    $(window).resize(function () {
        fluidDialog();
    });

    // catch dialog if opened within a viewport smaller than the dialog width
    $(document).on("dialogopen", ".ui-dialog", function (event, ui) {
        fluidDialog();
    });

    $("#txtMainScreen").autocomplete({
        source: function (request, response) {
            response(filterArray(request.term));
        },
        minLength: 3,
        change: function (event, ui) {
        },
        focus: function (event, ui) {
            $("#txtMainScreen").val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $("#txtSearch").val(ui.item.label); //ui.item is your object from the array
            changefunc(ui.item.label);
            initialize();
            $('#mainscreen').hide();
            $('#otherscreen').show();
            return false;
        }
    });

    $("#txtSearch").autocomplete({
        source: function (request, response) {
            response(filterArray(request.term));
        },
        minLength: 3,
        change: function (event, ui) {
            return;
            $('#results_panel').hide();
            $('#results_panel').html('');

            if (ValueFoundInArray(this.value).length == 0) {
                this.value = '';
            }
        },
        focus: function (event, ui) {
            $("#txtSearch").val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            $("#txtSearch").val(ui.item.label); //ui.item is your object from the array
            clearPath();
            changefunc(ui.item.label);
            return false;
        }
    });

    $("#txtMainScreen").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#btnMainScreen").click();
            $(".ui-menu-item").hide();
        }
    });

    $("#txtSearch").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#txtSearchButton").click();
            $(".ui-menu-item").hide();
        }
    });

    var _text = $.trim(getParameterByName('text'));

    if (_text.length > 0) {
        initialize();
        $('#mainscreen').hide();
        $('#otherscreen').show();
        $('#results_panel').hide();
        $('#results_panel').html('');
        $("#txtSearch").val(_text);
        GetResultsForString();
    }
}

function fluidDialog() {
    var $visible = $(".ui-dialog:visible");
    // each open dialog
    $visible.each(function () {
        var $this = $(this);
        var dialog = $this.find(".ui-dialog-content").data("ui-dialog");
        // if fluid option == true
        if (dialog.options.fluid) {
            var wWidth = $(window).width();
            // check window width against dialog width
            if (wWidth < (parseInt(dialog.options.maxWidth) + 50)) {
                // keep dialog from filling entire screen
                $this.css("max-width", "90%");
            } else {
                // fix maxWidth bug
                $this.css("max-width", dialog.options.maxWidth + "px");
            }
            //reposition dialog
            dialog.option("position", dialog.options.position);
        }
    });
}

function clearPath() {
    if (directionsDisplay) {
        directionsDisplay.setMap(null);
        directionsDisplay = null;
    }
}

function filterArray(sValue) {
    var aSearch = [];
    var options = {
        caseSensitive: false,
        includeScore: true,
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 70,
        maxPatternLength: 20,
        keys: ['prod.name']
    }
    var f = new Fuse(searchBrand, options);
    var result = f.search(sValue);

    if (result != null && result.length > 0) {
        result = _.sortBy(_.filter(result, function (num) { return num.score <= 0.45 }), function (num) {
            return num.score;
        });
        _.each(result, function (index) {
            aSearch.push(new textboxVals(index.item.prod.name, index.item.prod.code));
        });
    }

    return aSearch;
}

function textboxVals(name, Id) {
    this.label = name;
    this.value = Id;
}

function ValueFoundInArray(sValue) {
    var retVal = '';
    var _tp = MatchStringInJSON(sValue);

    RemoveMarkers();

    if (_tp.length > 0)
        retVal = CallApiUsingIds(_tp);

    return retVal;
}

function CallApiUsingIds(_tp) {
    if (latitude == null || latitude.length == 0) {
        alert('Location not set');
        return;
    }

    var retVal = _tp[0].prod.name;
    var brandCode = _tp[0].brand.code == null || _tp[0].brand.code == '' ? '*' : _tp[0].brand.code;
    var flavorCode = _tp[0].flavor.code == null || _tp[0].flavor.code == '' ? '*' : _tp[0].flavor.code;
    var bevarageCategoryCode = _tp[0].beverageCategory.code == null || _tp[0].beverageCategory.code == '' ? '*' : _tp[0].beverageCategory.code;

    var _url = 'http://hackathon-env-x4mhi9y3zp.elasticbeanstalk.com/api?callback=foo1&brandCode=' + brandCode + '&flavorCode=' + flavorCode +
                        '&bevarageCategoryCode=' + bevarageCategoryCode  + '&latitude=' + latitude + '&longitude=' + longitude;
    $.ajax({
        url: _url,
        type: 'GET',
        dataType: 'jsonp',
        cache: false,
        timeout: 20000, // sets timeout to 15 seconds
        success: function (data) {
            displayResults(data);
        },
        error: function (x, y, z) {
            if (y === 'timeout')
                alert('Retrieving data timed out');
            else
                alert('Error getting the data');
        }
    });

    return retVal;
}

function MatchStringInJSON(sValue) {
    return _.filter(searchBrand, function (b) {
        return b.prod.name.toUpperCase() == sValue.toUpperCase();
    });
}

function GetResultsForString() {
    var _val = $.trim($('#txtSearch').val());

    if (_val.length == 0) {
        alert('Enter a product to search');
        return;
    }

    if (latitude == null || latitude.length == 0) {
        alert('Location not set');
        return;
    }

    RemoveMarkers();
    var _tp = MatchStringInJSON(_val);

    if (_tp.length > 0)
        CallApiUsingIds(_tp);
    else {
        var _url = 'http://hackathon-env-x4mhi9y3zp.elasticbeanstalk.com/api?callback=foo2&text=' + _val + '&latitude=' + latitude + '&longitude=' + longitude;
        $.ajax({
            url: _url,
            type: 'GET',
            dataType: 'jsonp',
            /*contentType: "application/json;charset=utf-8",
            crossDomain: true,
            async: true,*/
            cache: false,
            timeout: 20000, // sets timeout to 15 seconds
            success: function (data) {
                displayResults(data);
            },
            error: function (x, y, z) {
                if (y === "timeout")
                    alert('Service timed out');
                else
                    alert('Error getting the data');
            }
        });
    }
}

function RemoveMarkers() {
    if (markerArray != null && markerArray.length > 0) {
        for (var i = 0; i < markerArray.length; i++) {
            //if (markerArray[i].directions) 
            //    markerArray[i].directions.setMap(null);
                
            markerArray[i].setMap(null);
        }

        markerArray.length = 0;
    }
}

function displayResults(data) {
    $('#results_panel').show();
    searchData = data;
    var _html = '<div class="mCSB1_Container">';
    
    if (searchData != null && searchData.location.length > 0) {
        var num = 0;
        _.each(searchData.location, function (d) {
            var _name = d.outlet.name;
            var _address = d.outlet.address.formattedAddress;
            _html += '<a id="div_' + num + '" onclick="ChangeDivColor(' + num + ')" class="list-group-item" style="cursor:pointer;">' +
                        '<span class="miles">' + d.distance +
                            '<span class="road">miles</span></span>' +
                        "<span onclick='GoToDirections(" + num + ")' class='green'><img src='img/btn-go.png'></span>" +
                        '<span onclick="ShowPop(' + num + ',false)" class="cap"><img src="img/cap.png" id="cap_' + num + '" alt="Product List"></span>' +
                        '<h5 class="list-group-item-heading">' + _name + '</h5>' +
                        '<p class="list-group-item-text">' + _address + '</p></a>';
            _html += '<div id="accord_' + num + '" class="accordiondiv">' + '<div>Products<div><ul>';
            _.each(d.productPackage, function (pp) {
                _html += '<li>' + pp.product.prod.name + ' ' + pp.product.flavor.name + ' ' + pp.package.primaryContainer.name + '</li>'
            });
            _html += '</ul></div></div></div>';
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(d.outlet.address.latitude, d.outlet.address.longitude),
                map: map,
                title: (_name + '\n' + _address),
                icon: 'img/markercocacola.png'
            });

            markerArray.push(marker);
            attachInformation(marker, num);
            num++;
        });
    }
    else
        _html += '<div class="list-group-item">No Record Found</div>';

    _html += '<a class="list-group-item"><button id="btnFind" type="button">Let us know!</button><h5 class="list-group-item-heading">Didn\'t find what you need?</h5></a>';
    _html += "</div>";
    $('#results_panel').html(_html);
    setScrollBarTheme();
}

function GoToDirections(idnum) {
    changeColors(idnum);
    OpenGoogleWndow(searchData.location[idnum]);
}

function OpenGoogleWndow(_tp) {
    window.open('https://www.google.com/maps/dir/' + latitude + ',' + longitude + '/' + _tp.outlet.address.latitude + ',' + _tp.outlet.address.longitude +
                '/data=!3m1!4b1!4m4!4m3!1m0!1m0!3e0', 'Google Maps', null);
}

function ShowPop(idnum, frommap) {
    changeColors(idnum);
    //$("div[id^='accord_']").css("display", 'none');
    $("div[id^='accord_']").each(function (index) {
        if ($(this).css('display') === 'inline-block') {
            if (index != idnum) {
                $(this).css('display', 'none');
                $('#cap_' + index).removeClass('imgrotated');
            }

            return false;
        }
    });

    if ($('#accord_' + idnum).css('display') === 'none' || frommap) {
        $('#accord_' + idnum).css('display', 'inline-block');
        $('#cap_' + idnum).addClass('imgrotated');
    }
    else {
        $('#accord_' + idnum).css('display', 'none');
        $('#cap_' + idnum).removeClass('imgrotated');
    }
    
    //var _tp = searchData.location[idnum];
    //displayPopup(_tp, idnum);
}

function changeColors(idnum) {
    clearPath();
    $("a[id^='div_']").css("background-color", 'white');
    $("#div_" + idnum).css("background-color", 'yellow');
}

function ChangeDivColor(idnum) {
    changeColors(idnum);
    var _tp = searchData.location[idnum];
    getDirections(new google.maps.LatLng(_tp.outlet.address.latitude, _tp.outlet.address.longitude));
}

function attachInformation(marker, num) {
    google.maps.event.addListener(marker, 'click', function () {
        ShowPop(num, true);
        goToByScroll(num);
    });
}

function goToByScroll(id) {
    // Scroll
    $(".content_1").mCustomScrollbar("scrollTo", '#div_' + id);
}

function setScrollBarTheme() {
    /* custom scrollbar fn call */
    $(".content_1").mCustomScrollbar({
        scrollButtons: {
            enable: false
        },
        autoHideScrollbar: true,
        theme: "dark"
    });
}

/*function displayPopup(_tp, idnum) {
    $("#DirectionsView").dialog({
        create: function (event, ui) {
            $("#DirectionsView").prev('.ui-dialog-titlebar').css({ 'background': 'none', 'border': 'none', 'border-bottom': '1px !important', 'border-color': '#e5e5e5' });
            $("#DirectionsView").prev(".ui-dialog-titlebar").html("<label class='titlename' /><a href='#' id='closebtn'><i  class='fa fa-times-circle myCloseIcon'></i></a>");
            $(".ui-widget-overlay").css({ 'opacity': '0.9' });
        },
        position: ['middle', 60],
        draggable: false,
        autoOpen: false,
        maxWidth: 1000,
        //minHeight: 100,
        //maxHeight: 700,
        width: 'auto', // overcomes width:'auto' and maxWidth bug
        height: 'auto',
        fluid: true, //new option
        modal: true,
        resizable: false,
        show: 'fade',
        hide: 'fade',
        open: function () {
            $(".titlename").text(_tp.outlet.name);
            $("#lblAddress").text(_tp.outlet.address.formattedAddress);
            $('#divProducts').html('');
            var _html = '<ul>';

            //$('#divDirections').html(_html);
            _.each(_tp.productPackage, function (pp) {
                _html += '<li>' + pp.product.prod.name + ' ' + pp.product.flavor.name + ' ' + pp.package.primaryContainer.name + '</li>'
            });
            _html += "</ul>";
            _html += "<div><span onclick='GoToDirections(" + idnum +
                     ")' class='green'><img src='img/btn-go.png'></span></div>";

            $('#divProducts').html(_html);
        },
        close: function () {
            $(this).dialog("close");
        }
    });

    $("#DirectionsView").dialog("option", "width", $(window).width() / 2);
    //$("#DirectionsView").dialog("option", "height", $(window).height() / 2);

    $("#closebtn").click(function () {
        $("#DirectionsView").dialog("close");
    });

    $("#DirectionsView").dialog("open");
    resizeCloseButton();
}*/

function foo(data) {

}

function foo1(data) {

}

function foo2(data) {

}

function getLocation() {
    $('#results_panel').hide();
    latitude = getParameterByName('latitude');
    longitude = getParameterByName('longitude');

    if (latitude == null || latitude.length == 0 || longitude == null || longitude.length > 0) {
        if (navigator.geolocation) {
            var options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(showPosition, errorGeoLocation, options);
        } else {
            UseIpToLocate();
        }
    }
}

function UseIpToLocate() {
    $.get("http://ipinfo.io", function (response) {
        var ip = response.loc;
        var arr = ip.split(',');
        latitude = arr[0];
        longitude = arr[1];
    }, "jsonp");
    init();
}

function errorGeoLocation(err) {
    //UseIpToLocate();
    switch (err.code) {
        case 0:
            alert("Unknown Error - has occured");
            break;
        case 1:
            alert("Permission Denied - By the user");
            break;
        case 2:
            alert("Position/Location Unavailable");
            break;
        case 3:
            alert("Timeout");
            break;
        default:
            alert('ERROR(' + err.code + '): ' + err.message);
            break;
    }
};

function showPosition(pos) {
    latitude = pos.coords.latitude;
    longitude = pos.coords.longitude;
    init();
}

function getDirections(end) {
    //$('#divDirections').html('');
    var request = {
        origin: citycoords,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            var directionsDisplayOptions = {
                suppressMarkers: true, // since we are creating custom markers
                suppressInfoWindows: false,
                preserveViewport: false
            };

            directionsDisplay = new google.maps.DirectionsRenderer(directionsDisplayOptions);
            directionsDisplay.setMap(map);
            directionsDisplay.setDirections(result);
        }
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function Email() {
    var _val = $.trim($('#txtSearch').val());

    if (_val.length == 0) {
        alert('Enter a product to search');
        return;
    }

    var sMailTo = "mailto:";
    var sBody = 'Product Searched: "' + _val + '"\nLocation: ' + latitude + ', ' + longitude;
    sMailTo += escape("saransari@coca-cola.com") + "?subject=" + escape("Product Request") + "&body=" + escape(sBody);
    window.location.href = sMailTo;
}

function resizeDivs() {
    $("#map-canvas").css('width', $(window).width());
    $("#map-canvas").css('height', $(window).height() / 2);
    $("#results_panel").css('height', $(window).height() - $("#map-canvas").height() - 5);
}

window.onresize = function () {
    resizeDivs();
};