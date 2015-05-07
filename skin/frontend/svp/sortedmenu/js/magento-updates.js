/**
 * This method observes an absurd number of events
 * depending on the capabilities of the current browser
 * to implement expected header navigation functionality.
 *
 * The goal is to separate interactions into four buckets:
 * - pointer enter using an actual mouse
 * - pointer leave using an actual mouse
 * - pointer down using an actual mouse
 * - pointer down using touch
 *
 * Browsers supporting PointerEvent events will use these
 * to differentiate pointer types.
 *
 * Browsers supporting Apple-style will use those events
 * along with mouseenter / mouseleave to emulate pointer events.
 */

MenuManager.wirePointerEvents = function() {
    var that = this;
    // Changed pointerTarget
    var pointerTarget = $j('#nav a.has-children, #nav .nav-title');
    var hoverTarget = $j('#nav li');

    if(PointerManager.getPointerEventsSupported()) {
        // pointer events supported, so observe those type of events

        var enterEvent = window.navigator.pointerEnabled ? 'pointerenter' : 'mouseenter';
        var leaveEvent = window.navigator.pointerEnabled ? 'pointerleave' : 'mouseleave';
        var fullPointerSupport = window.navigator.pointerEnabled;

        hoverTarget.on(enterEvent, function(e) {
            if(e.originalEvent.pointerType === undefined // Browsers with partial PointerEvent support don't provide pointer type
                || e.originalEvent.pointerType == PointerManager.getPointerEventsInputTypes().MOUSE) {

                if(fullPointerSupport) {
                    that.mouseEnterAction(e, this);
                } else {
                    that.PartialPointerEventsSupport.mouseEnterAction(e, this);
                }
            }
        }).on(leaveEvent, function(e) {
            if(e.originalEvent.pointerType === undefined // Browsers with partial PointerEvent support don't provide pointer type
                || e.originalEvent.pointerType == PointerManager.getPointerEventsInputTypes().MOUSE) {

                if(fullPointerSupport) {
                    that.mouseLeaveAction(e, this);
                } else {
                    that.PartialPointerEventsSupport.mouseLeaveAction(e, this);
                }
            }
        });

        if(!fullPointerSupport) {
            //click event doesn't have pointer type on it.
            //observe MSPointerDown to set pointer type for click to find later

            pointerTarget.on('MSPointerDown', function(e) {
                $j(this).data('pointer-type', e.originalEvent.pointerType);
            });
        }

        pointerTarget.on('click', function(e) {
            var pointerType = fullPointerSupport ? e.originalEvent.pointerType : $j(this).data('pointer-type');

            if(pointerType === undefined || pointerType == PointerManager.getPointerEventsInputTypes().MOUSE) {
                that.mouseClickAction(e, this);
            } else {
                if(fullPointerSupport) {
                    that.touchAction(e, this);
                } else {
                    that.PartialPointerEventsSupport.touchAction(e, this);
                }
            }

            $j(this).removeData('pointer-type'); // clear pointer type hint from target, if any
        });
    } else {
        //pointer events not supported, use Apple-style events to simulate

        hoverTarget.on('mouseenter', function(e) {
            // Touch events should cancel this event if a touch pointer is used.
            // Record that this method has fired so that erroneous following
            // touch events (if any) can respond accordingly.
            that.mouseEnterEventObserved = true;
            that.cancelNextTouch = true;

            that.mouseEnterAction(e, this);
        }).on('mouseleave', function(e) {
            that.mouseLeaveAction(e, this);
        });

        $j(window).on('touchstart', function(e) {
            if(that.mouseEnterEventObserved) {
                // If mouse enter observed before touch, then device touch
                // event order is incorrect.
                that.touchEventOrderIncorrect = true;
                that.mouseEnterEventObserved = false; // Reset test
            }

            // Reset TouchScroll in order to detect scroll later.
            that.TouchScroll.reset();
        });

        pointerTarget.on('touchend', function(e) {
            $j(this).data('was-touch', true); // Note that element was invoked by touch pointer

            e.preventDefault(); // Prevent mouse compatibility events from firing where possible

            if(that.TouchScroll.shouldCancelTouch()) {
                return; // Touch was a scroll -- don't do anything else
            }

            if(that.touchEventOrderIncorrect) {
                that.PartialTouchEventsSupport.touchAction(e, this);
            } else {
                that.touchAction(e, this);
            }
        }).on('click', function(e) {
            if($j(this).data('was-touch')) { // Event invoked after touch
                e.preventDefault(); // Prevent following link
                return; // Prevent other behavior
            }

            that.mouseClickAction(e, this);
        });
    }
}
