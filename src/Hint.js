import React from 'react';

class Hint extends React.Component {
    render() {
        return (
            <button className="hint" onClick={this.props.onClick}>
            </button>
        );
    }
}

export default Hint;