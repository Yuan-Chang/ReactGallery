import React, {Component} from "react";
import "./Demo.css";
import "./AutoCompleteTextField/AutoCompleteTextField"
import AutoCompleteTextField from "./AutoCompleteTextField/AutoCompleteTextField";

class Demo extends Component{
    render() {
        return (
            <div id="demo">
                <div className="title">Auto Complete TextField</div>
                <div className="line"></div>
                <div className="component">
                    <AutoCompleteTextField style={{width:500}} getDataFunc={(callback)=>{
                        callback(["Anthony","Tom","Annie","Tommy","Sherry","Steven","Daniel"]);
                    }}/>
                </div>
            </div>
        );
    }
}

export default Demo;
