if (typeof memboGo === 'undefined') {
	var memboGo = {};
}
memboGo.Cart = {
	url: '',
	init: function () {
		var self = this;
		$(document)
			.off('click', '.mini-cart-info .remove')
			.off('click', '.cart-wrapper .item-delete')
			.off('click', '.cart-wrapper .item-edit')
			.on('click', '.cart-header', function () {
				if ($('#cart-header-box').find('.content').length) return;
				$.ajax({
					async: "false",
					url: self.url + 'ajax/module/cart',
					dataType: "json",
					method: 'POST',
					data: {type: 'load'},
					cache: false,
					success: function (data) {
						if (typeof data.html != 'undefined') {
							$('.mod-cart-bloc').after(data.html).remove();
							$('.mod-cart-bloc').find('.cart-header').trigger('click');
						}
					}
				});
			})
			.on('click', '.mini-cart-info .remove', function () {
				self.remove($(this));
			})
			.on('click', '.cart-wrapper .item-delete', function (e) {
				e.preventDefault();
				self.remove($(this));
			})
			.on('click', '.cart-wrapper .item-edit', function (e) {
				e.preventDefault();
				$.ajax({
					async: "false",
					url: self.url + 'ajax/module/cart',
					dataType: "json",
					method: 'POST',
					data: {type: 'editItem', item: $(this).data('item'), component: $(this).data('component')},
					cache: false,
					beforeSend: function () {
						displayLoadingBox();
					},
					success: function (data) {
						if (typeof data.redirect != 'undefined') {
							window.location.href = data.redirect;
						} else {
							hideLoadingBox();
						}
					},
					error: function () {
						hideLoadingBox();
					}
				});
			});
	},
	remove: function ($item) {
		const item = $item.data('item');
		const component = $item.data('component');

		$.ajax({
			async: "false",
			url: this.url + 'ajax/module/cart',
			dataType: "json",
			method: 'POST',
			data: {type: 'removeItem', item: item, component: component},
			cache: false,
			beforeSend: function () {
				HPJUtils.displayLoadingBox();
			},
			success: function () {
				window.location.reload();
			}
		});
	}
}
memboGo.Cart.init();
