jQuery(document).ready(function ($) {

	function addParam(url, param, value) {
		var a = document.createElement('a'),
			regex = /(?:\?|&amp;|&)+([^=]+)(?:=([^&]*))*/g;
		var match, str = [];
		a.href = url;
		param = encodeURIComponent(param);
		while (match === regex.exec(a.search))
			if (param != match[1]) str.push(match[1] + (match[2] ? "=" + match[2] : ""));
		str.push(param + (value ? "=" + encodeURIComponent(value) : ""));
		a.search = str.join("&");
		return a.href;
	}

	function getScrollbarWidth() {
		var outer = document.createElement("div");
		outer.style.visibility = "hidden";
		outer.style.width = "100px";
		outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

		document.body.appendChild(outer);

		var widthNoScroll = outer.offsetWidth;
		// force scrollbars
		outer.style.overflow = "scroll";

		// add innerdiv
		var inner = document.createElement("div");
		inner.style.width = "100%";
		outer.appendChild(inner);

		var widthWithScroll = inner.offsetWidth;

		// remove divs
		outer.parentNode.removeChild(outer);

		return widthNoScroll - widthWithScroll;
	}

	var resizedo;
	window.addEventListener('resize', function (event) {
		if (typeof (placePins) == "function") {
			clearTimeout(resizedo);
			resizedo = setTimeout(placePins("resize"), 100);
		}
	});

	//parse pin links to reveal host
	function parsePinUrl(url) {
		if (url !== null) {
			var urlParts = url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/);

			return urlParts[0];
		} else {
			return "";
		}
	}

	//function to check if element is in viewport
	$.fn.isOnScreen = function () {
		var element = this.get(0);
		var bounds = element.getBoundingClientRect();
		return bounds.top < window.innerHeight && bounds.bottom > 0;
	};


	//hover opacity over pin images
	$(document).on("mouseenter", ".pindiv_pinWrapper_content", function () {
		$(this).css({
			"opacity": 0.9,
			"-webkit-opacity": 0.9,
			"-moz-opacity": 0.9
		}).find(".pindiv_pinWrapper_sourcelink").css({
			"opacity": 1,
			"-webkit-opacity": 1,
			"-moz-opacity": 1
		});
		$(this).find(".pin_data_pinbutton").css({
			"opacity": 1,
			"-webkit-opacity": 1,
			"-moz-opacity": 1
		});
	});

	$(document).on("mouseleave", ".pindiv_pinWrapper_content", function () {
		$(this).css({
			"opacity": 1,
			"-webkit-opacity": 1,
			"-moz-opacity": 1
		}).find(".pindiv_pinWrapper_sourcelink").css({
			"opacity": 0,
			"-webkit-opacity": 0,
			"-moz-opacity": 0
		});
		$(this).find(".pin_data_pinbutton").css({
			"opacity": 0,
			"-webkit-opacity": 0,
			"-moz-opacity": 0
		});
	});

	function lazyLoadScroll() {
		setTimeout(function () {
			for (var i = 0; i < $(".pindiv_pinWrapper").length; i++) {
				$thisPin = $(".pindiv_pinWrapper:eq(" + i + ")");
				if ($thisPin.isOnScreen() && $thisPin.attr("bg-image") !== undefined) {
					var pinBgImage = $thisPin.attr("bg-image");
					$thisPin.find(".pindiv_pinWrapper_content").css("background-image", "url(" + pinBgImage + ")");
					$thisPin.removeAttr("bg-image");
				}
			}
		}, 300);
	}


	//  DOM interaction//

	function Ace_pinWidget() {

		$("div[data-pin]").each(function () {
			var currentpindiv = this;
			var pinusername = $(currentpindiv).attr("data-pin-user");
			var pintype = $(currentpindiv).attr("data-pin-type");
			var pinheader = $(currentpindiv).attr("data-pin-header");
			var pinheight = $(currentpindiv).attr("data-pin-height");
			var pinlimit = Number($(currentpindiv).attr("data-pin-limit"));
			var pinshowbutton = $(currentpindiv).attr("data-pin-pinbutton");
			var pinshowsource = $(currentpindiv).attr("data-pin-sourcelink");
			var descrTrimlength = Number($(currentpindiv).attr("data-pin-descrlength"));

			var pin_columnsize = (Number($(currentpindiv).attr("data-pin-pinwidth")) > 0) ? Number($(currentpindiv).attr("data-pin-pinwidth")) : 237;

			var pinwidth = ($(this).attr("data-pin-width") == 'responsive') ? "100%" : $(currentpindiv).attr("data-pin-width") + "px";

			var pinuserboard;
			var pinApiUrl;
			if ($(this).attr("data-pin-type") == 'board') {
				pinuserboard = $(currentpindiv).attr("data-pin-board");

				pinApiUrl = 'https://api.pinterest.com/v1/me/pins/?access_token=AfOCyWlOkZh-sz233jcnVn4pRUkwFKfawM9-mEND0tprnGBHHQAAAAA&fields=id%2Clink%2Cnote%2Curl%2Cboard%2Ccreator%2Cimage%2Ccounts%2Ccolor%2Cmedia%2Cmetadata%2Coriginal_link';

			}
			if ($(this).attr("data-pin-type") == 'user') {
				pinApiUrl = "https://api.pinterest.com/v1/me/pins/?access_token=AfOCyWlOkZh-sz233jcnVn4pRUkwFKfawM9-mEND0tprnGBHHQAAAAA&fields=id%2Clink%2Cnote%2Curl%2Cboard%2Ccreator%2Cimage%2Ccounts%2Ccolor%2Cmedia%2Cmetadata%2Coriginal_link";

			}

			// the real  thing //

			$.ajax({
				url: pinApiUrl,
				jsonp: "callback",
				dataType: "jsonp",
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(textStatus, errorThrown);
				},
				success: function (jsonData) {

					var pinobj = jQuery.parseJSON(JSON.stringify(jsonData));
					console.log(pinobj);


					pinobj = jQuery.parseJSON(JSON.stringify(jsonData).replace(/\"237x/g, "\"largeimg"));
					// console.log(pinobj);


					//$(currentpindiv).html(pinobj.data.user.full_name);
					$(currentpindiv).css({
						"width": pinwidth,
						"height": pinheight
					});


					$(currentpindiv).append("<div class='pindiv_container'><div class='pindiv_container_inner'></div></div>");
					if (pinheight > 0) {

						$(currentpindiv).find(".pindiv_container").css({
							"height": pinheight
						});

					}


					//create pin columns

				
					var pinstoshow = (pinlimit < pinobj.data.length && pinlimit > 0) ? pinlimit : pinobj.data.length;

					for (var i = 0; i < pinstoshow; i++) {

						if (descrTrimlength === 0) {
							descriptionTrim = "";

						} else if (descrTrimlength == -1) {
							descriptionTrim = pinobj.data[i].note;
						} else {
							if (pinobj.data[i].note.length > descrTrimlength && descrTrimlength !== 0) {
								var descriptionTrim = pinobj.data[i].note.substring(0, descrTrimlength);
								descriptionTrim += "...";
							} else {
								descriptionTrim = pinobj.data[i].note;
							}
						}

						//check if pin link exists and set pin to append with or without link
						

						var pintoappend = (pinshowsource == "yes" && pinobj.data[i].original_link !== null) ? "<div class='pindiv_pinWrapper' bg-image='" + pinobj.data[i].image.original.url + "'> 	<div class='pindiv_pinWrapper_content' style='background-color: " + pinobj.data[i].color + ";width:" + pin_columnsize + "px;height:" + pinobj.data[i].image.original.height * pin_columnsize / 237 + "px;'> 	<a class='pindiv_pinWrapper_pinlink' target='_blank' style='width:" + pin_columnsize + "px;height:" + Math.floor((pinobj.data[i].image.original.height - 40) * pin_columnsize / 237) + "px' href='" + pinobj.data[i].url + "'></a> 	<a class='pindiv_pinWrapper_sourcelink' target='_blank' href='" + pinobj.data[i].original_link + "'>" + parsePinUrl(pinobj.data[i].original_link) + "</a> </div> <div class='pindiv_pinWrapper_decr' style='width:" + pin_columnsize + "px'>" + descriptionTrim + "</div> </div>" : 
						"<div class='pindiv_pinWrapper' bg-image='" + pinobj.data[i].image.original.url + "'> 	<div class='pindiv_pinWrapper_content' style='background-color: " + pinobj.data[i].color + ";width:" + pin_columnsize + "px;height:" + pinobj.data[i].image.original.height * pin_columnsize / 237 + "px;'> 	<a class='pindiv_pinWrapper_pinlink' target='_blank' style='width:" + pin_columnsize + "px;height:" + Math.floor((pinobj.data[i].image.original.height - 40) * pin_columnsize / 237) + "px' href='" + pinobj.data[i].url + "'></a> 	</div> <div class='pindiv_pinWrapper_decr' style='width:" + pin_columnsize + "px'>" + descriptionTrim + "</div> </div>";
						$(currentpindiv).find(".pindiv_container_inner").append(pintoappend);

						if (pinshowbutton == "yes") {
							var pinurl = addParam("https://www.pinterest.com/pin/create/button/", "url", "" + pinobj.data[i].url + "");
							pinurl = addParam(pinurl, "media", pinobj.data[i].image.original.url);
							pinurl = addParam(pinurl, "description", pinobj.data[i].note);

							$(currentpindiv).find(".pindiv_pinWrapper_content:eq(" + i + ")").append("<a class='pin_data_pinbutton' href='" + pinurl + "'    target='_blank' data-pin-do='buttonPin'    data-pin-config='above' style='left:" + (pin_columnsize - 40) / 2 + "px;'></a>");

						}

					}

					window.placePins = function (arg) {
						if (arg == "resize") {
							var scroll = 0;
						} else {
							var scroll = getScrollbarWidth();
						}

						//set pin columns margins
						if (pinheight > 0 === false) {
							var scrollbarsize = getScrollbarWidth();
						} else {
							var scrollbarsize = 0;
							var scroll = 0;
						}

						/* if($("div[data-pin]")[0].style.width.indexOf("%") > -1){
						                                                                var scrollbar = 0;
						                                                        }
						                                                        */

						var pin_columns = Math.floor(($(currentpindiv).find('.pindiv_container').width() - scrollbarsize) / (pin_columnsize + 5));

						var pincolumns_margin = Math.floor(($(currentpindiv).find('.pindiv_container').width() - scroll - (pin_columns * pin_columnsize)) / (pin_columns + 1));

						var columnprop = [];
						for (var c = 0; c < pin_columns; c++) {
							columnprop[c] = 0;
						}

						for (var c = 0; c < $(currentpindiv).find(".pindiv_pinWrapper").length; c++) {
							var pinposwidth;
							var pinposheight;
							if (c < pin_columns) {

								pinposheight = 20;
								pinposwidth = (pin_columnsize + pincolumns_margin) * (c) + pincolumns_margin;
								columnprop[c] = $(currentpindiv).find(".pindiv_pinWrapper:eq(" + c + ")").outerHeight(true) + pinposheight;

							} else {

								var smallestcolumnheight = Math.min.apply(Math, columnprop);
								var smallestcollumn = columnprop.indexOf(smallestcolumnheight);
								columnprop[smallestcollumn] = columnprop[smallestcollumn] + $(currentpindiv).find(".pindiv_pinWrapper:eq(" + c + ")").outerHeight(true);
								pinposheight = smallestcolumnheight;

								pinposwidth = (pin_columnsize + pincolumns_margin) * (smallestcollumn) + pincolumns_margin;
							}

							$(currentpindiv).find(".pindiv_pinWrapper:eq(" + c + ")").css({
								"-webkit-transform": "translate3d(" + pinposwidth + "px," + pinposheight + "px,0)"
							});
							$(currentpindiv).find(".pindiv_pinWrapper:eq(" + c + ")").css({
								"-moz-transform": "translate3d(" + pinposwidth + "px," + pinposheight + "px,0)"
							});
							$(currentpindiv).find(".pindiv_pinWrapper:eq(" + c + ")").css({
								"transform": "translate3d(" + pinposwidth + "px," + pinposheight + "px,0)"
							});
						}

						if (pinheight > 0 === false) {
							$(currentpindiv).find(".pindiv_container_inner").css({
								"height": Math.max.apply(Math, columnprop) + "px"
							});
						}
						lazyLoadScroll();
					};
					placePins();

					//determine if pin is on screen to lazy load initially
					for (var i = 0; i < pinstoshow; i++) {
						$thisPin = $(currentpindiv).find(".pindiv_pinWrapper:eq(" + i + ")");
						if ($thisPin.isOnScreen() && $thisPin.attr("bg-image") !== undefined) {

							var pinBgImage = $thisPin.attr("bg-image");

							$thisPin.find(".pindiv_pinWrapper_content").css("background-image", "url(" + pinBgImage + ")");
							$thisPin.removeAttr("bg-image");
						}
					}

					//bind lazy scroll to div if height is determined or to window
					if (pinheight > 0) {
						$(currentpindiv).find('.pindiv_container_inner').bind('scroll', function () {

							lazyLoadScroll();
						});
					} else {
						window.onscroll = function () {

							lazyLoadScroll();
						};
					}



				}

			});

		});

	}

	if ($("select.inputdescr").val() == "trim") {
		$("div.trimto input").removeClass("ctrldisabled").removeAttr("disabled");
		$("div.trimto span").removeClass("ctrldisabled");
	} else {
		$("div.trimto input").addClass("ctrldisabled").attr("disabled", "disabled");
		$("div.trimto span").addClass("ctrldisabled");
	}

	function generatedivcode() {
		if ($("input.inputboard").val().length) {
			var pintype = "board";
		} else {
			var pintype = "user";
		}

		var username = $("input.inputuser").val();
		var board = $("input.inputboard").val();

		if ($("input.inputheader:checked").length) {
			var header = "yes";
		} else {
			var header = "no";
		}

		if ($("input.inputresponsive:checked").length || Number($("input.inputwidth").val()) <= 0 || isNaN(Number($("input.inputwidth").val()))) {
			var width = "responsive";
		} else {
			var width = Number($("input.inputwidth").val());
		}

		if ($("input.inputautoheight:checked").length || Number($("input.inputheight").val()) <= 0 || isNaN(Number($("input.inputheight").val()))) {
			var height = "auto";
		} else {
			var height = Number($("input.inputheight").val());
		}

		if ($("input.inputdefaultwidth:checked").length || Number($("input.inputpinwidth").val()) <= 0 || isNaN(Number($("input.inputpinwidth").val()))) {
			var pwidth = 237;
		} else {
			var pwidth = Number($("input.inputpinwidth").val());
		}

		if ($("input.inputdefaultwidthmax:checked").length || Number($("input.inputpinstoshow").val()) <= 0 || Number($("input.inputpinstoshow").val()) > 100 || isNaN(Number($("input.inputpinstoshow").val()))) {
			var ptoshow = 100;
		} else {
			var ptoshow = Number($("input.inputpinstoshow").val());
		}

		if ($("input.inputshowpinbtn:checked").length) {
			var showpbtn = "yes";
		} else {
			var showpbtn = "no";
		}

		if ($("input.inputshowsrc:checked").length) {
			var showpsrc = "yes";
		} else {
			var showpsrc = "no";
		}

		if ($("select.inputdescr").val() == "yes") {
			var descrlength = -1;
		} else if ($("select.inputdescr").val() == "no") {
			var descrlength = 0;
		} else {

			if (Number($("input.inputdescrlength").val()) > 0) {
				var descrlength = $("input.inputdescrlength").val();
			} else {
				var descrlength = -1;
			}

		}

		var resultdiv = "<div data-pin data-pin-type='" + pintype + "' data-pin-user='" + username + "' data-pin-board='" + board + "' data-pin-header='" + header + "' data-pin-width='" + width + "' data-pin-height='" + height + "' data-pin-pinwidth='" + pwidth + "' data-pin-limit='" + ptoshow + "'   data-pin-pinbutton='" + showpbtn + "' data-pin-sourcelink='" + showpsrc + "' data-pin-descrlength='" + descrlength + "'></div>";

		return resultdiv;
	}

	$("input").each(function () {
		if ($(this).prop("checked")) {

			$(this).closest("div").find("div").find("input").addClass("ctrldisabled").attr("disabled", "disabled");
			$(this).closest("div").find("div").find("span").addClass("ctrldisabled").attr("disabled", "disabled");

		} else {

			$(this).closest("div").find("div").find("input").removeClass("ctrldisabled").removeAttr("disabled");
			$(this).closest("div").find("div").find("span").removeClass("ctrldisabled").removeAttr("disabled");

		}

	});

	$("input").bind("change paste keyup", function () {
		if ($(this).prop("checked")) {

			$(this).closest("div").find("div").find("input").addClass("ctrldisabled").attr("disabled", "disabled");
			$(this).closest("div").find("div").find("span").addClass("ctrldisabled").attr("disabled", "disabled");

		} else {

			$(this).closest("div").find("div").find("input").removeClass("ctrldisabled").removeAttr("disabled");
			$(this).closest("div").find("div").find("span").removeClass("ctrldisabled").removeAttr("disabled");

		}

	});

	//$("body").append(generatedivcode());
	$("#pinterest-board").append(generatedivcode());
	$(".printcode textarea").text(generatedivcode());
	setTimeout(function () {
		Ace_pinWidget();
	}, 1000);

	var generatetimer;

	$("input, select").bind("change", function () {
		clearTimeout(generatetimer);
		setTimeout(function () {

			$("div[data-pin]").remove();
			//  $("body").append(generatedivcode());
			$("#pinterest-board").append(generatedivcode());
			$(".printcode textarea").text(generatedivcode());

			Ace_pinWidget();

		}, 200);

	});

	$("select.inputdescr").bind("change", function () {
		if ($("select.inputdescr").val() == "trim") {
			$("div.trimto input").removeClass("ctrldisabled").removeAttr("disabled");
			$("div.trimto span").removeClass("ctrldisabled");
		} else {
			$("div.trimto input").addClass("ctrldisabled").attr("disabled", "disabled");
			$("div.trimto span").addClass("ctrldisabled");
		}

	});

	$(".getpincode").click(function (event) {
		event.preventDefault();
		$(".popup-get-code").addClass("popup");
		setTimeout(function () {
			$(".popup-inner").addClass("popup-inner-active");
		}, 200);
	});

	$(".popup-close-trigger").click(function () {
		$(".popup-inner").removeClass("popup-inner-active");
		setTimeout(function () {
			$(".popup-get-code").removeClass("popup");
		}, 600);

	});

	$(".demo-get-code-textarea-wrapper textarea").click(function () {

		$(this).select();
	});
});

