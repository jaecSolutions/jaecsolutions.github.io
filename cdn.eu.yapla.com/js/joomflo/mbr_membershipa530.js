document.addEventListener('DOMContentLoaded', function() {
    $("input[name^=custom_price]").each(function () {
        $(this).trigger('change');
    });
    resetBeforeApplyMembership();

    $('.wizard-subscription').find('.organization,.insurance').hide();

    $("input[name=adhesion]:radio:checked").each(function () {
        membershipChanged(this, true);
    });
    $('input[name^="option"][checked], input[name^="adh_opt"][type=checkbox][checked]').trigger('change');
    $('form#member_adhesion_form').submit(function () {
        return $(this).find('[type="submit"],[name="submit"]').is(':visible');
    });
});

$(document)
    .on('change', 'input[name^="custom_price"]', function () {
        $(this).closest('.badge').find('[data-price="close"]').text(memboGo.core.money.convert(this.value));
    })
	.on('change', "input[name=adhesion]:radio", function () {
		membershipChanged(this);
	})
    .on('click', "input[name=adhesion]:radio", function () {
        if ($(this).prop('checked')) $(this).trigger('change');
        $('.checbox_more_year').prop('checked', false);
    })
    .on('change', 'input[name^="option"]:radio, input[name^="adh_opt"]:checkbox', function () {
        let parent = $(this).closest(this.type === 'radio' ? '.list-group' : '.list-group-item');
        parent.find('.fee-description').hide();
        parent.find('.wrapper-object-quantity').hide();
        if ($(this).prop('checked')) {
            $(this).closest('.list-group-item').find('.fee-description').show();
            $(this).closest('.list-group-item').find('.wrapper-object-quantity').show();
        }
        parent.find('input[name^=qty_]').each(function () {
            $(this).trigger('change');
        });
    })
	.on('change', 'input[type=number][name^=qty_]', function () {
        let span = $(this).closest('.list-group-item').find('span.badge');
        if (isNaN(parseInt(this.value)) || parseInt(this.value) < 1) {
            this.value = 1;
        } else if ($(this).data('max') > 0 && $(this).data('max') < this.value) {
            this.value = $(this).data('max');
        }
        let value = $(this).is(":visible") ? this.value : 1;
        memboGo.core.money.format = span.text();
        span.text(memboGo.core.money.convert(span.data('dyn-price') * value));
	});

function resetBeforeApplyMembership() {
	$('form#member_adhesion_form').find('[type="submit"],[name="submit"]').hide();
	$('.memberships_options,.adh-description,.adh-date,.adh-price-more,.delegate_number_custom').hide();
	$('[data-price="close"]').show();
	$('[data-price="open"]').hide();
}

function membershipChanged(that, init) {
	init = init || false;
	var notAvailable = $(that).attr('not-available') || '0',
		_p = $(that).closest('.list-group-item');
	resetBeforeApplyMembership();
	_p.find('[data-price="close"]').hide();
	_p.find('[data-price="open"]').show();

	if (notAvailable != '1') {
		$('form#member_adhesion_form').find('[type="submit"],[name="submit"]').show();
	}
	_p.find('.memberships_options,.adh-description,.adh-date,.adh-price-more').show();
	memboGo.core.event.dispatch('mgo-membership-delegate-show', {element: _p});

	if (_p.find('ul.membership-documents').find('li').length) {
		$('.wizard-subscription').find('.registration-membership-documents').show();
	} else {
		$('.wizard-subscription').find('.registration-membership-documents').hide();
	}
	if (!init) {
		$(".option-checkbox :input").filter(function () {
			return !$(that).closest('fieldset').is(':visible')
		}).attr('checked', false);
	} else {
        $(".fee-description").hide();
    }

	$('.wizard-subscription')
		.find('.organization')[$(that).attr('data-organization') === "1" ? 'show' : 'hide']();

	$('.wizard-subscription')
		.find('.insurance')[$(that).attr('data-insurance') === "1" ? 'show' : 'hide']();

	$('input[name^="custom_price"]').prop('disabled', true);
	_p.find('input[name^="custom_price"]').prop('disabled', false);
}
