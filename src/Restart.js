import React from 'react';

class Restart extends React.Component {
    render() {
        return (
            <button className="restart" onClick={this.props.onClick}>
            </button>
        );
    }
}

export default Restart;