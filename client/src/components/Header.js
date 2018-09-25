import React, {Component} from 'react';
import {connect} from 'react-redux';
import "./header.css";

class Header extends Component {

    render() {
        return (
            <div id="header">
                <div className="title"> React Component Gallery</div>
            </div>

        );
    }
}

function mapStateToProps({auth}) {
    return {auth};
}

export default connect(mapStateToProps)(Header);
