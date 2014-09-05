on("ready", function() {
    on("change:graphic", function(obj, prev){
        var traps = new trapManager(); //Prob should make this statis
        
        //Only token linked to a char sheet will trigger traps.
        var represents = obj.get("represents")
        if (!obj.get("represents") == "") {
            traps.checkTrapTrigger(obj);
        }
    });
});

function trapManager() {
    this.checkTrapTrigger = function(firedBy){
        // Get the page ID and location of the changed token
        var pageID = firedBy.get("_pageid")
        xLoc =  Math.ceil(firedBy.get("left")/70);
        yLoc =  Math.ceil(firedBy.get("top")/70);
        
        log("Checking for trap triggers at " +pageID+":"+ xLoc + ","+yLoc)
        
        // For each defined trap check to see if the token landed on the trap.
        // Future work will have options to control triggering on crossing over and\or landing on it to trigger it
        traps.forEach(function(opts){
            log("Checking trap "+opts.pageID+":"+parseInt(opts.xP1)+","+parseInt(opts.yP1)+";"+parseInt(opts.xP2)+","+parseInt(opts.yP2));
            if (!parseInt(opts.fired)
            && opts.pageID == pageID
            && xLoc >= parseInt(opts.xP1)
            && xLoc <= parseInt(opts.xP2)
            && yLoc >= parseInt(opts.yP1)
            && yLoc <= parseInt(opts.yP2)
            ) {
                opts.fired = 1; //Only fire a trap event once
                opts.fireEvent(firedBy); // Fire the trap callback taking some action
            }
        });
    };
};

// Here is the bulk of where you define a trap and cusomize the events. This is an array of all traps on your campaign (I only have 1 defined).
// Trap coordinates are defined in squares, not pixals.  A trap location is defined as a rectange having two points (x1,y1 to x2,y2)
// Set the pageID and region of the trap and when a token enters this area the defined callback in the array will be triggered.
var traps = [
    // In this example when a charater lands next to (or on) a placed npc he (and his campfire) disappears in a firey explosion.
    {pageID: "7F73B956-71C3-4C5B-8C72-576EE4F15EA4", xP1: 16, yP1: 2, xP2: 18, yP2: 4, fired: false, fireEvent: function(firedBy){
            //Find objects I want to manipulate
            var explode = findObjs({_type: "graphic", name: "MysteryExplode"})[0];
            var man = findObjs({_type: "graphic", name: "Mystery Man"})[0];
            var campfire = findObjs({_type: "graphic", name: "MysteryCampfire"})[0];
            
            // GM emote a notification of the trap trigger and by whom.
            sendChat('', "/emas The camper laughs at "+ firedBy.get("name") +" and disappears in a firey explosion. You take 2 points of damage")
            
            // Hide the npc and the campfire
            man.set({
                    'layer': 'gmlayer'
                });
            campfire.set({
                'layer': 'gmlayer'
            });
            
            // Animate a quick flashing explosion
            var flashCount = 0;
            var flashObj = setInterval(function(){
                var nextLayer = (explode.get("layer") == "gmlayer") ? "objects" : "gmlayer";
                explode.set({
                    'layer': nextLayer
                });
                flashCount++;
                // ensure the explosion is hidden before we kill the animation.
                if (flashCount >= 20 && explode.get("layer") == "gmlayer") {
                    clearInterval(flashObj)
                }
            }, 50);
        }
    
    }
];
