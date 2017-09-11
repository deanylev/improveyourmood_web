var what, appError, networkReported, start_time, reloadEngine, manualReload, setSettings, resetBackendAddress, toggleAutoReload, goBack;
var usedQuotes = [];
var usedColours = [];
var quoteHistory = [];
var colourHistory = [];
var platform = $('html').attr('data-platform');
var quotes = [];
var colours = [];
var settings = {};
var settingsOpen = false;
var pull_time = {};
var app_version = $('html').attr('data-app-version');
var fullSettings = {};

// Platform specific stuff

if (platform === 'web') {

  var version = window.location.href.includes('decreaseyourmood') ? 'Decrease' : 'Improve';

} else {

  var version = $('html').attr('data-version');

}

var backend_address = localStorage.getItem('backend_address') || 'improveyourmood.xyz';

var full_backend_address = `http://${backend_address}/`;

$(window).on('error', function(error) {

  let log = typeof(error) === 'string' ? error : null;

  engineError(null, log);

});

$(document).ready(function() {

  // Put in correct text / year

  $('title').text(`${version} Your Mood`);
  $('#logo-version').text(version.toLowerCase());
  $('#footer-version').text(version);

  let meta_desc = version === 'Improve' ? 'Gives you randomly chosen compliments across randomly chosen beautiful colours to improve your mood!' : 'Gives you randomly chosen insults across randomly chosen beautiful colours to decrease your mood!'
  $('meta[name="description"]').attr('content', meta_desc)

  $('#year').text(new Date().getFullYear());

  // Some buttons needs to work straight away

  // Retry loading

  $('#retry-button').click(function() {

    window.location.reload();

  });

  // Clear backend address

  resetBackendAddress = function() {

    localStorage.removeItem('backend_address');
    window.location.reload();

  }

  $('#reset-backend-address').click(function() {

    resetBackendAddress();

  });

  // Calculate proper top margin for certain elements

  $('.js-margin').css('margin-top', $(document).height() / 4.5);

  // Do it on resize too

  $(window).resize(function() {

    $('.js-margin').css('margin-top', $(document).height() / 4.5);

  });

  // Button order in localStorage seems to break a lot...

  if (localStorage.getItem('button_order') === 'null') {

    localStorage.removeItem('button_order');

  }

});

// Function for displaying and logging errors

function engineError(display, log, code, type) {

  // If network connection is detected

  if (navigator.onLine) {

    if (!display) {

      display = 'An error occured.';

    }

    if (!log) {

      log = 'An error occured.';

    }

    if (code) {

      $('#error-message').text(`${log} (${code})`);

    }

    appError = true;
    $('.coloured').css('background-color', 'black');
    $('.theme-text').css('color', 'white');
    $('meta[name="theme-color"]').attr('content', 'black');
    $('#quote').text(display);
    $('#quote').addClass('scale-in');
    $('.preloader-wrapper').addClass('hide');
    $('.fixed-action-btn').addClass('hide');

    console.error(log);

    if (type === 'backend' && localStorage.getItem('backend_address')) {

      $('#reset-backend-address').removeClass('hide');

    }

  } else if (!networkReported) {

    networkReported = true;
    $('#quote').text('You are not connected to the internet.');
    $('#quote').addClass('scale-in');
    $('.preloader-wrapper').addClass('hide');
    $('#retry-button').removeClass('hide');
    console.log('No internet connection.');

  }

}

// Pull quotes from backend

start_time = performance.now();
total_time = performance.now();

console.log(`%c${version} Your Mood 6`, 'font-family: "Oxygen"; font-size: 20px;');
console.log('――――――――――――――――――――――――――――――')
console.log(`Pulling from: ${full_backend_address}`);

console.log('\nPulling quotes from backend...');

