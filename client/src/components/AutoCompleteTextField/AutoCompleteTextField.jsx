import React, {Component} from "react";
import "./autoCompleteTextFieldStyles.css";
import PropTypes from "prop-types";
import AutoCompleteDropdownMenu from "./AutoCompleteDropdownMenu";

class AutoCompleteTextField extends Component {

    static propTypes = {
        getDataFunc: PropTypes.func.isRequired
    };

    static defaultProps = {
        //We are expecting a func with callback arg.
        getDataFunc: (callback) => {
            callback([]);
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            inputValue: "",
            target: null,
            keyPress: -1
        };
    }

    onChange(event) {

        if (this.props.onChange) {
            this.props.onChange(event);
        }

        let val = event.target.value;
        this.setState({
            inputValue: val,
            target: event.target
        });
    }

    onKeyDown(event) {
        if (event.keyCode === AutoCompleteDropdownMenu.keycode.up || event.keyCode === AutoCompleteDropdownMenu.keycode.down) {
            // Stop the up and down arrow default behavior, prevent cursor back to beginning.
            event.preventDefault();
        }

        this.setState({
            keyPress: event.keyCode
        });
    }

    onEntitySelected(newInput) {

        this.setState({
            inputValue: newInput
        });
    }

    render() {

        return (
            <div id="customTextField">
                <AutoCompleteDropdownMenu input={this.state.inputValue} target={this.state.target}
                                          keyPress={this.state.keyPress}
                                          onEntitySelected={this.onEntitySelected.bind(this)}
                                          getDataFunc={this.props.getDataFunc}
                />
                <input {...this.props} onChange={(event) => this.onChange(event)}
                           onKeyDown={(event) => this.onKeyDown(event)} value={this.state.inputValue}/>
            </div>
        );
    }
}

export default AutoCompleteTextField;