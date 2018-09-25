import React, {Component} from "react";
import "./autoCompleteDropdownMenuStyles.css";
import PropTypes from "prop-types";
import _ from "lodash";

class AutoCompleteDropdownMenu extends Component {

    static keycode = {
        backspace: 8,
        rightbrace: 211,
        leftbrace: 219,
        left: 37,
        right: 39,
        down: 40,
        up: 38,
        enter: 13,
        esc: 27
    };

    static propTypes = {
        input: PropTypes.string.isRequired,
        target: PropTypes.object,
        keyPress: PropTypes.number.isRequired,
        onEntitySelected: PropTypes.func.isRequired,
        getDataFunc: PropTypes.func.isRequired
    };

    static defaultProps = {
        input: "",
        keyPress: -1,

        //We are expecting a func with callback arg.
        getDataFunc: (callback) => {
            callback([]);
        }
    };

    constructor(props) {
        super(props);

        this.openBrace = false;
        this.preTargetSelection = 0;
        this.selectIndex = -1;
        this.currentEntityList = [];
        this.textWidth = 0;
        this.isBackFromAutoCompleted = false;
        this.maxRows = 5;
        this.menuStartIndex = 0;
        this.keyPress = -1;
        this.isBackFromClick = false;

        this.state = {
            entitiesList: []
        };
    }

    componentDidMount() {

        this.props.getDataFunc((list) => {
            this.setState({
                entitiesList: list
            });
        });
    }

    //It is to dynamically measure the width of the text
    divRef(element, isTextChanged) {

        if (element !== null) {
            let boundingRect = element.getBoundingClientRect();

            this.textWidth = boundingRect.width;

            if (isTextChanged) {
                this.forceUpdate();
            }

        }

    };

    //Create UI for menu rows
    getEntityList(entityName, shouldRest) {
        let res = [];
        let list = this.state.entitiesList;

        let searchTerm = entityName.trim();

        //filter out rows based on search term
        list = _.map(list, (o) => {
            if (_.startsWith(o.toLowerCase(), searchTerm.toLowerCase())) {
                return o;
            }
        });
        //remove undefined rows
        list = _.without(list, undefined);

        this.currentEntityList = list;

        if (entityName.trim().length > 0 && shouldRest && list.length > 0) {
            this.selectIndex = 0;
        }

        let len = list.length < this.maxRows ? list.length : this.maxRows;
        let index = this.selectIndex - this.menuStartIndex;
        for (let i = 0; i < len; i++) {

            let item = null;

            let events = {
                onClick: (event) => {
                    this.onClickRow(event, this.menuStartIndex+i);
                },
                onMouseDown: (event) => {
                    this.onMouseDown(event);
                }
            };

            let key = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
            if (index % this.maxRows !== i) {
                item = <div key={key} className="row" {...events}>{list[this.menuStartIndex + i]}</div>;
            } else {
                item = <div key={key} className="row selectColor" {...events}>{list[this.menuStartIndex + i]}</div>;
            }

            res.push(item);
        }
        return res;
    }

    onMouseDown(event) {
        //prevent it from losing the focus
        event.preventDefault();
    }

    onClickRow(event, index) {

        event.preventDefault();

        if (index !== -1 && index === this.selectIndex) {
            this.keyPress = AutoCompleteDropdownMenu.keycode.enter;
        } else {
            this.keyPress = -1;
        }

        this.isBackFromClick = true;
        this.selectIndex = index;
        this.forceUpdate();
    }

    //Get string after left brace
    getCurrentEntity(input) {
        let start = input.lastIndexOf("{");
        let res = input.substring(start + 1);

        return res;
    }

    getRightBraceIndex(fulltext) {

        fulltext = fulltext.split("");
        for (let i = 0; i < fulltext.length; i++) {
            if (fulltext[i] === "{") {
                return -1;
            } else if (fulltext[i] === "}") {
                return i;
            }
        }
        return -1;
    }

    isOpenBrace(text) {

        text = text.split("");
        for (let i = text.length - 1; i >= 0; i--) {

            if (text[i] === "}") {
                return false;
            } else if (text[i] === "{") {
                return true;
            }
        }

        return false;
    }