$.getJSON(`${full_backend_address + version.toLowerCase()}_quote_serializer.php`)

  // Move on to next step

  .done(function(data) {

    pull_time['quotes'] = Math.ceil(performance.now() - start_time);

    $.each(data, function(key, val) {

      quotes.push(val);

    });

    console.log(`Successfully pulled ${quotes.length} quotes from backend in ${pull_time['quotes']}ms.`);

    // Pull colours from backend

    start_time = performance.now();

    console.log('\nPulling colours from backend...');

    $.getJSON(`${full_backend_address}colour_serializer.php`)

      // Move on to next step

      .done(function(data) {

        pull_time['colours'] = Math.ceil(performance.now() - start_time);

        $.each(data, function(key, val) {

          colours.push(val);

        });

        console.log(`Successfully pulled ${colours.length} colours from backend in ${pull_time['colours']}ms.`);

        var reloadQuote;
        var reloadColour;
        var quoteNum;
        var colourNum;

        // Pull settings from backend

        start_time = performance.now();

        console.log('\nPulling settings from backend...');

        $.getJSON(`${full_backend_address}settings_serializer.php`)

          // Move on to next step

          .done(function(data) {

            pull_time['settings'] = Math.ceil(performance.now() - start_time);

            $.each(data, function(key, val) {

              let object = {};

              $.each(val, function(key, val) {

                try {

                  object[key] = JSON.parse(val);

                } catch (error) {

                  object[key] = val;

                }

              });

              settings[key] = object;

            });

            console.log(`Successfully pulled ${Object.keys(settings).length} settings from backend in ${pull_time['settings']}ms.`);

            // Construct settings object from backend or local

            setSettings = function(method, toast) {

              $.each(settings, function(key, val) {

                if (localStorage.getItem(key)) {

                  try {

                    fullSettings[key] = JSON.parse(localStorage.getItem(key));

                  } catch (error) {

                    try {

                      fullSettings[key] = JSON.parse(`[${localStorage.getItem(key)}]`);

                    } catch (error) {

                      fullSettings[key] = localStorage.getItem(key);

                    }

                  }

                } else {

                  fullSettings[key] = settings[key]['value'];

                }

              });

              // Theme colour

              $('.theme-text').css('cssText', `color: ${fullSettings['theme_colour']} !important`);

              // Reload transitions

              if (fullSettings['colour_reload_transitions']) {

                $('.coloured').css('transition', `${fullSettings['colour_reload_transition_time']}ms ease-out`);

              } else {

                $('.coloured').css('transition', 'none')

              }

              // Touch / click gestures

              $('html').hammer().off();

              $('html').hammer().on(fullSettings['reverse_swipe_direction'] ? 'swiperight' : 'swipeleft', function(ev) {

                let direction = fullSettings['reverse_swipe_direction'] ? 'right' : 'left';
                console.log(`Swiped ${direction} to reload.`);
                reloadEngine();

              });

              $('html').hammer().on(fullSettings['reverse_swipe_direction'] ? 'swipeleft' : 'swiperight', function(ev) {

                let direction = fullSettings['reverse_swipe_direction'] ? 'left' : 'right';
                console.log(`Swiped ${direction} to rewind.`);
                goBack();

              });

              // Clear array of menu buttons if the amount of buttons from server is different

              if (fullSettings['button_order'] && settings['button_order'] && fullSettings['button_order'].length !== settings['button_order']['value'].length) {

                localStorage.removeItem('button_order');

              }

              // Keyboard shortcuts

              Mousetrap.reset();

              // Reload & Save Settings (because they share keys)

              if (fullSettings['reload_keys'] && typeof(fullSettings['reload_keys']) === 'object') {

                Mousetrap.bind(fullSettings['reload_keys'], function(e, combo) {

                  if (!appError) {

                    if (!settingsOpen) {

                      reloadEngine();

                    } else if ($('#settings-modal input:focus').length && fullSettings['save_settings_keys'].includes(combo)) {

                      saveSettings();

                    }

                  }

                });

              }

              // Rewind

              if (fullSettings['back_keys'] && typeof(fullSettings['back_keys']) === 'object') {

                Mousetrap.bind(fullSettings['back_keys'], function(e) {

                  if (!appError && !settingsOpen) {

                    goBack();

                  }

                });

              }

              // Toggle Auto Reload

              if (fullSettings['auto_reload_keys'] && typeof(fullSettings['auto_reload_keys']) === 'object') {

                Mousetrap.bind(fullSettings['auto_reload_keys'], function(e) {

                  if (!appError && !settingsOpen) {

                    toggleAutoReload();

                  }

                });

              }

              // Toggle Button Menu

              if (fullSettings['menu_keys'] && typeof(fullSettings['menu_keys']) === 'object') {

                Mousetrap.bind(fullSettings['menu_keys'], function(e) {

                  if (!appError && !settingsOpen) {

                    var fabOpen = $('.fixed-action-btn').hasClass('active') ? true : false;

                    fabOpen ? $('.fixed-action-btn').closeFAB() : $('.fixed-action-btn').openFAB();

                  }

                });

              }

              // Toggle Settings Panel

              if (fullSettings['settings_keys'] && typeof(fullSettings['settings_keys']) === 'object') {

                Mousetrap.bind(fullSettings['settings_keys'], function(e) {

                  if (!appError && !$('#settings-modal input:focus').length) {

                    settingsOpen ? $('#settings-modal').modal('close') : $('#settings-modal').modal('open');

                  }

                });

              }

              if (method !== 'initial') {

                $('#settings-modal').modal('close');
                Materialize.toast(toast, fullSettings['toast_interval']);

                if (fullSettings['require_settings_reload'] || fullSettings['backend_address'] !== backend_address) {

                  window.location.reload();

                }

              }

            }

            setSettings('initial');

            // Check app version

            if (platform === 'app' && fullSettings['app_update_reminder'] && fullSettings['app_version'] !== app_version) {

              Materialize.toast(settings['app_update_reminder']['description'], fullSettings['toast_interval']);

            }

            // Initialize modal plugin

            $('#settings-modal').modal({
              ready: function(modal, trigger) {

                // Scroll to the top of the modal

                if (fullSettings['scroll_settings'] && $('#settings-modal').scrollTop) {

                  $('#settings-modal').animate({
                    scrollTop: 0
                  }, 200);

                }

                settingsOpen = true;

              },
              complete: function() {

                settingsOpen = false;

                $('.settings-input:not(.select-wrapper)').each(function() {

                  let setting = $(this).attr('name');
                  let value = fullSettings[setting];

                  $(this).is('select') || typeof(value) === 'object' ? $(this).val(JSON.stringify(value)) : $(this).val(value);
                  $(this).is('input') ? $(this).parent().find('label').addClass('active') : '';
                  $(this).removeClass('invalid');
                  $('select').material_select();

                });

              }
            });

            // Function for reloading the quote

            reloadQuote = function() {

              // If backend has no quotes, throw an error

              if (!quotes.length) {

                throw new Error('There are no quotes.');

              }

              // Clear error message in case there is one

              $('#error-message').text('');

              let lastNum = localStorage.getItem('lastQuote');
              quoteNum = Math.floor(quotes.length * Math.random());

              // If all quotes are used and no repeats is enabled, start again

              if (usedQuotes.length === quotes.length && fullSettings['no_repeats']) {

                usedQuotes = [];

              }

              // If MoodEngine trys to use the same quote twice, or one that has already been used, generate a new one

              while (lastNum == quoteNum || fullSettings['no_repeats'] && usedQuotes.includes(quoteNum)) {

                quoteNum = Math.floor(quotes.length * Math.random());

              }

              // Add quote to used quotes, quote history and localStorage

              usedQuotes.push(quoteNum);
              quoteHistory.push(quoteNum);
              localStorage.setItem('lastQuote', quoteNum);

              let quote = quotes[quoteNum];

              // Display quote on the text element

              if (fullSettings['text_reload_transitions']) {

                $('#quote').fadeOut(fullSettings['text_reload_transition_time'] / 2, function() {

                  $(this).text(quote).fadeIn(fullSettings['text_reload_transition_time'] / 2);

                });

              } else {

                $('#quote').text(quote);

              }

            };

            // Function for reloading the text

            reloadColour = function() {

              // If backend has no colours, throw an error

              if (!colours.length) {

                throw new Error('There are no quotes.');

              }

              let lastNum = localStorage.getItem('lastColour');
              colourNum = Math.floor(colours.length * Math.random());

              // If MoodEngine trys to use the same colour twice, generate a new one

              while (lastNum == colourNum) {

                colourNum = Math.floor(colours.length * Math.random());

              }

              // Add colour to used colours, colour history and localStorage

              usedColours.push(colourNum);
              colourHistory.push(colourNum);
              localStorage.setItem('lastColour', colourNum);

              let colour = colours[colourNum];

              // Apply colour to background

              $('.coloured').css('background-color', `#${colour}`);
              $('meta[name="theme-color"]').attr('content', `#${colour}`);

            };

            // Build button menu

            var menuHTML = '';

            if (!fullSettings['button_order']) {

              console.warn('Server has no button order, falling back to defaults...');
              fullSettings['button_order'] = ['autoreload', 'settings', 'rewind'];

            }

            var hasUserSettings = false;

            $.each(settings, function(key, val) {

              if (val['user']) {

                hasUserSettings = true;

              }

            });

            $.each(fullSettings['button_order'], function(key, val) {

              switch (val) {

                case 'autoreload':
                  var html = '<li data-button="autoreload"><a class="btn-floating waves-effect transparent" id="toggle-auto-reload"><i class="material-icons theme-text" data-icon="autoreload" data-default="autorenew"></i></a></li>';
                  break;
                case 'settings':
                  let hidden = hasUserSettings ? '' : 'hide';
                  var html = `<li data-button="settings" class="${hidden}"><a class="btn-floating waves-effect transparent modal-trigger" id="settings-button" data-target="settings-modal"><i class="material-icons theme-text" data-icon="settings" data-default="settings"></i></a></li>`;
                  break;
                case 'rewind':
                  var html = '<li data-button="rewind"><a class="btn-floating waves-effect transparent disabled" id="go-back-button"><i class="material-icons theme-text" data-icon="rewind" data-default="skip_previous"></i></a></li>';
                  break;
                default:
                  console.warn(`Unknown value '${val}' in button order, skipping...`);

              }

              menuHTML += html;

            });

            $('#button-menu').html(menuHTML);

            // Set settings again to set proper colours for button menu

            setSettings('initial');

            // Initialize sortable menu

            if (settings['button_order']) {

              $('#button-menu').sortable({
                stop: function(event, ui) {

                  var array = $('#button-menu').sortable('toArray', {
                    attribute: 'data-button'
                  });

                  localStorage.setItem('button_order', JSON.stringify(array));

                }
              });

            }

            // Set correct icons

            if (!fullSettings['button_icons']) {

              console.warn('Server has no icons, falling back to defaults...');

            }

            $('.material-icons').each(function() {

              if (fullSettings['button_icons']) {

                var icon = fullSettings['button_icons'][$(this).attr('data-icon')];

              } else {

                var icon = $(this).attr('data-default');

              }

              $(this).text(icon);

            });

            // Construct settings panel

            var fullHTML = '';
            var fullAdvancedHTML = '';

            $.each(settings, function(key, val) {

              if (val['user']) {

                if (val['input'] === 'select') {

                  var input = `
                  <select class="settings-input" name="${key}">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                  `;

                  var label = `
                  <label>${val['label']}</label>
                  `;

                } else {

                  var input = `
                  <input type="${val['input']}" name="${key}" class="settings-input mousetrap" id="${key}">
                  `;

                  var label = `
                  <label for="${key}">${val['label']}</label>
                  `;

                }

                var mobile = val['mobile'] ? '' : 'hide-on-med-and-down';

                let html = `
                <div class="row ${mobile}">
                  <div class="input-field col s12">
                    ${input}
                    ${label}
                    <a class="black-text settings-link default-button" data-setting="${key}"><b>Set to Default</b></a>
                    <br>
                    <span class="tooltipped" data-setting="${key}" data-position="bottom" data-delay="50">What's this?</span>
                  </div>
                </div>
                `;

                val['advanced'] ? fullAdvancedHTML += html : fullHTML += html;

              }

            });

            $('#settings-form').prepend(fullHTML);

            if (fullAdvancedHTML) {

              $('#advanced-settings-wrapper').removeClass('hide');
              $('#advanced-settings').html(fullAdvancedHTML);

            }

            // Set desired settings to default using the attr on the default button

            $('.default-button').click(function() {

              let setting = $(this).attr('data-setting');
              localStorage.removeItem(setting);
              setSettings(null, `Set ${settings[setting]['label']} to ${settings[setting]['value']}!`);

            });

            // Set the correct values in the settings inputs

            $('.settings-input:not(.select-wrapper)').each(function() {

              let setting = $(this).attr('name');
              let value = fullSettings[setting];

              $(this).is('select') || typeof(value) === 'object' ? $(this).val(JSON.stringify(value)) : $(this).val(value);
              $(this).is('input') ? $(this).parent().find('label').addClass('active') : '';
              $('select').material_select();

            });

            // Add defaults to tooltips

            $('.tooltipped').each(function() {

              let value = `${settings[$(this).attr('data-setting')]['description']}.<br>The default is ${settings[$(this).attr('data-setting')]['value']}.`
              $(this).attr('data-tooltip', value);

              // Initialize the Materialize tooltip plugin

              $('.tooltipped').tooltip({
                html: true
              });

            });

            // Auto reload

            function autoReload() {

              if (!fullSettings['reload_interval'] && fullSettings['reload_interval'] !== 0) {

                fullSettings['reload_interval'] = 3000;

              }

              setTimeout(function() {

                if (!notAutoReloading() && !appError) {

                  reloadEngine('Auto');
                  console.log(`Auto reloaded after ${fullSettings['reload_interval']}ms.`);

                }

                autoReload();

              }, fullSettings['reload_interval']);

            }

            autoReload();

            // Toggle auto reload when the button is clicked

            toggleAutoReload = function() {

              if (!appError) {

                let toggle = notAutoReloading() ? 'Enabled' : 'Disabled';
                let icon_text = notAutoReloading() ? 'close' : 'autorenew';
                let icon = $('#toggle-auto-reload').find('i');

                if (notAutoReloading()) {

                  $('#go-back-button').addClass('disabled');

                } else if (quoteHistory.length > 1) {

                  $('#go-back-button').removeClass('disabled');

                }

                icon.text(icon_text);
                $('main').toggleClass('manual-reload');
                Materialize.toast(`Auto Reload ${toggle}!`, fullSettings['toast_interval']);

              }

            }

            $('#toggle-auto-reload').click(function() {

              toggleAutoReload();

            });

            // Go back when the button is clicked

            goBack = function() {

              if (notAutoReloading() && quoteHistory.length > 1 && !appError) {

                quoteNum = quoteHistory.length - 2;
                quoteHistory.pop();
                localStorage.setItem('lastQuote', quoteHistory[quoteNum]);

                colourNum = colourHistory.length - 2;
                colourHistory.pop();
                localStorage.setItem('lastColour', colourHistory[colourNum]);

                let quote = quotes[quoteHistory[quoteNum]];
                let colour = colours[colourHistory[colourNum]];

                if (fullSettings['text_reload_transitions']) {

                  $('#quote').fadeOut(fullSettings['text_reload_transition_time'] / 2, function() {

                    $(this).text(quote).fadeIn(fullSettings['text_reload_transition_time'] / 2);

                  });

                } else {

                  $('#quote').text(quote);

                }

                $('.coloured').css('background-color', `#${colour}`);
                $('meta[name="theme-color"]').attr('content', `#${colour}`);

              }

              if (quoteHistory.length === 1 || !notAutoReloading()) {

                $('#go-back-button').addClass('disabled');

              }

            }

            $('#go-back-button').click(function() {

              goBack();

            });

            // Try to initialize the MoodEngine if there are no errors

            if (!appError) {

              console.log('\nInitializing MoodEngine...');

              try {

                reloadQuote();
                reloadColour();
                $('#quote').addClass('scale-in');
                $('.preloader-wrapper').addClass('hide');
                $('#retry-button').hide();
                $('.fixed-action-btn').removeClass('hide');
                console.log('MoodEngine initialized.');
                let totalLoadTime = Math.ceil(performance.now() - total_time);
                console.log(`\nTotal load time: ${totalLoadTime}ms.`);

                // If an error, display/log it

              } catch (error) {

                error = error.toString();
                engineError('Failed to initialize MoodEngine.', error, 3);

              }

            }

            $('.container').click(function(e) {

              reloadEngine();

            });

            // Allows other functions to check if currently auto reloading

            function notAutoReloading() {

              return $('main').hasClass('manual-reload');

            }

            // Function to reload both quotes and colour

            reloadEngine = function(method) {

              if (!appError && (notAutoReloading() || method === 'Auto')) {

                reloadQuote();
                reloadColour();

                $('.fixed-action-btn').removeClass('hide');

                if (method !== 'Auto') {

                  $('#go-back-button').removeClass('disabled');

                }

                // Log quote/colour in console (for fun)

                if (fullSettings['extra_logging'] && fullSettings['extra_logging'].includes('reload') && platform === 'web') {

                  console.log(`%c${quotes[quoteNum]}`, `padding: 2px 5px; font-size: 20px; font-family: 'Oxygen'; color: white; background-color: #${colours[colourNum]}`);

                }

              }

            }

            manualReload = function(text, colour) {

              if (fullSettings['text_reload_transitions']) {

                $('#quote').fadeOut(fullSettings['text_reload_transition_time'] / 2, function() {

                  $(this).text(text).fadeIn(fullSettings['text_reload_transition_time'] / 2);

                });

              } else {

                $('#quote').text(text);

              }

              $('.coloured').css('background-color', `#${colour}`);
              $('meta[name="theme-color"]').attr('content', `#${colour}`);

            }

            // Set all settings to default

            $('.set-all-default').click(function() {

              let lastQuote = localStorage.getItem('lastQuote');
              let lastColour = localStorage.getItem('lastColour');
              let buttonOrder = localStorage.getItem('button_order');

              localStorage.clear();

              localStorage.setItem('lastQuote', lastQuote);
              localStorage.setItem('lastColour', lastColour);
              localStorage.setItem('button_order', buttonOrder);

              setSettings(null, 'Set All Settings to Default!');

            });

            // When user trys to save settings

            function saveSettings() {

              let local_settings = {};
              let has_input = true;
              let empty_inputs = [];

              $('.settings-input:not(.select-wrapper)').each(function() {

                // Construct the object using values

                local_settings[$(this).attr('name')] = $(this).val();

                // Detect if input is blank

                if (!$(this).val() || $(this).val() === 'null' || $(this).val().indexOf(' ') >= 0) {

                  $(this).addClass('invalid');

                  empty_inputs.push(` ${$(this).parent().find('label').text()}`);
                  has_input = false;

                } else {

                  $(this).removeClass('invalid');

                }

              });

              // If all inputs are not blank

              if (has_input) {

                delete local_settings[undefined];

                try {

                  $.each(local_settings, function(key, val) {

                    // If the set value is the same as the default, just remove it from localStorage and use backend value

                    if (val === settings[key]['value'] || val === JSON.stringify(settings[key]['value']) || `[${val}]` === JSON.stringify(settings[key]['value'])) {

                      localStorage.removeItem(key);

                      // Otherwise set it in localStorage

                    } else {

                      localStorage.setItem(key, val);

                    }

                  });

                  // Set settings for new ones to come into effect

                  setSettings(null, 'Settings Saved!');

                  // Catch any unexpected errors and display/log them

                } catch (error) {

                  Materialize.toast('Unable to Save Settings. An Error Occurred.', fullSettings['toast_interval']);
                  console.error(`Couldn't save settings. Error: ${error}.`);

                }

                // Close the modal no matter what

                $('#settings-modal').modal('close');

              } else {

                if (empty_inputs.length === 1) {

                  Materialize.toast(`${empty_inputs} Is Empty.`, fullSettings['toast_interval']);

                } else if (empty_inputs.length < 4) {

                  Materialize.toast(`${empty_inputs} Are Empty.`, fullSettings['toast_interval']);

                } else {

                  Materialize.toast(`${empty_inputs.length} Fields Are Empty.`, fullSettings['toast_interval']);

                }

              }

            }

            $('#save-settings-button').click(function() {

              saveSettings();

            });

            // The form is just for show, don't allow submitting

            $('#settings-form').submit(function() {

              return false;

            });

            // Toggle Advanced Settings

            $('#advanced-settings-button').click(function() {

              $(this).toggleClass('underline');
              $('#advanced-settings').slideToggle();

            });

          })

          // If pulling settings from backend fails, display/log the error

          .fail(function(data) {

            engineError('Failed to contact server. Try again later.', 'Failed to pull settings from backend.', '1c', 'backend');

          });

      })

      // If pulling colours from backend fails, display/log the error

      .fail(function(data) {

        engineError('Failed to contact server. Try again later.', 'Failed to pull colours from backend.', '1b', 'backend');

      });

  })

  // If pulling quotes from backend fails, display/log the error

  .fail(function(data) {

    engineError('Failed to contact server. Try again later.', 'Failed to pull quotes from backend.', '1a', 'backend');

  });
