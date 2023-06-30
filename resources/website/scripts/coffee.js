var COFEEE = (function(){

	var expose = {

	}, hide = {
		formatWithUnderscores: formatWithUnderscores,
		handleNoSupplierSetUpYet: handleNoSupplierSetUpYet,
		loadItems: loadItems,
		printItems: printItems
	};

	(function init(){
		console.log("Ok lets start coffees");
		loadItems();
	})();

	function formatWithUnderscores(str){
		//override
		// return "cherry_pie";
		return str.replace(/ /g, "_");
	}

	function handleNoSupplierSetUpYet(msg_str){
		var html_str = '';
		// html_str += '<section>';
		html_str += 	'<output>';
		html_str += 		msg_str;
		html_str += 	'</output>';
		// html_str +=	'</section>';
		$("[data-role='browse_coffee_content']")
				.append(html_str);
	}

	function loadItems(){
		if(window.COFFEE_CONFIG.API_GW_BASE_URL_STR === null){
			handleNoSupplierSetUpYet("Live coffee information coming shortly");
		}else{
			$.get(window.COFFEE_CONFIG.API_GW_BASE_URL_STR + "/bean_products", printBeans)
				.fail(function(){
					handleNoSupplierSetUpYet("Live coffee supply information coming <u>very soon</u>!");
				});
		}
	}

	function printBeans(all_beans_obj_arr){

		var html_str = '';
		html_str += '<section data-role="bean_container">';
		for(var i_int = 0, o = {}; i_int < all_beans_obj_arr.length; i_int += 1){
			o = all_beans_obj_arr[i_int];
			html_str += '<div data-bean_type="' + o.type.toLowerCase() + '" data-bean_id="' + o.id + '">';
			html_str +=		'<h2>' + o. type + '</h2>';
			html_str += 	'<h3>';
			html_str += 		o.product_name;
			html_str += 	'</h3>';
			html_str += 	'<h4>$' + o.price + '</h4>';
			html_str += 	'<h5>' + o.quantity + ' in stock</h5>';
			html_str += 	'<p>' + o. description + '</p>';
			// html_str += 	'<section>';
			// for(var k_int = 0; k_int < o.tag_str_arr.length; k_int += 1){
			// 	html_str += '<span>' + o.tag_str_arr[k_int] + '</span>';
			// }
			// html_str += 	'</section>';
			// html_str += 	'<figure>';
			// html_str += 		'<img src="images/beans/' + formatWithUnderscores(o.product_name).toLowerCase() + '.png" alt="Image for our ' + o.product_name + '" />';
			// html_str += 		'<figcaption>';
			// html_str += 			o.description;
			// html_str += 		'</figcaption>';
			// html_str += 	'</figure>';
			html_str += '</div>';
		}
		html_str += '</section>';
		$("[data-role='browse_coffee_content']")
				.append(html_str);
	}

	function printItems(all_products_obj_arr){
		var html_str = '';
		html_str += '<section>';
		for(var i_int = 0, o = {}; i_int < all_products_obj_arr.length; i_int += 1){
			o = all_products_obj_arr[i_int];
			html_str += '<div data-product_id="' + o. product_id_str + '">';
			html_str += 	'<h3>';
			html_str += 		o.product_name_str;
			html_str += 	'</h3>';
			html_str += 	'<h4>$' + (o.price_in_cents_int/100).toFixed(2) + '</h4>';
			html_str += 	'<section>';
			for(var k_int = 0; k_int < o.tag_str_arr.length; k_int += 1){
				html_str += '<span>' + o.tag_str_arr[k_int] + '</span>';
			}
			html_str += 	'</section>';
			html_str += 	'<figure>';
			html_str += 		'<img src="images/items/' + formatWithUnderscores(o.product_name_str) + '.png" alt="Image for our ' + o.product_name_str + '" />';
			html_str += 		'<figcaption>';
			html_str += 			o.description_str;
			html_str += 		'</figcaption>';
			html_str += 	'</figure>';
			html_str += '</div>';
		}
		html_str += '</section>';
		$("[data-role='browse_coffee_content']").append(html_str);
	}

	return expose;

})();
