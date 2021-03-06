export const zoomInDown: ja.AnimationMixin = {
    css: [
        {
            offset: 0,
            opacity: 0,
            transform: 'scale3d(.1, .1, .1) translate3d(0, -1000px, 0)'
        },
        {
            offset: 0.6,
            opacity: 1,
            transform: 'scale3d(.475, .475, .475) translate3d(0, 60px, 0)'
        },
        {
            offset: 1,
            opacity: 1,
            transform: 'none'
        }
    ],

    to: '1s',
    easing: 'easeInCubic'
    ,
    name: 'zoomInDown'
};
