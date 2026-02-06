if (typeof memboGo === 'undefined') {
	var memboGo = {};
}
if (typeof memboGo.member === 'undefined') {
	memboGo.member = {};
}
memboGo.member.delegate = {
	box: '.delegate_number_custom',
	element: '[name^="delegate_quantity"]',
	url: '',
	corporateId: null,
	delegateId: null,
	memberId: null,
	_qty: null,
	_total: 0,
	init: function (url) {
		var self = this;
		self.url = url;
		$(document)
			.off('click', '[name="edit_delegate"]')
			.off('change', self.element)
			.off('click', '[data-delegate-action]')

			.on('click', '[name="edit_delegate"]', function (e) {
				e.preventDefault();
				var element = self.getElement(this);
				self.corporateId = element.data('corporate-id');
				self.delegateId = element.data('delegate-id');
				self._qty = parseInt(element.find(self.element).val());
				if (isNaN(self._qty)) {
					self._qty = parseInt($(this).closest('[data-init-max]').data('init-max'));
					if (self._qty === 9999) {
						self._qty = 0;
					}
				}
				self.currentTotal = 0;
				self.loadList();
			})
			.on('click', '[data-delegate-action]', function (e) {
				e.preventDefault();
				self.memberId = null;
				switch ($(this).data('delegate-action')) {
					case 'add':
						self.add('GET');
						break;
					case 'back':
						self.goToMain(true);
						window.location.href = '#registration-member';
						break;
					case 'edit':
						self.memberId = $(this).data('id');
						self.add('GET');
						break;
					case 'plus':
						if (!$('.membership-delegate-manage').find('[data-delegate-action=add]').is(':visible')) {
							return;
						}
					// ok, I cannot tell if this is bny choice of by mistake but it probably works "alright"
					// eslint-disable-next-line no-fallthrough
					case 'minus':
						self.toggle(this);
						break;
				}
			})
			.on('change', self.element, function (e) {
				self.delegateChange(this);
			});

		memboGo.core.event.listen('mgo-membership-delegate-show', function (e) {
			e.detail.element.find(memboGo.member.delegate.box)
				.each(function () {
					$(this)
						.data('min', $(this).data('init-min'))
						.data('max', $(this).data('init-max'))
						.show()
						.find(memboGo.member.delegate.element)
						.trigger('change');
				});
		});
	},
	delegateChange: function (that) {
		var self = this,
			value = parseInt(that.value),
			_p = self.getElement(that);
		if (!_p) {
			return;
		}
		if (isNaN(value)) {
			value = 0;
		}
		if (_p.data('total') > 0 && _p.data('total') > value) {
			value = _p.data('total');
		}
		if (_p.data('max') > 0 && value > _p.data('max')) {
			value = _p.data('max');
		} else if (_p.data('min') > 0 && value < _p.data('min')) {
			value = _p.data('min');
		}
		$(that).val(value);
		_p.find('.badge').each(function () {
			var price = parseFloat(_p.data('price'));
			if (!isNaN(price)) {
				$(this).text($(this).text().replace(/([\d\s\,\.]+)/i, ' ' + (price * value).toFixed(2) + ' '));
			}
		});
		value = 1;
		$(that).closest('li').find(self.box).find(self.element)
			.each(
				function () {
					var _v = parseInt($(that).val());
					if (!isNaN(_v)) {
						value += _v;
					}
				});
		$(that).closest('li')
			.find('span[data-dyn-price]')
			.each(function () {
				var price = parseFloat($(that).data('dyn-price'));
				if (!isNaN(price)) {
					$(that).text($(that).text().replace(/([\d\s\,\.]+)/i, ' ' + (price * value).toFixed(2) + ' '));
				}
			});
		_p.find('[name="edit_delegate"]')[parseInt(that.value) > 0 ? 'show' : 'hide']();
	},
	loadList: function () {
		var self = this;
		$.ajax({
			type: "GET",
			url: self.getUrl('list'),
			data: { qty: self._qty },
			dataType: "json",
			success: function (data) {
				if (data.success) {
					HPJUtils.hideLoadingBox();
					$('.membership-delegate-manage').remove();
					self.getElement().closest('form').hide().after(data.html);
					$('.member_renew_date_now').hide();
					self.modal = new HPJUtils.modal('#modal-delegate');
					self.modal.setAction('.btn-save', function () {
						self.add('POST');
					});
					self.canAdd(data.total);
					window.location.href = '#registration-member';
				}
			},
			beforeSend: function () {
				HPJUtils.displayLoadingBox();
			},
			error: function () {
				HPJUtils.hideLoadingBox();
				self.goToMain();
			}
		});
	},
	add: function (post) {
		var self = this,
			params = {
				type: post,
				url: this.getUrl('edit'),
				dataType: 'json',
				success: function (data) {
					if (post === 'POST' && data.success) {
						self.modal.close();
						memboGo.core.ckeditor.destroy();
						self.modal.setContent('');
						self.loadList();
					} else {
						HPJUtils.hideLoadingBox();
						self.modal.setContent(data.form);
						self.modal.open();
						memboGo.core.ckeditor.init($("#modal-delegate").find('.modal-body form'));
						HPJForm.afterLoad();
					}
				},
				beforeSend: function () {
					HPJUtils.displayLoadingBox();
				},
				error: function () {
					HPJUtils.hideLoadingBox();
				}
			};
		if (post === 'POST') {
			memboGo.core.ckeditor.prepareData();
			params.data = new FormData($("#modal-delegate").find('.modal-body form')[0]);
			if (this.memberId !== null) {
				params.data.append('memberId', this.memberId);
			}
			params.contentType = params.processData = false;
		} else {
			if (this.memberId !== null) {
				params.data = { memberId: this.memberId };
			}
		}
		$.ajax(params);
	},
	toggle: function (that) {
		var self = this;
		$.ajax({
			type: 'POST',
			url: this.getUrl('toggle'),
			data: {
				memberId: $(that).data('id'),
				qty: self._qty
			},
			dataType: 'json',
			success: function (data) {
				if (data.success) {
					$(that).closest('tr').find('td:eq(2)').attr('title', data.status).text(data.status);
					$(that).closest('tr').find('td').last().html(data.action);
					$('.membership-delegate-name').text(data.name);
					self.canAdd(data.total);
				}
			},
			beforeSend: function () {
				HPJUtils.displayLoadingBox();
			},
			complete: function () {
				HPJUtils.hideLoadingBox();
			}
		});
	},
	getUrl: function (method) {
		return this.url + 'ajax-delegate-manage/module/member/?_a=' + method + '&corporateId=' + this.corporateId + '&delegateId=' + this.delegateId;
	},
	goToMain: function (updateTotal) {
		$('.member_renew_date_now').show();
		if (this._qty > 0 && this._total > this._qty) {
			this.getElement().val(this._total);
		}
		this.getElement()
			.data('total', this._total)
			.closest('form')
			.show()
			.next('.membership-delegate-manage')
			.remove();
	},
	getElement: function (that) {
		if (that) {
			return $(that).closest(this.box);
		}
		return $(this.box + '[data-corporate-id="' + this.corporateId + '"][data-delegate-id="' + this.delegateId + '"]');
	},
	canAdd: function (total) {
		this._total = total;
		$('.membership-delegate-manage').find('[data-delegate-action=add]')[this._qty > 0 && this._qty <= total ? 'hide' : 'show']();
	}
}