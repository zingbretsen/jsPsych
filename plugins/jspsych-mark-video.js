/**
 * Josh de Leeuw
 * March 2014
 * 
 * 
 **/


(function($) {
    jsPsych["mark-video"] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = new Array(params.stimuli.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "mark-video";
                trials[i].stimulus = params.stimuli[i];
                trials[i].key = (typeof params.key === 'undefined') ? 32 : params.key;
                trials[i].movie_size = (typeof params.movie_size) ? [] : params.movie_size;
                // timing parameters
                trials[i].timing_pre_trial = (typeof params.timing_pre_trial === 'undefined') ? 0 : params.timing_pre_trial;
                trials[i].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial;
                // optional parameters
                trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {

            var times = [];

            display_element.append($('<video>', {
                id: 'jspsych-mark-video-vid',
                css: {
                    border: '5px solid white'
                }
            }));
            
            if(typeof trial.movie_size[0] !== 'undefined'){
                $('#jspsych-mark-video-vid').attr({
                    width: trial.movie_size[0],
                    height: trial.movie_size[1]
                });
            }

            for (var i = 0; i < trial.stimulus.length; i++) {
                $('#jspsych-mark-video-vid').append('<source src="' + trial.stimulus[i] + '">');
            }

            //show prompt here
            if (trial.prompt !== "") {
                display_element.append(trial.prompt);
            }

            // start trial
            if (trial.timing_pre_trial > 0) {
                setTimeout(function() {
                    start_trial();
                }, trial.timing_pre_trial);
            }
            else {
                start_trial();
            }

            function start_trial() {
                $("#jspsych-mark-video-vid").get(0).play();

                $("#jspsych-mark-video-vid").get(0).onended = function(e) {
                    // video is over

                    end_trial();

                    // end trial
                };
            }

            function end_trial() {

                var trial_data = {
                    "trial_type": "mark-video",
                    "trial_index": block.trial_idx,
                    "stimulus": JSON.stringify(trial.stimulus),
                    "times": JSON.stringify(times)
                };

                block.writeData($.extend({}, trial_data, trial.data));
                $(document).unbind('keydown', resp_func);
                display_element.html('');
                if (trial.timing_post_trial > 0) {
                    setTimeout(function() {
                        block.next();
                    }, trial.timing_post_trial);
                }
                else {
                    block.next();
                }
            }

            var resp_func = function(e) {

                if (e.which == trial.key) {
                    var time = $("#jspsych-mark-video-vid").get(0).currentTime;

                    times.push(time);

                    $("#jspsych-mark-video-vid").css({
                        border: "5px solid black"
                    });

                    var div = $('#jspsych-mark-video-vid');
                    $({
                        alpha: 1
                    }).animate({
                        alpha: 0
                    }, {
                        duration: 500,
                        step: function() {
                            div.css('border-color', 'rgba(0,0,0,' + this.alpha + ')');
                        }
                    });
                }
            };

            $(document).keydown(resp_func);

        };


        return plugin;
    })();
})(jQuery);
