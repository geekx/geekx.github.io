var reply_to = -1;

var commentCache = {};

function renderComments($, post) {
	post = post.replace(/\//g, '.');
	$.get('https://typeblog.net/comments/getComments?post=' + post, function (data) {
		data = JSON.parse(data);
		$.each(data.reverse(), function (index, item) {
			addComment($, $('#comments'), item);
		});
		$('.reply').click(function () {
			reply_to = $(this).attr('id');
			$('#form_content').trigger('focus');
			$('#form_content').val('Reply to ' + commentCache[reply_to].nick + ':');

			if (commentCache[reply_to].reply && commentCache[reply_to].reply > -1) {
				reply_to = commentCache[reply_to].reply;
			}
		});
		$('#form_content').keydown(function () {
			if ($(this).val().trim() === '') {
				reply_to = -1;
			}
		});
		$('.spinner-wrapper').hide();
	});
	$('#form_email').val($.cookie('email'));
	$('#form_nick').val($.cookie('nick'));
}

function addComment($, selector, item) {
	commentCache[item.id] = item;
	var str = '<div class="comment mdl-color-text--grey-700" id="comment' + item.id + '"><header class="comment__header">';
	if (item.hash) {
		str = str + '<img src="https://cdn.v2ex.com/gravatar/' + item.hash + '" class="comment__avatar">';
	}
	var date;
	if (item.date) {
		date = item.date;
	} else {
		date = 'Unknown';
	}
	str = str + '<div class="comment__author"><strong>' + item.nick + '</strong><span>' + date + '</span></div></header><div class="comment__text">' + item.content + '</div>';
	str = str + '<nav class="comment__actions">';
	str = str + '<button class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon reply" id="' + item.id + '"><i class="material-icons" role="presentation">reply</i><span class="visuallyhidden">reply comment</span></button></nav>';

	if (item.replies) {
		str = str + '<div class="comment__answers"></div></div>';
		selector.append(str);
		$.each(item.replies, function (index, reply) {
			addComment($, $('#comment' + item.id + ' .comment__answers'), reply);
		});
	} else {
		str = str + '</div><br/>';
		selector.append(str);
	}
}

function submitComment($, post) {
	post = post.replace(/\//g, '.');
	var email = $('#form_email').val();
	var nick = $('#form_nick').val();
	var content = $('#form_content').val();
	var date = formatDate(new Date());

	if (content.toLowerCase().indexOf('reply') < 0) {
		reply_to = -1;
	}

	if (isValidEmailAddress(email) && nick.trim() != '' && content.trim() != '') {
		$.cookie('email', email, { expires: 365, path: '/' })
		$.cookie('nick', nick, { expires: 365, path: '/' })

		options = { post: post, email: email, nick: nick, content: content, date: date };
		if (reply_to > -1) {
			options['reply'] = reply_to;
		}

		$.post('https://typeblog.net/comments/newComment', options)
		.done(function() {
			$('#comments').empty();
			$('.spinner-wrapper').show();
			$('#form_content').val('');
			renderComments($, post);
		});

		reply_to = -1;
	}
}

function formatDate(date) {
	var monthNames = [
		"Jan", "Feb", "Mar",
		"Apr", "May", "Jun", "Jul",
		"Aug", "Sep", "Oct",
		"Nov", "Dec"
	];

	day = date.getDate();
	monthIndex = date.getMonth();
	year = date.getFullYear();

	return monthNames[monthIndex] + ' ' + day + ', ' + year;
}

function isValidEmailAddress(emailAddress) {
	var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
	return pattern.test(emailAddress);
};
