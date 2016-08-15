(function () {

    const q = document.querySelectorAll.bind(document);
    const qe = document.querySelector.bind(document);
    const assign = Object.assign;
    const SelectedTD = 'selected';
    const SelectedTDSeletor = '.' + SelectedTD;

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
            let self = this,
                table = self.element,
                path = [],
                addSelectedClass = (el)=> {
                    el.classList.add(SelectedTD);
                },
                clearSelected = ()=> {
                    self.element.querySelectorAll(SelectedTDSeletor).forEach(item => item.classList.remove(SelectedTD));
                },
                renderPath = (x, y, el) => {
                    let prePoint = path[path.length - 1];
                    let curPoint = [x,y];
                    path.push(curPoint);

                    addSelectedClass(el);


                    let tempEl = el,
                        count = 0,
                        flag = true;
                    if(y - prePoint[1]){
                        count = x - self.startX;
                        let flag = count > 0;
                        count = Math.abs(count);
                        console.log('x' + count);
                        while (count) {
                            tempEl = flag ? tempEl.previousSibling : tempEl.nextSibling;
                            addSelectedClass(tempEl);
                            count --;
                        }
                    }

                    if(x - prePoint[0]){
                        tempEl = el;
                        count = y - self.startY;
                        flag = count > 0;
                        count = Math.abs(count);
                        console.log('y' + count);
                        while (count) {
                            tempEl = flag ? tempEl.parentNode.previousSibling.querySelector('td:nth-child(' + (x + 1) + ')'):
                                tempEl.parentNode.nextSibling.querySelector('td:nth-child(' + (x + 1) + ')');
                            addSelectedClass(tempEl);
                            count --;
                        }
                    }
                },
                mouseMove = e=> {
                    if (e.target.tagName === 'TD') {
                        let movedTd = e.target,
                            lastPath = path[path.length - 1],
                            x = movedTd.cellIndex,
                            y = movedTd.parentElement.rowIndex;
                        if(lastPath[0] !== x || lastPath[1] !== y){
                            renderPath(x, y, movedTd);
                        }
                    }
                },
                mousedown = e => {
                    if (e.target.tagName === 'TD') {
                        clearSelected();
                        let td = e.target;
                        self.startX = td.cellIndex;
                        self.startY = td.parentElement.rowIndex;
                        path.length = 0;
                        path.push([self.startX, self.startY]);
                        addSelectedClass(td);

                        table.addEventListener('mousemove', mouseMove);

                        //noinspection JSCheckFunctionSignatures
                        document.addEventListener('mouseup', ()=> {
                            table.removeEventListener('mousemove', mouseMove, false);
                        }, {once: true})

                    }
                };

            table.addEventListener('mousedown', mousedown);

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

    let dt = new Designetable(null, {rows: 10});

    // qe('body').appendChild(dt.element);

    dt.logOption();


}());


