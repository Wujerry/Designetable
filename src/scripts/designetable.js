(function () {

    const q = document.querySelectorAll.bind(document);
    const qe = document.querySelector.bind(document);
    const assign = Object.assign;

    class Designetable {

        constructor(selector, {
            rows = 5, columns = 5, data = [], renderTo = 'body', cssNameSpace = 'designetable'
        }) {
            this.version = '0.0.1';
            this.cssNameSpace = cssNameSpace;

            this.selector = selector;
            this.rows = rows;
            this.columns = columns;
            this.data = data;
            this.container = qe(renderTo);

            this.element = qe(selector);


            this.startX = 0;
            this.endX = 0;
            this.startY = 0;
            this.endY = 0;

            if (this.selector && qe(this.selector)) {
                this._refresh();
            } else {
                this._init();

            }

        }

        _refresh() {

        }

        _init() {
            this.element = this._createTable();
            this._bindEvent();
            if (this.container) {
                this.container.appendChild(this.element);
            }
        }


        _bindEvent() {
            let el = this.element;
            let mouseMove = (e) => {
                if (e.target.tagName === 'TD') {
                    let movedTd = e.target;
                    let x = movedTd.cellIndex;
                    let y = movedTd.parentElement.rowIndex;
                    if (this.startX !== x || this.startY !== y) {
                        movedTd.classList.add('selected');
                    }
                }
            };
            el.addEventListener('mousedown', e => {
                if (e.target.tagName === 'TD') {
                    let td = e.target;
                    td.classList.add('selected');
                    this.startX = td.cellIndex;
                    this.startY = td.parentElement.rowIndex;

                    el.addEventListener('mousemove', mouseMove);

                    //noinspection JSCheckFunctionSignatures
                    document.addEventListener('mouseup', ()=> {
                        el.removeEventListener('mousemove', mouseMove, false);
                    }, {once: true})

                }
            });


        }


        _createTable() {
            let t = document.createElement('table');
            t.classList.add(this.cssNameSpace);

            if (this.data.length) {

            } else {
                t.innerHTML = this._createRows(this.columns, this.rows).join('');
            }
            return t;
        }

        _createEls(tagName = 'td', num = 1) {
            return new Array(num).fill(0).map(item => `<${tagName}><${tagName}/>`);
        }

        _createRows(colNum, rowNum = 1) {
            return new Array(rowNum).fill(0).map(item => '<tr>' + this._createEls('td', colNum).join('') + '</tr>')
        }


        logOption() {
            console.log(this.options);
        }

        version() {
            console.log(this.version);
        }
    }


//test

    let dt = new Designetable(null, {rows: 3});

    // qe('body').appendChild(dt.element);

    dt.logOption();


}());


