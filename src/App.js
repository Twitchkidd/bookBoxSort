import React, { Component } from "react";
import styled from "styled-components";
import htmlColors from "html-colors";
import Global from "./Global";

const eigengrau = "#16161d";

const AppWrapper = styled.div`
  height: 100vh;
  min-width: 100vw;
  width: max-content;
  background: linear-gradient(
    to right,
    ${htmlColors.random()},
    ${htmlColors.random()}
  );
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default class App extends Component {
  state = {
    boxesWithBooks: null
  };
  componentDidMount() {
    const books = [
      { bookNumber: 1, title: "Hornswallop" },
      { bookNumber: 2, title: "Gumthwobble" },
      { bookNumber: 3, title: "Thitwhick" }
    ];
    const boxes = [
      { boxNumber: 1, height: 20 },
      { boxNumber: 2, height: 30 },
      { boxNumber: 3, height: 40 }
    ];
    const boxBoxReducer = (accumulator, currentBook) => {
      let workingAccumulator = accumulator;
      if (!workingAccumulator) {
        workingAccumulator = [];
        workingAccumulator.push({
          boxNumber: boxes[0].boxNumber,
          height: boxes[0].height,
          rows: [
            [
              {
                bookNumber: currentBook.bookNumber,
                title: currentBook.title
              }
            ]
          ]
        });
        console.log("first? workingAccumulator");
        console.log(workingAccumulator);
        return workingAccumulator;
      }
      workingAccumulator[0].rows.push(currentBook);
      console.log("second and third? workingAccumulator");
      console.log(workingAccumulator);
      return workingAccumulator;
    };
    const boxesWithBooks = books.reduce(boxBoxReducer, null);
    this.setState({ boxesWithBooks });
  }
  render() {
    const { boxesWithBooks } = this.state;
    console.log("first and last? boxesWithBooks");
    console.log(boxesWithBooks);
    return (
      <AppWrapper>
        <Global />
        <div>hi</div>
      </AppWrapper>
    );
  }
}
