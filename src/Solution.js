import React from 'react';

class Solution extends React.Component {
    render() {
        return (
            <button className="solution" onClick={this.props.onClick}>
                Mostrar solucion
            </button>
        );
    }
}

export default Solution;