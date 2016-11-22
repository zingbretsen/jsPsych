/*
 * Example plugin template
 */
var $table;
var $td;
var $tr;

jsPsych.plugins["bandit"] = (function() {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('bandit', 'stimuli', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});

    plugin.info = {
	name: 'bandit',
	description: '',
	parameters: {
	    stimuli: {
		type: [jsPsych.plugins.parameterType.STRING],
		default: undefined,
		array: true,
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
		default: undefined,
		array: true,
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
		array: true,
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
	    }
	}
    }


    plugin.trial = function(display_element, trial) {

	$(display_element).css('visibility', 'hidden');
	var startTime, keyboard_listener, practice_keyboard_listener;
	// set default values for parameters
	trial.schedule = trial.schedule || 'default value';
	trial.nrow = trial.nrow || 1;
	trial.ncol = trial.ncol || 2;

	// allow variables as functions
	// this allows any trial variable to be specified as a function
	// that will be evaluated when the trial runs. this allows users
	// to dynamically adjust the contents of a trial as a result
	// of other trials, among other uses. you can leave this out,
	// but in general it should be included
	trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

	writeHTML();
	showBlankScreen();

	function showBlankScreen() {
	    console.log('showing blank screen');
	    
	    $(display_element).css('visibility', 'hidden');
	    if (trial.phase == "FIRST") {
		writeHTML();
	    }
	    if (trial.peer == 0) {
		$('#jspsych-history_table').append(
		    addHistoryRow()
		);
	    }

	    showNextStim();
	}

	
	// data saving
	var trial_data = {
	    parameter_name: 'parameter value'
	};


	function writeHTML( ) {
	    var $prompt = $('<h4>', {html: trial.prompt});
	    display_element.html($prompt);

	    $table = $('<table>', {html: "<tbody></tbody>"});
	    var n = 0;
	    for(var i = 0; i < trial.nrow; i++) {
		$tr = $('<tr>', {"class": "stim_row"});
		for(var j = 0; j < trial.ncol; j++) {
		    var stim = trial.stimuli[n++];
		    console.log(stim);
		    $td = $('<td>', {
			"class": "bandit stim",
			"id"   : "bandit_stim_" + n, 
		    });
		    var $img = $('<img>', {
			src: trial.stimDir + stim,
		    });
		    $td.append($($img));
		    console.log($td.html());
		    $tr.append($($td));
		    console.log($tr.html());
		}
		$table.append($($tr));
		console.log($table.html());

	    }
	    console.log('*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*');
	    console.log($table.html());
	    display_element.append($table);
	}

	function showNextStim() {
	    console.log(trial.phase);
	    $(display_element).css('visibility', 'visible');
	    startKeyListener();
	}

	function startKeyListener() {
	    startTime = (new Date()).getTime();
	    keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
		callback_function: logResp,
		valid_responses: trial.choices,
		rt_method: 'date',
		persist: true,
		allow_held_key: false
	    });
	}

	function stopKeyListener() {
	    jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
	}

	function logResp(arg) {
	    stopKeyListener();
	    jsPsych.pluginAPI.clearAllTimeouts();
	    //$(display_element).css('visibility', 'hidden');

	    // var endTime			= (new Date()).getTime();
	    // var response_time		= endTime - startTime;
	    var respCharCode		= arg.key;
	    var respKey			= String.fromCharCode(arg.key);
	    var respChoiceNum		= trial.choices.indexOf(respKey.toLowerCase());
	    var respChoice		= trial.stimDir + trial.stimuli[respChoiceNum];

	    var trial_data = {
		"rt"			: arg.rt,
		"respCharCode"		: respCharCode,
		"respKey"		: respKey,
		"respChoiceNum"		: respChoiceNum,
		"respChoice"		: respChoice,
	    };
	    showFeedback(trial_data);
	}

	function showFeedback(trial_data) {
	    // end trial
	    $(display_element).css('visibility', 'hidden');
	    jsPsych.finishTrial(trial_data);
	}
    };

    return plugin;
})();
