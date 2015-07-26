// ==UserScript==
// @name		 Steam badges page enhancement
// @namespace	http://steamcommunity.com/id/Enissay/
// @version	  0.1
// @description  All ready badges info gathered in one handy table
// @author	   Enissay
// @include      /^(https?:\/\/)?(www\.)?steamcommunity\.com\/(id|profiles)\/[^\/]+\/badges\/?.*$/
// @grant		none
// ==/UserScript==

/*****************
 * Starting infos
 *****************/
//console.log('%c ' + GM_info.script.name + ' script started', 'background: #222; color: #bada55');
var console_info=["%c " + GM_info.script.name + " %c v" + GM_info.script.version + " by " + GM_info.script.author + " %c @ " + GM_info.script.namespace + " %c Started ",
                  "background: #000000;color: #7EBE45",
                  "background: #000000;color: #ffffff",
                  "",
                  "background: #000000;color: #7EBE45"];
console.log.apply(console,console_info);

// Move content to the right.... (Remove to center)
$J("#footer").hide();
$J("div.maincontent").css("float", "right");
/***************
 * Gather Infos
 ***************/
var limit = 10;
var CompletedBadgesCounter = 0;

var cardWidth = $J('div.badges_sheet > div.badge_row:first div.badge_progress_tasks > div[class^="badge_progress_card"]:first').find('img:first').width();
var firstBadgeRowOffset = $J('div.badges_sheet > div.badge_row').eq(0).offset();

var maxCells = Math.floor(firstBadgeRowOffset.left/(cardWidth+10));

console.log( 'cardWidth = ' + cardWidth );
console.log( 'maxCells = ' + maxCells );

var hideShowSpeed = 1000;

// Trick to load card's pics
var tt = 1000;
$J('body, html').animate({scrollTop: $J(document).height()/2}, tt); // scroll down to Nth of hight $J(document).height()/N
$J('body, html').animate({scrollTop: 0}, tt/10); // scroll back to the top

