import React from 'react';

class Mode extends React.Component {
    render() {
        let nombre = "mode";
        if (this.props.value === "#"){
            nombre+= " pintar";
        }
        return (
            <button className={nombre} onClick={this.props.onClick}>
            </button>
        );
    }
}

export default Mode;