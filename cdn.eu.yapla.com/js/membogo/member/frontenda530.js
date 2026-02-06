if (typeof memboGo === 'undefined') {
	var memboGo = {};
}
if (typeof memboGo.member === 'undefined') {
	memboGo.member = {};
}

memboGo.member.organization = {
	members: function () {
		$(document).on('click', '.member_organization_table table thead a', function (e) {
			e.preventDefault();
			var self = this, page = $(this).closest('table').find('tfoot a.active').text().trim();
			HPJUtils.displayLoadingBox();
			$.ajax({
				type: "POST",
				async: "false",
				url: $(this).attr('href'),
				data: {
					page: $(this).closest('table').find('tfoot a.active').text().trim()
				},
				dataType: "html",
				success: function (data) {
					$(self).closest('.list-result-wrapper').replaceWith(data);
				},
				complete: function () {
					HPJUtils.hideLoadingBox();
				}
			});
		});
		$(document).on('click', '.member_organization_admin_action', function (e) {
			e.preventDefault();
			HPJUtils.displayLoadingBox();
			$.ajax({
				type: "POST",
				async: "false",
				url: $(this).attr('href') + 'ajax-action-member-organization/module/member/',
				data: {
					group: $(this).data('group'),
					member: $(this).data('member'),
					action: $(this).data('action')
				},
				dataType: "json",
				success: function (data) {
					if (typeof data.success != 'undefined') {
						$('.member_organization_table').html(data.html);
					}
				},
				complete: function () {
					HPJUtils.hideLoadingBox();
				}
			});
		});
	}
};

memboGo.member.typeMembership = {
	element: "#org-search-box",
	url: '',
	init: function (url) {
		var self = this;
		self.url = url;
		$(document)
			.off("change", "*[name=type_identification]:radio")
			.on("change", "*[name=type_identification]:radio", function () {
				var typeSent = false;
				$(".wrapper_membership_list,.wrapper_organization_list").hide();
				$('.wrapper_' + $(this).val() + '_list').show();
				if ($(this).val() === "organization") {
					$(".membership-next-step").hide();
					if (!$(self.element).html().length) {
						typeSent = true;
						self.search();
					}
				} else {
					$(".membership-next-step").show();
				}
			})
			.off("keypress", "#org-search-box input")
			.on("keypress", "#org-search-box input", function (e) {
				if (e.which === 13) {
					e.preventDefault();
					$("#org-search-box #search").trigger("click");
				}
			})
			.off("click", "#org-search-box #search")
			.on("click", "#org-search-box #search", function (e) {
				e.preventDefault();
				var data = {filter: {}};
				$(this).closest("#org-search-box").find("input").each(function () {
					data.filter[$(this).attr("name")] = $(this).val();
				});
				self.search(data);
			})
			.off("click", "#identification_organization_result thead a")
			.on("click", "#identification_organization_result thead a", function (e) {
				e.preventDefault();
				HPJUtils.displayLoadingBox();
				$.ajax({
					type: "GET",
					url: $(this).attr("href"),
					success: function (result) {
						$(self.element).find(".list-result-wrapper").html($(result).html());
					},
					complete: function () {
						HPJUtils.hideLoadingBox();
					}
				});
			})
			.off("click", ".ajax-select-organization")
			.on("click", ".ajax-select-organization", function (e) {
				e.preventDefault();
				var organizationId = $(this).data("id"),
					s = $(this);
				HPJUtils.displayLoadingBox();
				$('#delegate_id').val('');
				$('#organization_id').val('');
				$.ajax({
					type: "POST",
					url: self.url + "ajax-select-organization/module/member/",
					data: {organizationId: organizationId},
					dataType: "json",
					success: function (data) {
						if (typeof data.membership !== 'undefined') {
							$('#organization_id').val(organizationId);
							var form = $('#delegate_id').val(data.membership).closest('form');
							form.find('#fieldset-membership_list').remove();
							form.find('[name="submit"]')
								.show()
								.trigger('click');
						} else if (data.message) {
							HPJUtils.hideLoadingBox();
							$('.error-ajax-select-organization').remove();
							$(s).after($("<div/>", {class: 'error-ajax-select-organization'}).append($("<span/>").text(data.message)));
						}
					},
					error: function () {
						HPJUtils.hideLoadingBox();
					}
				});
			})
			.ready(function () {
				if (!$("*[name=type_identification]:checked").val()) {
					$("*[name=type_identification]").eq(0).prop("checked", true);
				}
				$("*[name=type_identification]:checked").trigger("change");
			});
	},
	search: function (data) {
		var self = this;
		data = data || {};
		data.searchForm = 1;
		HPJUtils.displayLoadingBox();
		$.ajax({
			type: "POST",
			url: self.url + "ajax-organization-list/module/member/",
			data: data,
			dataType: "html",
			success: function (result) {
				$(self.element).html(result);
			},
			complete: function () {
				HPJUtils.hideLoadingBox();
			}
		});
	}
};

memboGo.member.documentRemove = function () {
	$(document)
		.on("click", "#member-document-delete", function (e) {
			e.preventDefault();
			var modal = new HPJUtils.modal("#modal-remove-document");
			modal.setAction('.modal-yes', function () {
				modal.close();
				HPJUtils.displayLoadingBox();
				window.location.href = $("#member-document-delete").attr('href');
			});
			modal.open();
		});
};

memboGo.member.insurance = function (url, insuranceData) {
	$(document).on('click', '#insurance_submit', function (e) {
		e.preventDefault();
		HPJUtils.displayLoadingBox();
		$(this).closest('form').prepend($('<form />', {class: 'insurance-form-submit', action: url, method: 'POST'}));
		for (a in insuranceData) {
			if (insuranceData[a] !== null && insuranceData[a] !== '') {
				$('.insurance-form-submit').append($('<input />', {type: 'hidden', name: a, value: insuranceData[a]}));
			}
		}
		$('.insurance-form-submit').submit();
	})
}