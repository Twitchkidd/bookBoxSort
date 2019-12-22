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

const RowWrapper = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const Row = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: ${props => (props.left ? `row-reverse` : `row`)};
  align-items: ${props => (props.left ? `flex-start` : `flex-end`)};
`;

const Book = styled.div.attrs(props => ({
  style: { background: props.color }
}))`
  height: ${props => `${props.height * 10}px`};
  width: ${props => `${props.width * 10}px`};
  border: 1px solid ${eigengrau};
`;

export default class App extends Component {
  state = {
    boxesWithBooks: null
  };
  componentDidMount() {
    const cmp = (a, b) => (a < b) - (a > b);
    const revCmp = (a, b) => (a > b) - (a < b);
    const sortedBooks = [...catalog].sort(
      (a, b) =>
        cmp(a.Height, b.Height) ||
        cmp(a.Width, b.Width) ||
        cmp(a.Depth, b.Depth)
    );
    const inchesToCm = inches => inches * 2.54;
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
    const bookBookReducer = (accumulator, currentBook) =>
      accumulator + currentBook.Width;
    const bookBoxReducer = (accumulator, currentBook) => {
      // console.log("accumulator");
      // console.log(accumulator);
      console.log("currentBook");
      console.log(currentBook);
      let nextAccumulator = [...accumulator];
      let sorted = false;
      let currentBox = 0;
      let currentRow = 0;
      function init() {
        if (nextAccumulator.length === 0) {
          const initialNextBoxes = sortedBoxes
            .filter(box => box.Height > currentBook.Height)
            .filter(box => box.Width > currentBook.Depth)
            .sort((a, b) => revCmp(a.Height, b.Height));
          nextAccumulator = [{ ...initialNextBoxes[0], rows: [[], []] }];
        }
      }
      init();
      while (!sorted) {
        function setNextBox() {
          const currentBoxNumbers = nextAccumulator.map(
            boxWithBooks => boxWithBooks.BoxNumber
          );
          const setOfBoxesForNextBox = sortedBoxes.filter(
            sortedBox => !currentBoxNumbers.includes(sortedBox.BoxNumber)
          );
          const setOfBoxesForNextBoxCheckedForHeightAndDepthAndSortedSoTheShortestIsCheckedFirst = setOfBoxesForNextBox
            .filter(box => box.Height > currentBook.Height)
            .filter(box => box.Width > currentBook.Depth)
            .sort((a, b) => revCmp(a.Height, b.Height));
          const nextBox =
            setOfBoxesForNextBoxCheckedForHeightAndDepthAndSortedSoTheShortestIsCheckedFirst[0];
          nextAccumulator = [...nextAccumulator].concat({
            ...nextBox,
            rows: [[], []]
          });
        }
        const checkHeight = () =>
          currentBook.Height <= nextAccumulator[currentBox].Height
            ? true
            : false;
        const workingRow =
          nextAccumulator[currentBox].rows[currentRow].length !== 0
            ? [...nextAccumulator][currentBox].rows[currentRow]
                .concat(currentBook)
                .sort((bookA, bookB) => cmp(bookA.Depth, bookB.Depth))
            : [currentBook];
        const checkWidth = () =>
          nextAccumulator[currentBox].Depth >=
          workingRow.reduce(bookBookReducer, 0)
            ? true
            : false;
        const otherRow = nextAccumulator[currentBox].rows[1 - currentRow];
        const indexOfBook = book =>
          workingRow.indexOf(workingBook => workingBook.Title === book.Title);
        const affectedBooks =
          workingRow.length !== 1
            ? workingRow.filter((book, i) => i >= indexOfBook(currentBook))
            : workingRow;
        const indexOfOtherBook = (otherBook, otherRow) =>
          otherRow.indexOf(
            workingOtherBook => workingOtherBook.Title === otherBook.Title
          );
        const bxs = book =>
          currentRow === 0
            ? workingRow
                .filter((workingBook, i) => i < indexOfBook(book))
                .reduce(bookBookReducer, 0)
            : nextAccumulator[currentBox].Depth -
              workingRow
                .filter((workingBook, i) => i < indexOfBook(book))
                .reduce(bookBookReducer, 0);
        const bxe = book =>
          currentRow === 0
            ? workingRow
                .filter((workingBook, i) => i <= indexOfBook(book))
                .reduce(bookBookReducer, 0)
            : nextAccumulator[currentBox].Depth -
              workingRow
                .filter((workingBook, i) => i <= indexOfBook(book))
                .reduce(bookBookReducer, 0);
        const obxs = (otherBook, otherRow) =>
          currentRow === 0
            ? nextAccumulator[currentBox].Depth -
              otherRow
                .filter(
                  (workingBook, i) => i < indexOfOtherBook(otherBook, otherRow)
                )
                .reduce(bookBookReducer, 0)
            : otherRow
                .filter(
                  (workingBook, i) => i < indexOfOtherBook(otherBook, otherRow)
                )
                .reduce(bookBookReducer, 0);
        const obxe = (otherBook, otherRow) =>
          currentRow === 0
            ? nextAccumulator[currentBox].Depth -
              otherRow
                .filter(
                  (workingBook, i) => i <= indexOfOtherBook(otherBook, otherRow)
                )
                .reduce(bookBookReducer, 0)
            : otherRow
                .filter(
                  (workingBook, i) => i <= indexOfOtherBook(otherBook, otherRow)
                )
                .reduce(bookBookReducer, 0);
        // debugger;
        const conflicts = otherRow.map(otherBook =>
          affectedBooks.filter(possiblyNowConflictedBook =>
            (obxe(otherBook, otherRow) <= bxs(possiblyNowConflictedBook) &&
              obxe(otherBook, otherRow) >= bxe(possiblyNowConflictedBook)) ||
            (obxs(otherBook, otherRow) <= bxs(possiblyNowConflictedBook) &&
              obxs(otherBook, otherRow) >= bxe(possiblyNowConflictedBook)) ||
            (obxs(otherBook, otherRow) <= bxe(possiblyNowConflictedBook) &&
              obxe(otherBook, otherRow) >= bxs(possiblyNowConflictedBook))
              ? true
              : false
          )
        );
        const emptiedConflicts = conflicts.filter(array => array.length);
        const checkDepth = () => {
          const bookFits =
            currentBook.Depth < nextAccumulator[currentBox].Width;
          const noConflicts = emptiedConflicts.length === 0;
          if (bookFits && noConflicts) {
            console.log("Depth pass");
            console.log(conflicts);
            console.log(emptiedConflicts);
            console.log(bookFits);
            console.log(noConflicts);
            return true;
          } else {
            console.log("Depth fail");
            console.log(conflicts);
            console.log(emptiedConflicts);
            console.log(bookFits);
            console.log(noConflicts);
            return false;
          }
        };
        function sortBook() {
          const nextRow = [...nextAccumulator][currentBox].rows[currentRow]
            .concat(currentBook)
            .sort((bookA, bookB) => cmp(bookA.Depth, bookB.Depth));
          nextAccumulator[currentBox].rows[currentRow] = nextRow;
        }
        function checkBook() {
          const nextAction = checkHeight()
            ? checkWidth()
              ? checkDepth()
                ? "Sort book, please!"
                : nextAccumulator[currentBox].rows[currentRow + 1]
                ? "Try next row, please!"
                : nextAccumulator[currentBox + 1]
                ? "Try next box, please!"
                : "Next box, please!"
              : nextAccumulator[currentBox].rows[currentRow + 1]
              ? "Try next row, please!"
              : nextAccumulator[currentBox + 1]
              ? "Try next box, please!"
              : "Next box, please!"
            : nextAccumulator[currentBox + 1]
            ? "Try next box, please!"
            : "Next box, please!";
          switch (nextAction) {
            case "Try next box, please!":
              currentBox++;
              currentRow = 0;
              break;
            case "Try next row, please!":
              currentRow++;
              break;
            case "Next box, please!":
              setNextBox();
              currentBox++;
              currentRow = 0;
              break;
            case "Sort book, please!":
              sortBook();
              currentBox++;
              currentRow = 0;
              sorted = true;
              break;
            default:
              console.error("Error in switch statement!");
          }
        }
        checkBook();
      }
      return nextAccumulator;
    };
    const boxesWithBooks = sortedBooks.reduce(bookBoxReducer, []);
    this.setState({ boxesWithBooks });
  }
  render() {
    const { boxesWithBooks } = this.state;
    return (
      <AppWrapper className={"AppWrapper"}>
        <Global />
        {boxesWithBooks
          ? boxesWithBooks.map((box, i) => (
              <Box
                height={box.Width}
                width={box.Depth}
                key={i}
                className={"Box"}>
                {box.rows.map((row, j) =>
                  j ? (
                    <RowWrapper key={j} className={"RowWrapper"}>
                      <Row left={true} className={"Row"}>
                        {row.map((book, k) => {
                          return (
                            <Book
                              height={book.Depth}
                              width={book.Width}
                              color={htmlColors.random()}
                              key={k}
                              className={"Book"}
                            />
                          );
                        })}
                      </Row>
                    </RowWrapper>
                  ) : (
                    <RowWrapper key={j} className={"RowWrapper"}>
                      <Row className={"Row"}>
                        {row.map((book, k) => {
                          return (
                            <Book
                              height={book.Depth}
                              width={book.Width}
                              color={htmlColors.random()}
                              key={k}
                              className={"Book"}
                            />
                          );
                        })}
                      </Row>
                    </RowWrapper>
                  )
                )}
              </Box>
            ))
          : null}
      </AppWrapper>
    );
  }
}
