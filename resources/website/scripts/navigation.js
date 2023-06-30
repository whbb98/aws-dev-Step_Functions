var NAVIGATION = (function(){

	var expose = {
		scrollTo: scrollTo,
		scrollToTop:scrollToTop
	},hide = {
		setUpHandlers: setUpHandlers,
		toggleNavigation: toggleNavigation
	};

	(function init(){
		setUpHandlers();
	})();

	function scrollTo(ce){
		var $this = $(this),
			anchor_str = $this.attr("data-role"),
			$anchor = $("[name='" + anchor_str + "']"),
			y_int = $anchor[0].getBoundingClientRect().top 
					+ window.pageYOffset;
		toggleNavigation.call($("body > section > header[data-expanded='expanded'] > span"));
		setTimeout(function(){
			window.scrollTo({top: y_int, behavior: 'smooth'});
		}, 1000 * 0.24);
	}

	function scrollToTop(ce){
		window.scrollTo({top: 0, behavior: 'smooth'});
	}

	function setUpHandlers(){
		$(document).on("click", "a[name]", scrollToTop);
		$(document).on("click", "[data-action='go_to']", scrollTo);
		$(document).on("click", "[data-action='toggle_navigation']", toggleNavigation);
	}

	function toggleNavigation(ce){
		var $parent= $(this).parent();
		if($parent.attr("data-expanded") === "expanded"){
			$parent.attr("data-expanded", "not_expanded");
		}else{
			$parent.attr("data-expanded", "expanded");
		}
	}

	return expose;

})();