$J(window).load(function() {  // wait for all page to load
    setTimeout(function() {  // delay execution by X seconds till all other script are executed    
        //add special panel to show counts
        $J('div.pagecontent').append('<div class="EnissaysCompletedBadgesCount" style="position:absolute; left:0px; top:'+firstBadgeRowOffset.top+'px" />');

        //fuck it, we're using tables.
        var table = $J('<table></table>');
        $J('.EnissaysCompletedBadgesCount').append(table);

        //header row for you vs. them labels
        var tableHeaderHtml = '<tr><th colspan="'+maxCells+'">\
                                   <div class="stats">\
                                       <span>N</span> Completed badge\
                                   </div>\
                               </th></tr>';
        table.append($J(tableHeaderHtml));
        
        // Table row
        var tableRow = $J('<tr>' + Array(maxCells+1).join('<td/>') + '</tr>');
        $J(table).append(tableRow.clone());
        
        // HTML
        var iconsHTML = '<div class="floating-icons">\
                             <img class="expand-icon" src="http://i.imgur.com/GEMQSOE.png" alt="xTitle" title="" />\
                             <img class="collapse-icon" src="http://i.imgur.com/J7nit2A.png" alt="xTitle" title="" />\
                         </div>';
        var gameHTML = '<div class="game">\
                             <div class="game-title"><a target="_blank">xTitle</a></div>\
                         </div>';
        
        var currentFreeCell = 0;
        var completedBadgesRows = [];
        var badgesPageUrl;
        var storePageUrlBase = 'http://store.steampowered.com/app/XxXxX/?snr=1_7_7_230_150_6';
        
        // loop through all game's rows
        $J('div.badges_sheet > div.badge_row').each(function() {
            var gameTitle = $J(this).find('div.badge_title').contents().filter(function() {  // http://stackoverflow.com/a/5915443/1519058
                return this.nodeType == 3;
            }).text().replace(/&nbps;|^\s*|\s*$/g, '');

            var badgeReady = $J(this).find('div.badge_progress_info').text().match(/\s*Ready\s*/g, '');

            if (badgeReady){
                CompletedBadgesCounter++;
                
                completedBadgesRows.push($J(this));
                
                // Get urls
                badgesPageUrl = $J(this).children('a.badge_row_overlay').attr('href');
                var storePageUrl = storePageUrlBase;
                storePageUrl = storePageUrl.replace('XxXxX', badgesPageUrl.match(/gamecards\/(\d+)/)[1]);
                
                var firstCardNode = $J(this).find('div.badge_progress_tasks > div[class^="badge_progress_card"]:first').clone().removeAttr('class').addClass('game-first-card');
                firstCardNode.find('img').attr('title', gameTitle).wrap('<a target="_blank" href="' + badgesPageUrl + '"></a>');
                
                // Insert
                //$J(this).hide();
                
                // Insert Icons
                firstCardNode.append($J(iconsHTML).attr('title', gameTitle));
                firstCardNode.find('img.expand-icon').attr('alt', 'Show '+gameTitle+'\'s row');
                firstCardNode.find('img.expand-icon').attr('title', 'Show '+gameTitle+'\'s row');
                firstCardNode.find('img.collapse-icon').attr('alt', 'Hide '+gameTitle+'\'s row');
                firstCardNode.find('img.collapse-icon').attr('title', 'Hide '+gameTitle+'\'s row');
                // Insert Title
                var gameNode = $J(gameHTML.replace(/xTitle/g, gameTitle)).find('a').attr('href', storePageUrl).parent().parent().append(firstCardNode);

                /***************
                * Insert rows
                ***************/
                if( (currentFreeCell) >= maxCells ) { // row is full
                    $J(table).append(tableRow.clone());  // Insert new row
                    currentFreeCell = 0; // reinitialise it back to 0
                }
                
                $J(table).find('tr:last td:nth-of-type(' + (currentFreeCell+1) + ')').append(gameNode);
                currentFreeCell++;              
                
                
                /***************
                * Add events
                ***************/
                gameNode.find('.collapse-icon').click($J.proxy(function() {
                    console.log( "-> Collapse <- " + gameTitle);
                    $J(this).slideUp(hideShowSpeed);
                },this));

                gameNode.find('.expand-icon').click($J.proxy(function() {
                    console.log( "<- Expand -> " + gameTitle);
                    $J(this).slideDown(hideShowSpeed);
                },this));
                
                // Tooltip the title only if "ellipsis" is activated (ie: truncated text)
                $J('.EnissaysCompletedBadgesCount .game-title').bind('mouseenter', function(){
                    var $this = $J(this);

                    if(this.offsetWidth < this.scrollWidth && !$this.attr('title')){
                        $this.attr('title', $this.text());
                    }
                });
            }
        });        
        
        // Insert completed badges count
        table.find('tr:first > th:first .stats span').text(CompletedBadgesCounter).parent().text(function(i,text){
                                                                                                     return text.replace(/badge/g, 'badge'+((CompletedBadgesCounter > 1) ? 's' : ''))
                                                                                                 });
        
        table.find('tr:first > th:first .stats').append($J(iconsHTML).find('img.expand-icon').attr('title', 'Show all completed rows').parent()
                                                                     .find('img.collapse-icon').attr('title', 'Hide all completed rows').parent());
        

        $J(document).find('.EnissaysCompletedBadgesCount table th .floating-icons .expand-icon').click(function() {
            console.log( "<-- Expand ALL --> ");
            
            var arrayLength = completedBadgesRows.length;
            for (var i = 0; i < arrayLength; i++) {
                completedBadgesRows[i].slideDown(hideShowSpeed);
            }
        });

        $J(document).find('.EnissaysCompletedBadgesCount table th .floating-icons .collapse-icon').click(function() {
            console.log( "--> Collapse ALL <-- ");
            
            var arrayLength = completedBadgesRows.length;
            for (var i = 0; i < arrayLength; i++) {
                completedBadgesRows[i].slideUp(hideShowSpeed);
            }
        });
        /***************
        * Apply styles
        ***************/        
        $J(document).find('.EnissaysCompletedBadgesCount table td').css({'border': '1px solid #FFF',
                                                                         'display': 'table-cell',
                                                                         'padding': '5px',
                                                                         'max-width': cardWidth
                                                                        });
        
        $J(document).find('.EnissaysCompletedBadgesCount table  td .game-title, .EnissaysCompletedBadgesCount table  td .game-title a').css({'font-family': 'Arial, Helvetica, sans-serif',
                                                                                      'font-weight': 'bold',
                                                                                      'color': 'red',
                                                                                      'overflow': 'hidden',
                                                                                      'white-space': 'nowrap',
                                                                                      'clear': 'both',
                                                                                      'padding': '1px',
                                                                                      /*'display': 'block',*/
                                                                                      'text-overflow': 'ellipsis'
                                                                                     });

        // badges icons
        $J(document).find('.EnissaysCompletedBadgesCount table td .game-first-card, .EnissaysCompletedBadgesCount table td .game-first-card a').css({'position': 'relative',
                                                                                                                                                     'display': 'inline-block'
                                                                                                                                                    });

        $J(document).find('.EnissaysCompletedBadgesCount table td .floating-icons').css({'position': 'absolute',
                                                                                         'bottom': '2px',
                                                                                         'right': '2px',
                                                                                         'background': 'rgb(0, 0, 0)', /* fallback color */
                                                                                         'background': 'rgba(0, 0, 0, 0.7)'
                                                                                        });

        $J(document).find('.EnissaysCompletedBadgesCount table td .floating-icons img').css({'display': 'block',
                                                                                             'padding': '1px',
                                                                                             'cursor': 'pointer',
                                                                                             'width': (cardWidth/6),
                                                                                             'height': (cardWidth/6)
                                                                                            });
        // title icons
        $J(document).find('.EnissaysCompletedBadgesCount table  th .stats').css({'font-family': 'Verdana, Arial, Helvetica, sans-serif',
                                                                                 'font-size': '150%',
                                                                                 'font-weight': 'bold',
                                                                                 'color': '#CEF50F',
                                                                                 'white-space': 'nowrap',
                                                                                 'clear': 'both',
                                                                                 'padding': '1px',
                                                                                 'text-align': 'center',
                                                                                 'vertical-align': 'middle',
                                                                                 /*'display': 'block',*/
                                                                                });
        $J(document).find('.EnissaysCompletedBadgesCount table  th .stats span').css({'font-family': 'Verdana, Arial, Helvetica, sans-serif',
                                                                                      'font-weight': 'bold',
                                                                                      'color': '#80FF00',
                                                                                      'white-space': 'nowrap',
                                                                                      'clear': 'both',
                                                                                      'padding': '1px',
                                                                                      /*'display': 'block',*/
                                                                                     });
        
        $J(document).find('.EnissaysCompletedBadgesCount table th .stats').css({'position': 'relative',
                                                                                'display': 'inline-block',
                                                                                'width': '100%'
                                                                                });
        
        $J(document).find('.EnissaysCompletedBadgesCount table th .floating-icons').css({'position': 'absolute',
                                                                                         'bottom': '2px',
                                                                                         'right': '2px',
                                                                                         'cursor': 'pointer',
                                                                                         'background': 'rgb(0, 0, 0)', /* fallback color */
                                                                                         'background': 'rgba(0, 0, 0, 0.7)'
                                                                                        });
        
        $J(document).find('.EnissaysCompletedBadgesCount table th .floating-icons img').css({'display': 'inline-block',
                                                                                             'padding': '1px',
                                                                                             'width': (cardWidth/5),
                                                                                             'height': (cardWidth/5)
                                                                                            });
    }, 5000);
    
});

