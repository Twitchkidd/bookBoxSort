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
  background: ${props => props.color};
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
      console.log("currentBook");
      console.log(currentBook);

      let currentBox = 0;
      let currentRow = 0;

      const currentBoxNumbers = accumulator
        ? accumulator.map(boxWithBooks => boxWithBooks.BoxNumber)
        : [];

      const setOfBoxesForNextBox = currentBoxNumbers
        ? sortedBoxes.filter(
            sortedBox => !currentBoxNumbers.includes(sortedBox.BoxNumber)
          )
        : null;

      const setOfBoxesForNextBoxCheckedForHeightAndDepthAndSortedSoTheShortestIsCheckedFirst = setOfBoxesForNextBox
        .filter(box => box.Height > currentBook.Height)
        .filter(box => box.Width > currentBook.Depth)
        .sort((a, b) => revCmp(a.Height, b.Height));

      const setNextBox = () => {
        accumulator.push({
          ...setOfBoxesForNextBoxCheckedForHeightAndDepthAndSortedSoTheShortestIsCheckedFirst[0],
          rows: [[]]
        });
        currentRow = 0;
        if (accumulator[0].rows[0][0]) {
          currentBox++;
        }
      };

      if (!accumulator[0]) setNextBox();

      const workingRow = immutableSplice(
        accumulator[currentBox].rows[currentRow],
        0,
        0,
        {
          ...currentBook
        }
      ).map((bookA, bookB) => cmp(bookA.Depth, bookB.Depth));

      const indexOfBook = book =>
        workingRow.indexOf(workingBook => workingBook.Title === book.Title);

      const indexOfOtherBook = (otherBook, otherRow) =>
        otherRow.indexOf(workingOtherBook => workingOtherBook.Title);

      const indexOfAffectedBook = affectedBook =>
        workingRow.indexOf(
          workingAffectedBook =>
            workingAffectedBook.Title === affectedBook.Title
        );

      const affectedBooks = workingRow
        ? workingRow.filter((book, i) => i >= indexOfBook(currentBook))
        : null;

      const checkHeight = () =>
        accumulator[currentBox]
          ? currentBook.Height <= accumulator[currentBox].Height
            ? true
            : false
          : currentBook.Height <=
            setOfBoxesForNextBoxCheckedForHeightAndDepthAndSortedSoTheShortestIsCheckedFirst[0]
              .Height
          ? true
          : false;

      const checkWidth = () =>
        accumulator[currentBox]
          ? (workingRow &&
              accumulator[currentBox].Depth >=
                workingRow.reduce(bookBookReducer, 0)) ||
            currentBook.Width < accumulator[currentBox].Depth
            ? true
            : false
          : true;

      const obxs = (otherBook, otherRow) =>
        currentRow === 0
          ? accumulator[currentBox].Depth -
            otherRow
              .filter((book, i) => i < indexOfOtherBook(otherBook, otherRow))
              .reduce(bookBookReducer, 0)
          : otherRow
              .filter((book, i) => i < indexOfOtherBook(otherBook, otherRow))
              .reduce(bookBookReducer, 0);
      const obxe = (otherBook, otherRow) =>
        currentRow === 0
          ? accumulator[currentBox].Depth -
            otherRow
              .filter((book, i) => i <= indexOfOtherBook(otherBook, otherRow))
              .reduce(bookBookReducer, 0)
          : otherRow
              .filter((book, i) => i <= indexOfOtherBook(otherBook, otherRow))
              .reduce(bookBookReducer, 0);
      const abxs = affectedBook =>
        currentRow === 1
          ? accumulator[currentBox].Depth -
            workingRow
              .filter((book, i) => i < indexOfAffectedBook(affectedBook))
              .reduce(bookBookReducer, 0)
          : workingRow
              .filter((book, i) => i < indexOfAffectedBook(affectedBook))
              .reduce(bookBookReducer, 0);
      const abxe = affectedBook =>
        currentRow === 1
          ? accumulator[currentBox].Depth -
            workingRow
              .filter((book, i) => i <= indexOfAffectedBook(affectedBook))
              .reduce(bookBookReducer, 0)
          : workingRow
              .filter((book, i) => i <= indexOfAffectedBook(affectedBook))
              .reduce(bookBookReducer, 0);

      const otherRow = accumulator[currentBox]
        ? accumulator[currentBox].rows[1 - currentRow]
        : null;

      const overlappingBooks = affectedBooks
        ? affectedBooks.map(affectedBook =>
            otherRow
              ? otherRow.map(otherBook =>
                  (obxe(otherBook, otherRow) <= abxs(affectedBook) &&
                    obxe(otherBook, otherRow) >= abxe(affectedBook)) ||
                  (obxs(otherBook, otherRow) <= abxs(affectedBook) &&
                    obxs(otherBook, otherRow) >= abxe(affectedBook)) ||
                  (obxs(otherBook, otherRow) <= abxe(affectedBook) &&
                    obxe(otherBook, otherRow) >= abxs(affectedBook))
                    ? [otherBook, affectedBook]
                    : null
                )
              : null
          )
        : null;

      const conflicts = overlappingBooks[0]
        ? overlappingBooks.filter(
            otherBookAffectedBookArray =>
              otherBookAffectedBookArray[0].Depth +
                otherBookAffectedBookArray[1].Depth >
              accumulator[currentBox].Width
          )
        : null;

      const checkDepth = () =>
        accumulator[currentBox]
          ? currentBook.Depth < accumulator[currentBox].Width && !conflicts
            ? true
            : false
          : true;

      let sorted = false;

      while (!sorted) {
        if (checkHeight()) {
          if (checkWidth()) {
            if (checkDepth()) {
              sorted = true;
            } else {
              if (currentRow === 0 && accumulator[currentBox].rows[1]) {
                currentRow++;
              } else {
                currentRow = 0;
                if (accumulator[currentBox + 1]) {
                  currentBox++;
                } else {
                  sorted = true;
                  setNextBox();
                }
              }
            }
          } else {
            if (currentRow === 0 && accumulator[currentBox].rows[1]) {
              currentRow++;
            } else {
              currentRow = 0;
              if (accumulator[currentBox + 1]) {
                currentBox++;
              } else {
                sorted = true;
                setNextBox();
              }
            }
          }
        } else {
          if (accumulator[currentBox + 1]) {
            currentBox++;
          } else {
            setNextBox();
          }
        }
      }

      let nextAccumulator = [...accumulator];

      nextAccumulator[currentBox].rows[currentRow] = immutableSplice(
        nextAccumulator[currentBox].rows[currentRow],
        0,
        0,
        currentBook
      ).sort((bookA, bookB) => cmp(bookA.Depth, bookB.Depth));

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
