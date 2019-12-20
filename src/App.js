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
    const immutableSplice = (arr, start, deleteCount, ...items) =>
      arr
        ? [...arr.slice(0, start), ...items, ...arr.slice(start + deleteCount)]
        : null;
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
      console.log("accumulator");
      console.log(accumulator);
      console.log(currentBook);
      let nextAccumulator = [...accumulator];
      let sorted = false;
      let currentBox = 0;
      let currentRow = 0;
      while (!sorted) {
        const currentBoxNumbers = nextAccumulator
          ? nextAccumulator.map(boxWithBooks => boxWithBooks[0].BoxNumber)
          : [];
        const setOfBoxesForNextBox = currentBoxNumbers
          ? sortedBoxes.filter(
              sortedBox => !currentBoxNumbers.includes(sortedBox.BoxNumber)
            )
          : null;
        const setOfBoxesForNextBoxCheckedForHeightAndDepthAndSortedSoTheShortestIsCheckedFirst = [
          ...setOfBoxesForNextBox
        ]
          .filter(box => box.Height > currentBook.Height)
          .filter(box => box.Width > currentBook.Depth)
          .sort((a, b) => revCmp(a.Height, b.Height));
        const setNextBox = function() {
          nextAccumulator.push([
            {
              ...setOfBoxesForNextBoxCheckedForHeightAndDepthAndSortedSoTheShortestIsCheckedFirst[0],
              rows: [[currentBook], []]
            }
          ]);
        };
        if (!nextAccumulator[0]) {
          setNextBox();
          sorted = true;
          break;
        }
        const workingRow = [...nextAccumulator][currentBox][0].rows[currentRow]
          .concat([currentBook])
          .sort((bookA, bookB) => cmp(bookA.Depth, bookB.Depth));
        const checkHeight = () =>
          nextAccumulator[currentBox]
            ? currentBook.Height <= nextAccumulator[currentBox][0].Height
              ? true
              : false
            : false;
        const checkWidth = () =>
          nextAccumulator[currentBox]
            ? nextAccumulator[currentBox][0].Depth >=
              workingRow.reduce(bookBookReducer, 0)
              ? true
              : false
            : false;
        const indexOfBook = book =>
          workingRow.indexOf(workingBook => workingBook.Title === book.Title);
        const otherRow = nextAccumulator[currentBox][0].rows[1 - currentRow];
        const indexOfOtherBook = (otherBook, otherRow) =>
          otherRow.indexOf(workingOtherBook => workingOtherBook.Title);
        const indexOfAffectedBook = affectedBook =>
          workingRow.indexOf(
            workingAffectedBook =>
              workingAffectedBook.Title === affectedBook.Title
          );
        const affectedBooks = workingRow.filter(
          (book, i) => i >= indexOfBook(currentBook)
        );
        const obxs = (otherBook, otherRow) =>
          currentRow === 0
            ? nextAccumulator[currentBox][0].Depth -
              otherRow
                .filter((book, i) => i < indexOfOtherBook(otherBook, otherRow))
                .reduce(bookBookReducer, 0)
            : otherRow
                .filter((book, i) => i < indexOfOtherBook(otherBook, otherRow))
                .reduce(bookBookReducer, 0);
        const obxe = (otherBook, otherRow) =>
          currentRow === 0
            ? nextAccumulator[currentBox][0].Depth -
              otherRow
                .filter((book, i) => i <= indexOfOtherBook(otherBook, otherRow))
                .reduce(bookBookReducer, 0)
            : otherRow
                .filter((book, i) => i <= indexOfOtherBook(otherBook, otherRow))
                .reduce(bookBookReducer, 0);
        const abxs = affectedBook =>
          currentRow === 1
            ? nextAccumulator[currentBox][0].Depth -
              workingRow
                .filter((book, i) => i < indexOfAffectedBook(affectedBook))
                .reduce(bookBookReducer, 0)
            : workingRow
                .filter((book, i) => i < indexOfAffectedBook(affectedBook))
                .reduce(bookBookReducer, 0);
        const abxe = affectedBook =>
          currentRow === 1
            ? nextAccumulator[currentBox][0].Depth -
              workingRow
                .filter((book, i) => i <= indexOfAffectedBook(affectedBook))
                .reduce(bookBookReducer, 0)
            : workingRow
                .filter((book, i) => i <= indexOfAffectedBook(affectedBook))
                .reduce(bookBookReducer, 0);
        console.log("affectedBooks");
        console.log(affectedBooks);
        console.log("otherRow");
        console.log(otherRow);
        let overlappingBooks;
        let workingOtherOverlappingBooks = [];
        if (typeof otherRow != "undefined") {
          console.log(otherRow);
          overlappingBooks = otherRow.map(otherBook =>
            affectedBooks.filter(affectedBook => {
              if (
                (obxe(otherBook, otherRow) <= abxs(affectedBook) &&
                  obxe(otherBook, otherRow) >= abxe(affectedBook)) ||
                (obxs(otherBook, otherRow) <= abxs(affectedBook) &&
                  obxs(otherBook, otherRow) >= abxe(affectedBook)) ||
                (obxs(otherBook, otherRow) <= abxe(affectedBook) &&
                  obxe(otherBook, otherRow) >= abxs(affectedBook))
              ) {
                workingOtherOverlappingBooks.push([otherBook, affectedBook]);
                return true;
              }
            })
          );
        }
        let conflicts;
        if (typeof workingOtherOverlappingBooks != "undefined") {
          console.log("workingOtherOverlappingBooks");
          console.log(workingOtherOverlappingBooks);
          conflicts = workingOtherOverlappingBooks.filter(
            otherBookAffectedBookArray =>
              otherBookAffectedBookArray[0].Depth +
                otherBookAffectedBookArray[1].Depth >
              nextAccumulator[currentBox][0].Width
          );
        }
        console.log("conflicts");
        console.log(conflicts);
        const checkDepth = () =>
          currentBook.Depth < nextAccumulator[currentBox][0].Width &&
          !conflicts;
        if (checkHeight()) {
          console.log("passed Height");
          if (checkWidth()) {
            console.log("passed Width");
            if (checkDepth()) {
              console.log("passed Depth");
              nextAccumulator[currentBox][0].rows[currentRow] = workingRow;
              sorted = true;
              break;
            } else {
              console.log("failed Depth");
              if (currentRow === 0 && nextAccumulator[currentBox][0].rows[1]) {
                ++currentRow;
              } else {
                currentRow = 0;
                if (nextAccumulator[currentBox + 1]) {
                  ++currentBox;
                } else {
                  setNextBox();
                  sorted = true;
                  break;
                }
              }
            }
          } else {
            console.log("failed Width");
            if (currentRow === 0 && nextAccumulator[currentBox][0].rows[1]) {
              ++currentRow;
            } else {
              currentRow = 0;
              if (nextAccumulator[currentBox + 1]) {
                ++currentBox;
              } else {
                setNextBox();
                sorted = true;
                break;
              }
            }
          }
        } else {
          if (nextAccumulator[currentBox + 1]) {
            ++currentBox;
          } else {
            setNextBox();
            sorted = true;
            break;
          }
        }
      }
      console.log("nextAccumulator at the end");
      console.log(nextAccumulator);
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
                height={box[0].Width}
                width={box[0].Depth}
                key={i}
                className={"Box"}>
                {box[0].rows.map((row, j) =>
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
