import React from 'react';

class Square extends React.Component {
    render() {
        let nombre = "square";
        if(this.props.value==="#")
             nombre += " squarePintado";
        return (
            <button className={nombre} onClick={this.props.onClick}>
                {this.props.value !== '_' ? this.props.value : null}
            </button>
        );
    }
}

export default Square;