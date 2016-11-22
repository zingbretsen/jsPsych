/**
 * jspsych-single-stim-sam
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["single-stim-sam"] = (function() {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('single-stim-sam', 'stimulus', 'image', function(t){ return !t.is_html || t.is_html == 'undefined'});

    plugin.info = {
	name: 'single-stim-sam',
	description: '',
	parameters: {
	    stimulus: {
		type: [jsPsych.plugins.parameterType.STRING],
		default: undefined,
		no_function: false,
		description: ''
	    },
	    is_html: {
		type: [jsPsych.plugins.parameterType.BOOL],
		default: false,
		no_function: false,
		description: ''
	    },
	    choices: {
		type: [jsPsych.plugins.parameterType.KEYCODE],
		array: true,
		default: jsPsych.ALL_KEYS,
		no_function: false,
		description: ''
	    },
	    prompt: {
		type: [jsPsych.plugins.parameterType.STRING],
		default: '',
		no_function: false,
		description: ''
	    },
	    timing_stim: {
		type: [jsPsych.plugins.parameterType.INT],
		default: -1,
		no_function: false,
		description: ''
	    },
	    timing_response: {
		type: [jsPsych.plugins.parameterType.INT],
		default: -1,
		no_function: false,
		description: ''
	    },
	    response_ends_trial: {
		type: [jsPsych.plugins.parameterType.BOOL],
		default: true,
		no_function: false,
		description: ''
	    },

	}
    }

    plugin.trial = function(display_element, trial) {

	// if any trial variables are functions
	// this evaluates the function and replaces
	// it with the output of the function
	trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

	// set default values for the parameters
	trial.choices = trial.choices || jsPsych.ALL_KEYS;
	trial.response_ends_trial = (typeof trial.response_ends_trial == 'undefined') ? true : trial.response_ends_trial;
	trial.timing_stim = trial.timing_stim || -1;
	trial.timing_response = trial.timing_response || -1;
	trial.is_html = (typeof trial.is_html == 'undefined') ? false : trial.is_html;
	trial.prompt = trial.prompt || "";

	// display stimulus
	if (!trial.is_html) {
	    $('#jspsych-stim').html($('<img>', {
		src: trial.stimulus,
		id: 'jspsych-single-stim-stimulus'
	    }));
	} else {
	    $('#jspsych-stim').html($('<div>', {
		html: trial.stimulus,
		id: 'jspsych-single-stim-stimulus'
	    }));
	}

	//Only keep history table header pics and names
	$('#jspsych-history_table tbody').html($('#jspsych-history_table tr').slice(0,2))
	$('.history').css({
	    opacity: 0.3
	})
	var peer_pics = $('img.history');
	for(var i = 0; i < peer_pics.length; i++) {
	    console.log( $(peer_pics[i]).attr('src') );
	    console.log( trial.stimulus ) ;
	    if ( $(peer_pics[i]).attr('src') == trial.stimulus ) {
		console.log('match');
		$(peer_pics[i]).css({
		    opacity: 1.0
		});
	    }
	}
	//$('.Self').hide('fast');

	//show prompt if there is one
	if (trial.prompt !== "") {
	    $('#jspsych-stim').append(
		$('<div>', {
		    html: trial.prompt,
		    id: 'jspsych-likert-prompt'
		}));

	    $('#jspsych-likert-prompt').show();
	}

	//show instructions if there is one
	if (trial.instructions !== "") {
	    $('#jspsych-stim').prepend(
		$('<div>', {
		    html: trial.instructions,
		    id: 'jspsych-likert-instructions'
		}));
	    $('#jspsych-likert-instructions').show();
	}

	// store response
	var response = {
	    rt: -1,
	    key: -1
	};

	// function to end trial when it is time
	var end_trial = function() {

	    // kill any remaining setTimeout handlers
	    jsPsych.pluginAPI.clearAllTimeouts();

	    // kill keyboard listeners
	    if (typeof keyboardListener !== 'undefined') {
		jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
	    }

	    // gather the data to store for the trial
	    var trial_data = {
		"rt": response.rt,
		"stimulus": trial.stimulus,
		"key_press": response.key,
		"key": String.fromCharCode(response.key),
	    };

	    // clear the display
	    //$('#jspsych-stim').html('');

	    // move on to the next trial
	    $('#jspsych-likert-prompt').hide();
	    jsPsych.finishTrial(trial_data);
	};

	// function to handle responses by the subject
	var after_response = function(info) {

	    // after a valid response, the stimulus will have the CSS class 'responded'
	    // which can be used to provide visual feedback that a response was recorded
	    $("#jspsych-single-stim-stimulus").addClass('responded');

	    // only record the first response
	    if (response.key == -1) {
		response = info;
	    }

	    if (trial.response_ends_trial) {
		end_trial();
	    }
	};

	// start the response listener
	if (trial.choices != jsPsych.NO_KEYS) {
	    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
		callback_function: after_response,
		valid_responses: trial.choices,
		rt_method: 'date',
		persist: false,
		allow_held_key: false
	    });
	}

	// hide image if timing is set
	if (trial.timing_stim > 0) {
	    jsPsych.pluginAPI.setTimeout(function() {
		$('#jspsych-single-stim-stimulus').css('visibility', 'hidden');
	    }, trial.timing_stim);
	}

	// end trial if time limit is set
	if (trial.timing_response > 0) {
	    jsPsych.pluginAPI.setTimeout(function() {
		end_trial();
	    }, trial.timing_response);
	}

    };

    return plugin;
})();
