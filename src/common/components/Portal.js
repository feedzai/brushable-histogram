import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

/**
 * Portal
 *
 * Creates a React Portal to insert a child in a DOM node outside the main DOM hierarchy.
 * The new DOM node is inserted as a child of the body node.
 *
 * @author Nuno Neves (nuno.neves@feedzai.com)
 */

const propTypes = {
    children: PropTypes.element,
    removeOnUnmount: PropTypes.bool
};
const defaultProps = {
    children: null,
    removeOnUnmount: false
};

export default class Portal extends React.PureComponent {
    constructor(props) {
        super(props);

        this.el = document.createElement("div");
    }

    componentDidMount() {
        document.body.appendChild(this.el);
    }

    componentWillUnmount() {
        if (this.props.removeOnUnmount) {
            document.body.removeChild(this.el);
        }
    }

    render() {
        return ReactDOM.createPortal(this.props.children, this.el);
    }
}

Portal.propTypes = propTypes;
Portal.defaultProps = defaultProps;
