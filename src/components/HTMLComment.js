/*
  Thank you so much to Alex Zinkevych on StackOverflow for this!
  https://stackoverflow.com/questions/40015336/how-to-render-a-html-comment-in-react

  I called it something else and we do proptypes differently now (16.8.6!)
*/

import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

class ReactComment extends Component {
  static propTypes = {
    text: PropTypes.string,
    trim: PropTypes.bool
  };

  static defaultProps = {
    trim: true
  };

  componentDidMount() {
    let el = ReactDOM.findDOMNode(this);
    ReactDOM.unmountComponentAtNode(el);
    el.outerHTML = this.createComment();
  }

  createComment() {
    let text = this.props.text;

    if (this.props.trim) {
      text = text.trim();
    }

    return `<!-- ${text} -->`;
  }

  render() {
    return <div />;
  }
}

export default ReactComment;

/*
So you can use it like this:

<A>
    <B></B>
    <ReactComment text="<fragment>" />
        <C></C>
        <D></D>
     <ReactComment text="</fragment>" />
    <E></E>
</A>
*/
