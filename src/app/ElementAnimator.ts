import {IAnimation} from '../interfaces/IAnimation';
import {IAnimationManager} from '../interfaces/IAnimationManager';
import {IAnimationTiming} from '../interfaces/IAnimationTiming';
import {ICallbackHandler} from '../interfaces/ICallbackHandler';
import {IConsumer} from '../interfaces/IConsumer';
import {IElementProvider, ElementSource} from '../interfaces/IElementProvider';
import {IKeyframe} from '../interfaces/IKeyframe';
import {IIndexed} from '../interfaces/IIndexed';

import {multiapply, each, extend, isArray, isFunction, isString, noop, toArray} from './helpers';

export class ElementAnimator implements IAnimation {
    private _animations: IAnimation[];
    constructor(manager: IAnimationManager, keyframesOrName: string | IIndexed<IKeyframe>, el: ElementSource, timings?: IAnimationTiming) {
        if (!keyframesOrName) {
            return;
        }
        
        let keyframes;
        if (isString(keyframesOrName)) {
            // if keyframes is a string, lookup keyframes from registry
            const definition = manager.findAnimation(keyframesOrName as string);
            keyframes = definition.keyframes;

            // use registered timings as default, then load timings from params           
            timings = extend({}, definition.timings, timings);
        } else {
            // otherwise, keyframes are actually keyframes
            keyframes = keyframesOrName;
        }

        if (timings && timings.easing) {
            // if timings contains an easing property, 
            const easing = manager.findEasing(timings.easing);
            if (easing) {
                timings.easing = easing;
            }
        }

        // get list of elements to animate
        const elements = getElements(el);

        // call .animate on all elements and get a list of their players        
        this._animations = multiapply(elements, 'animate', [keyframes, timings]) as IAnimation[];
    } 
    public finish(fn?: ICallbackHandler): IAnimation {
        multiapply(this._animations, 'finish', [], fn);
        return this;
    }
    public play(fn?: ICallbackHandler): IAnimation {
        multiapply(this._animations, 'play', [], fn);
        return this;
    }
    public pause(fn?: ICallbackHandler): IAnimation {
        multiapply(this._animations, 'pause', [], fn);
        return this;
    }
    public reverse(fn?: ICallbackHandler): IAnimation {
        multiapply(this._animations, 'reverse', [], fn);
        return this;
    }
    public cancel(fn?: ICallbackHandler): IAnimation {
        multiapply(this._animations, 'cancel', [], fn);
        return this;
    }
    get onfinish(): IConsumer<AnimationEvent> {
        if (this._animations.length === 0) {
            return undefined;
        }
        return this._animations[0].onfinish as IConsumer<AnimationEvent> || noop;
    }
    set onfinish(val: IConsumer<AnimationEvent>) {
        each(this._animations, (a: IAnimation) => { a.onfinish = val; });
    }
}

function getElements(source: ElementSource): Element[] {
    if (!source) {
        throw Error('source is undefined');
    }
    if (isString(source)) {
        // if query selector, search for elements 
        const nodeResults = document.querySelectorAll(source as string);
        return toArray(nodeResults);
    }
    if (source instanceof Element) {
        // if a single element, wrap in array 
        return [source];
    }
    if (isArray(source)) {
        // if array or jQuery object, flatten to an array
        const elements = [];
        each(source as IIndexed<any>, (i: any) => {
            // recursively call this function in case of nested elements
            const innerElements = getElements(i);
            elements.push.apply(elements, innerElements);
        });
        return elements;
    }
    if (isFunction(source)) {
        // if function, call it and call this function
        const provider = source as IElementProvider;
        const result = provider();
        return getElements(result);
    }

    // otherwise return empty    
    return [];
}