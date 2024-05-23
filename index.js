import Popup from './Popup.js';

'use strict';

const popupItem = new Popup('.popup', '.js-popup-toggle', {
    displayClass: 'popup_display',
    visibleClass: 'popup_opened',
    delay: 1000,
    overflow: true
}, true);

popupItem.addEventListener('sp-beforeChange', function(evt) {
    console.log('beforeChange', evt.detail)
});

popupItem.addEventListener('sp-afterChange', function(evt) {
    console.log('afterChange', evt.detail)
});

popupItem.addEventListener('sp-init', function(evt) {
    console.log('init')
});

popupItem.addEventListener('sp-beforeOpen', function(evt) {
    console.log('beforeOpen')
});

popupItem.addEventListener('sp-afterOpen', function(evt) {
    console.log('afterOpen')
});

popupItem.addEventListener('sp-beforeClose', function(evt) {
    console.log('beforeClose')
});

popupItem.addEventListener('sp-afterClose', function(evt) {
    console.log('afterClose')
});

popupItem.destroy()