    render() {

        let keyPress = this.isBackFromClick ? this.keyPress : this.props.keyPress;
        this.isBackFromClick = false;
        let target = this.props.target;
        let targetHeight = 0;
        let targetSelection = 0;
        if (target !== null) {
            let rect = target.getBoundingClientRect();
            targetHeight = rect.height;
            targetSelection = target.selectionStart;

            //The targetSelection number becomes inaccurate under certain circumstances. Adjust the value.
            if (keyPress === AutoCompleteDropdownMenu.keycode.left) {
                targetSelection = targetSelection - 1;
            } else if (keyPress === AutoCompleteDropdownMenu.keycode.right) {
                targetSelection = targetSelection + 1;
            } else if (this.isBackFromAutoCompleted) {
                targetSelection = this.props.input.length;
                this.isBackFromAutoCompleted = false;
            }
        }

        let foreText = this.props.input.substring(0, targetSelection);
        let afterText = this.props.input.substring(targetSelection);

        if (keyPress === AutoCompleteDropdownMenu.keycode.backspace || keyPress === AutoCompleteDropdownMenu.keycode.rightbrace || keyPress === AutoCompleteDropdownMenu.keycode.esc) {
            this.openBrace = false;
            this.selectIndex = -1;
        } else if (this.isOpenBrace(foreText)) {

            this.openBrace = true;
            if (keyPress === AutoCompleteDropdownMenu.keycode.left || keyPress === AutoCompleteDropdownMenu.keycode.right) {
                this.openBrace = false;
            }
        }

        let entityName = this.getCurrentEntity(foreText);

        if (this.openBrace) {

            if (keyPress === AutoCompleteDropdownMenu.keycode.enter) { // enter

                if (this.selectIndex > -1) {

                    let replace = ` { ${this.currentEntityList[this.selectIndex]} } `;
                    let end = foreText.lastIndexOf("{");
                    let pre = foreText.substring(0, end);

                    if (foreText.endsWith(" ")) {
                        pre = pre.substring(0, pre.length - 1);
                    }

                    let after = afterText;
                    let start = this.getRightBraceIndex(after) + 1;
                    after = after.substring(start);

                    let val = (pre + replace + after);

                    //remove double space in string
                    val = val.replace(/\s{2,}/g, " ");

                    this.props.onEntitySelected(val);
                    this.selectIndex = -1;
                    this.openBrace = false;
                    this.isBackFromAutoCompleted = true;
                }
            } else if (keyPress === AutoCompleteDropdownMenu.keycode.down) {
                let listLength = this.currentEntityList.length;
                if (this.selectIndex !== listLength - 1) {
                    this.selectIndex = this.selectIndex + 1;

                    //if selection goes out of bound, adjust base index
                    if (this.selectIndex - this.menuStartIndex === this.maxRows) {
                        this.menuStartIndex = this.menuStartIndex + 1;
                    }
                }
            } else if (keyPress === AutoCompleteDropdownMenu.keycode.up) {

                if (this.selectIndex !== -1) {
                    this.selectIndex = this.selectIndex - 1;

                    //if selection goes out of bound, adjust base index
                    if (this.selectIndex - this.menuStartIndex === -1) {
                        this.menuStartIndex = this.selectIndex === -1 ? 0 : this.selectIndex;
                    }
                }
            }
        }

        let inputTextChanged = targetSelection !== this.preTargetSelection;
        this.preTargetSelection = targetSelection;

        let entityIndex = foreText.lastIndexOf("{");
        let diffMeasureText = foreText;
        if (entityIndex !== -1) {
            diffMeasureText = foreText.substring(0, entityIndex);
        }

        return (
            <div id="autoCompleteDropdownMenu">
                {
                    this.openBrace &&
                    <div className="menu" style={{top: targetHeight, left: 8 + this.textWidth}}>
                        {this.getEntityList(entityName, inputTextChanged)}
                    </div>
                }
                {/*dummy div to measure text width dynamically*/}
                <div className="inputDiv" ref={(element) => this.divRef(element, inputTextChanged)}>{diffMeasureText}</div>
            </div>
        );
    }
}

export default AutoCompleteDropdownMenu;