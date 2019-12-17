import React, { Component } from "react";
import styled from "styled-components";
import htmlColors from "html-colors";
import Global from "./Global";
import { boxes, catalog } from "./data";

const eigengrau = "#16161d";

const AppWrapper = styled.div`
  height: 100%;
  min-height: 100vh;
  width: max-content;
  min-width: 100vw;
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
  position: relative;
`;

const Row = styled.div`
  position: ${props => (props.width ? `absolute` : `static`)};
  float: ${props => (props.width ? `left` : null)};
  top: ${props => (props.width ? null : 0)};
  left: ${props => (props.width ? `${props.width * 10}px` : 0)};
  height: 100%;
  display: flex;
  flex-direction: ${props => (props.which === "first" ? `row` : `row-reverse`)};
  align-items: ${props =>
    props.which === "first" ? `flex-end` : `flex-start`};
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
    let currentBox = 0;
    let currentRow = 0;
    const boxBoxReducer = (accumulator, currentBook) => {
      let workingAccumulator = accumulator;
      // INIT WITH FIRST BOOK AND BOX, I KNOW IT WORKS, I'M CHEATING, IT'S OKAY
      if (!workingAccumulator) {
        workingAccumulator = [];
        workingAccumulator.push({
          BoxNumber: sortedBoxes[0].BoxNumber,
          Height: sortedBoxes[0].Height,
          Width: sortedBoxes[0].Width,
          Depth: sortedBoxes[0].Depth,
          rows: [
            [
              {
                By: currentBook.By,
                Title: currentBook.Title,
                FictionOrNon: currentBook.FictionOrNon,
                Subjects: currentBook.Subjects,
                Height: currentBook.Height,
                Width: currentBook.Width,
                Depth: currentBook.Depth,
                Shelf: currentBook.Shelf,
                From: currentBook.From,
                Scans: currentBook.Scans,
                BackedUp: currentBook.BackedUp,
                CroppedP2: currentBook.CroppedP2,
                Notes: currentBook.Notes
              }
            ]
          ]
        });
        return workingAccumulator;
      }
      let sorted = false;
      while (sorted === false) {
        // IF THERE'S WIDTH IN THE ROW
        let workingRow = workingAccumulator[currentBox].rows[currentRow].map(
          book => book
        );
        // This ... has some funny math behaviour ...
        if (
          currentBook.Width <=
          workingAccumulator[currentBox].Width -
            workingAccumulator[currentBox].rows[currentRow].reduce(
              booksWidthAccumulator,
              0
            )
        ) {
          workingRow.push(currentBook);
          workingRow.sort((bookA, bookB) => cmp(bookA.Depth, bookB.Depth));
          let blockage = false;
          workingRow.forEach((book, bookIndex) => {
            // IF THERE'S ANOTHER ROW CHECK FOR BLOCKAGE
            if (workingAccumulator[currentBox].rows[1]) {
              debugger;
              let rowUpToBook = workingRow.slice(0, bookIndex);
              let bookStartX = rowUpToBook.reduce(booksWidthAccumulator, 0);
              let bookEndX = bookStartX + book.Width;
              workingAccumulator[currentBox].rows[1].forEach(
                (otherBook, otherBookIndex) => {
                  let otherRowUpToOtherBook = workingAccumulator[
                    currentBox
                  ].rows[1].slice(0, otherBookIndex);
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
              // ALSO CHECK IF THE BOX IS DEEP ENOUGH
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
            if (!workingAccumulator[currentBox]) {
              workingAccumulator.push({
                BoxNumber: sortedBoxes[currentBox].BoxNumber,
                Height: sortedBoxes[currentBox].Height,
                Width: sortedBoxes[currentBox].Width,
                Depth: sortedBoxes[currentBox].Depth,
                rows: [[]]
              });
              break;
            }
            break;
          }
        } else {
          if (
            currentRow === 0 &&
            workingAccumulator[currentBox].rows.length === 2
          ) {
            currentRow++;
            workingRow = workingAccumulator[currentBox].rows[currentRow];
            break;
          } else if (currentRow === 0) {
            workingAccumulator[currentBox].rows.push([]);
            currentRow++;
            break;
          } else {
            currentBox++;
            currentRow = 0;
            if (!workingAccumulator[currentBox]) {
              workingAccumulator.push({
                BoxNumber: sortedBoxes[currentBox].BoxNumber,
                Height: sortedBoxes[currentBox].Height,
                Width: sortedBoxes[currentBox].Width,
                Depth: sortedBoxes[currentBox].Depth,
                rows: [[]]
              });
            }
            workingRow = workingAccumulator[currentBox].rows[0];
            break;
          }
        }
        workingAccumulator[currentBox].rows[currentRow] = workingRow;
        sorted = true;
      }
      return workingAccumulator;
    };
    const boxesWithBooks = sortedBooks.reduce(boxBoxReducer, null);
    const fullBoxesWithBooks = boxesWithBooks.filter(box => {
      if (box.rows[0][0]) {
        return box;
      }
    });
    this.setState({ boxesWithBooks: fullBoxesWithBooks });
  }
  render() {
    const { boxesWithBooks } = this.state;
    console.log(boxesWithBooks);
    return (
      <AppWrapper>
        <Global />
        {boxesWithBooks
          ? boxesWithBooks.map((box, i) => {
              return (
                <Box height={box.Width} width={box.Depth} key={i}>
                  {box.rows.map((row, j) => {
                    if (j === 0) {
                      return (
                        <Row which='first' key={j}>
                          {row.map((book, k) => {
                            return (
                              <Book
                                height={book.Depth}
                                width={book.Width}
                                color={htmlColors.random()}
                                key={k}
                              />
                            );
                          })}
                        </Row>
                      );
                    }
                    if (j === 1) {
                      return (
                        <Row
                          which='second'
                          width={
                            box.Width -
                            row.reduce(
                              (accumulator, currentBook) =>
                                accumulator + currentBook.Width,
                              0
                            )
                          }
                          key={j}>
                          {row.map((book, k) => {
                            return (
                              <Book
                                height={book.Depth}
                                width={book.Width}
                                color={htmlColors.random()}
                                key={k}
                              />
                            );
                          })}
                        </Row>
                      );
                    }
                  })}
                </Box>
              );
            })
          : null}
      </AppWrapper>
    );
  }
}
