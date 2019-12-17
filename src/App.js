import React, { Component } from "react";
import styled from "styled-components";
import htmlColors from "html-colors";
import Global from "./Global";
import { boxes, catalog } from "./data";

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

const Box = styled.div`
  height: ${props => `${Math.round(props.height * 10)}px`};
  width: ${props => `${Math.round(props.width * 10)}px`};
  border: 2px solid ${eigengrau};
  margin: 4px;
  display: flex;
  align-items: flex-end;
`;

const Book = styled.div`
  height: ${props => `${props.height * 10}px`};
  width: ${props => `${props.width * 10}px`};
  background: ${props => props.color};
  border: 1px solid ${eigengrau};
`;

export default class App extends Component {
  state = {
    boxesWithBooks: null
  };
  selectNextBox = ({ book, sortedBoxes }) => {
    let indexOfNextBox = null;
    for (let i = 0; indexOfNextBox === null; i++) {
      if (book.Height <= sortedBoxes[i].Height) {
        indexOfNextBox = i;
      }
    }
    return indexOfNextBox;
  };
  componentDidMount() {
    const cmp = (a, b) => (a < b) - (a > b);
    const inchesToCm = inches => inches * 2.54;
    const booksWidthAccumulator = (accumulator, currentBook) =>
      accumulator + currentBook.Width;
    const sortedBooks = [...catalog].sort(
      (a, b) =>
        cmp(a.Height, b.Height) ||
        cmp(a.Width, b.Width) ||
        cmp(a.Depth, b.Depth)
    );
    const boxesWithDimensions = boxes.filter(box =>
      box.Width !== "TODO" ? true : false
    );
    const boxesWithDimensionInCm = boxesWithDimensions.map(box => ({
      ...box,
      Height: inchesToCm(box.Height),
      Width: inchesToCm(box.Width),
      Depth: inchesToCm(box.Depth)
    }));
    const boxesWithinWeight = boxesWithDimensionInCm.filter(box => {
      let boxVolume = box.Height * box.Width * box.Depth;
      if (boxVolume <= 27733333 * 0.8) {
        return true;
      } else {
        return false;
      }
    });
    const sortedBoxes = [...boxesWithinWeight].sort(
      (a, b) =>
        cmp(a.Height, b.Height) ||
        cmp(a.Width, b.Width) ||
        cmp(a.Depth, b.Depth)
    );
    const boxBoxReducer = (accumulator, currentBook) => {
      // Okay, so the idea was to go through each book and
      // add it into this boxesWithBooks object, which we're
      // immediately making a copy of to mutate, which is
      // probably like not how to set myself up for functional
      // code, mais c'est la vie. ¯\_(ツ)_/¯
      let workingAccumulator = accumulator;
      if (!workingAccumulator) {
        workingAccumulator = [];
        workingAccumulator.push({
          ...sortedBoxes[0],
          rows: [[{ ...currentBook }]]
        });
        return workingAccumulator;
      }
      let sorted = false;
      let currentBox = 0;
      let currentRow = 0;
      let currentPosition = 0;
      let workingRow = workingAccumulator[0].rows[0];
      while (sorted === false) {
        if (
          currentBook.Width <=
          Math.round(workingAccumulator[currentBox].Width * 10) -
            workingAccumulator[currentBox].rows[currentRow].reduce(
              booksWidthAccumulator,
              0
            )
        ) {
          workingRow.forEach(book => {
            if (currentBook.Depth < book.Depth) {
              currentPosition++;
            }
          });
          workingRow.splice(currentPosition, 0, currentBook);
          let blockage = false;
          workingRow.forEach(book => {
            if (workingAccumulator[currentBox].rows[currentRow + 1]) {
              let rowUpToBook = workingRow.slice(0, currentPosition);
              let bookStartX = rowUpToBook.reduce(booksWidthAccumulator, 0);
              let bookEndX = bookStartX + book.Width;
              workingAccumulator[currentBox].rows[currentRow + 1].forEach(
                (otherBook, otherBookIndex) => {
                  let otherRowUpToOtherBook = workingAccumulator[
                    currentBox
                  ].rows[currentRow + 1].slice(0, otherBookIndex);
                  let otherBookStartX =
                    workingAccumulator[currentBox].Depth -
                    otherRowUpToOtherBook.reduce(booksWidthAccumulator, 0);
                  let otherBookEndX =
                    workingAccumulator[currentBox].Depth -
                    (otherRowUpToOtherBook.reduce(booksWidthAccumulator, 0) +
                      otherBook.Width);
                  if (
                    otherBookStartX > bookStartX ||
                    otherBookStartX < bookEndX ||
                    otherBookEndX > bookStartX ||
                    otherBookEndX < bookEndX
                  ) {
                    if (
                      book.Height + otherBook.Height >
                      workingAccumulator[currentBox].Width
                    ) {
                      blockage = true;
                    }
                  }
                }
              );
            } else if (
              currentBook.Depth > workingAccumulator[currentBox].Width
            ) {
              blockage = true;
            }
          });
          if (!blockage) {
            workingAccumulator[currentBox].rows[currentRow] = workingRow;
          } else {
            currentBox++;
            currentRow = 0;
            currentPosition = 0;
            if (!workingAccumulator[currentBox]) {
              workingAccumulator.push({
                ...sortedBoxes[currentBox],
                rows: [[]]
              });
            }
            workingRow = workingAccumulator[currentBox].rows[0];
            break;
          }
        } else {
          if (
            currentRow === 0 &&
            workingAccumulator[currentBox].rows.length === 2
          ) {
            currentRow++;
            currentPosition = 0;
            workingRow = workingAccumulator[currentBox].rows[currentRow];
            break;
          } else if (currentRow === 0) {
            workingAccumulator[currentBox].rows.push([]);
            currentRow++;
            currentPosition = 0;
            break;
          } else {
            currentBox++;
            currentRow = 0;
            currentPosition = 0;
            if (!workingAccumulator[currentBox]) {
              workingAccumulator.push({
                ...sortedBoxes[currentBox],
                rows: [[]]
              });
            }
            workingRow = workingAccumulator[currentBox].rows[0];
            break;
          }
        }
        sorted = true;
      }
      return workingAccumulator;
    };
    const boxesWithBooks = sortedBooks.reduce(boxBoxReducer, null);
    this.setState({ boxesWithBooks });
  }
  render() {
    const { boxesWithBooks } = this.state;
    return (
      <AppWrapper>
        <Global />
        {boxesWithBooks
          ? boxesWithBooks.map((box, i) => {
              return (
                <Box height={box.Width} width={box.Depth} key={i}>
                  {box.rows.map(row => {
                    return row.map((book, j) => {
                      return (
                        <Book
                          height={book.Depth}
                          width={book.Width}
                          color={htmlColors.random()}
                          key={j}
                        />
                      );
                    });
                  })}
                </Box>
              );
            })
          : null}
      </AppWrapper>
    );
  }
}
