export default class Popup {
    #popup = '';
    #options = {
        pageScrollClass: 'html', 
        delay: 300,
        overflow: true,
        displayClass: 'display',
        visibleClass: 'visible',
    }
    #timers = [];

    constructor ( element, buttons, settings, isInit) {
        this.#popup = element;
        this.#options = {...this.#options, ...settings};
        this.toggleButtons = buttons;

        this.clickToButton = this.clickToButton.bind(this);
        this.closePopupByEsc = this.closePopupByEsc.bind(this);
        this.closePopupByOverlay = this.closePopupByOverlay.bind(this);
        
        if (isInit) this.init();
    }

    init () {
        this.validateValues();

        if (typeof this.#popup === 'string') {
            this.#popup = document.querySelector(this.#popup);
        }
        if (typeof this.toggleButtons === 'string') {
            this.toggleButtons = Array.from(document.querySelectorAll(this.toggleButtons));
        }

        this.setCustomEvents();
        this.setEventListeners();
        this.scrollWidth = window.innerWidth - document.documentElement.clientWidth;
        this.scrollElement = document.querySelector(this.#options.pageScrollClass);
        this.destroyState = false;
        this.events = [];

        const timerForEvent = setTimeout(() => this.#popup.dispatchEvent(this.initEvent), 1);
        this.#timers.push(timerForEvent);
    }

    validateValues () {
        if (!this.#popup) {
            throw new Error('Отсутствует класс или элемент попапа');
        } else if (typeof this.#popup === 'string' && this.#popup[0] !== '.') {
            throw new Error('Класс попапа должен начинаться с точки')
        }

        if (!this.toggleButtons) {
            throw new Error('Отсутствует класс для кнопок');
        } else if (typeof this.toggleButtons === 'string' && this.toggleButtons[0] !== '.') {
            throw new Error('Класс кнопки должен начинаться с точки')
        }
    }
    
    addEventListener (name, callback) {
        if (this.destroyState) return
        const event = {name, callback}
        this.events.push(event);
        this.#popup.addEventListener(event.name, event.callback);
    }

    setCustomEvents () {
        const options = {popup: this.#popup, ...this.#options};
        this.initEvent = new CustomEvent("sp-init", {bubbles: true});
        this.beforeOpenEvent = new CustomEvent("sp-beforeOpen", {bubbles: true});
        this.afterOpenEvent = new CustomEvent("sp-afterOpen", {bubbles: true});
        this.beforeChangeOpenEvent = new CustomEvent("sp-beforeChange", {
            bubbles: true, 
            detail: { options, state: 'open' }
        });
        this.beforeChangeCloseEvent = new CustomEvent("sp-beforeChange", {
            bubbles: true, 
            detail: { options, state: 'close' }
        });
        this.afterChangeOpenEvent = new CustomEvent("sp-afterChange", {
            bubbles: true, 
            detail: { options, state: 'open' }
        });
        this.afterChangeCloseEvent = new CustomEvent("sp-afterChange", {
            bubbles: true, 
            detail: { options, state: 'close' }
        });
        this.beforeCloseEvent = new CustomEvent("sp-beforeClose", {bubbles: true});
        this.afterCloseEvent = new CustomEvent("sp-afterClose", {bubbles: true});
    }

    setEventListeners () {
        this.#popup.addEventListener("mousedown", this.closePopupByOverlay);
        document.addEventListener('keydown', this.closePopupByEsc);
        document.addEventListener('click', this.clickToButton);
    }

    clickToButton (evt) {
        if(this.toggleButtons.indexOf(evt.target) != -1) {
            evt.preventDefault();
            this.togglePopup();
        }
    }

    getFocus () {
        this.openElement = document.activeElement;
    }

    setFocus() {
        this.openElement.focus();
    }

    closePopupByOverlay (evt) {
        if (evt.target === evt.currentTarget) this.close();
    }

    closePopupByEsc (evt) {
        if (evt.key === "Escape") this.close();
    }

    togglePopup () {
        if (this.destroyState) return
        if (this.#popup.classList.contains(this.#options.visibleClass)) {
            this.close();
        } else {
            this.open();
        }
    }

    open () {
        if (this.destroyState) return
        this.#popup.dispatchEvent(this.beforeOpenEvent)
        this.#popup.dispatchEvent(this.beforeChangeOpenEvent)
        this.#popup.classList.add(this.#options.displayClass)
        this.getFocus();

        const timerForClass = setTimeout(() => {this.#popup.classList.add(this.#options.visibleClass);}, 1);;
        this.#timers.push(timerForClass);

        const timerForEvents = setTimeout(() => {
            this.#popup.dispatchEvent(this.afterOpenEvent)
            this.#popup.dispatchEvent(this.afterChangeOpenEvent)
        }, this.#options.delay);
        this.#timers.push(timerForEvents);

        if (this.#options.overflow && this.scrollElement) {
            if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
                this.disableBodyScroll();
            }
            this.scrollElement.style.paddingRight = this.scrollWidth + 'px';
            this.scrollElement.style.overflow = 'hidden'
        }
    }

    close () {
        if (this.destroyState) return
        this.#popup.dispatchEvent(this.beforeCloseEvent)
        this.#popup.dispatchEvent(this.beforeChangeCloseEvent)
        this.#popup.classList.remove(this.#options.visibleClass);

        this.setFocus();

        if (this.#options.overflow && this.scrollElement) {
            if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
                this.enableBodyScroll()
            } 
            this.scrollElement.style.paddingRight = 0;
            this.scrollElement.style.overflow = 'auto'
        }

        const timerForEvents = setTimeout(() => {
            this.#popup.classList.remove(this.#options.displayClass);
            this.#popup.dispatchEvent(this.afterCloseEvent)
            this.#popup.dispatchEvent(this.afterChangeCloseEvent)
        }, this.#options.delay);
        this.#timers.push(timerForEvents);
    }

    disableBodyScroll() {
        this.scrollElement.style.position = 'relative';
        this.scrollElement.style.width = '100%';
    }

    enableBodyScroll() {
        this.scrollElement.style.removeProperty('position');
        this.scrollElement.style.removeProperty('width');
    }

    destroy () {
        this.destroyState = true;
        this.events.forEach((event) => {
            this.#popup.removeEventListener(event.name, event.callback);
        });
        this.#popup.removeEventListener("mousedown", this.closePopupByOverlay);
        document.removeEventListener('keydown', this.closePopupByEsc);
        document.addEventListener('click', this.clickToButton);
        this.#timers.forEach ((timer)=> {
            clearTimeout(timer);
        });
        if (this.scrollElement) {
            this.scrollElement.style.removeProperty('padding-right')
            this.scrollElement.style.removeProperty('overflow')
            this.enableBodyScroll();
        }
    }
}
