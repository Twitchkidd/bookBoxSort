import React, { Component, Fragment } from "react";
import styled from "styled-components";
import Global from "./Global";
import HTMLComment from './components/HTMLComment';
import ReactTooltip from "react-tooltip";
import { boxes, catalog } from "./data";
import htmlColors from "html-colors";
import { storageAvailable } from "./utils/storageAvailable";

const eigengrau = "#16161d";

const AppWrapper = styled.div`
  height: 100%;
  min-height: 100vh;
  width: 100vw;
  background-image: linear-gradient(to right, #C1357E 0%, #C1357E 40%, #675997 40%, #675997 60%, #0655A9 60%, #0655A9 100%);
  padding: 20px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
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
  flex-direction: ${props => (props.left ? `row` : `row-reverse`)};
  align-items: ${props => (props.left ? `flex-end` : `flex-start`)};
`;

const Book = styled.div.attrs(props => ({
  style: { background: props.color }
}))`
  height: ${props => `${props.height * 10}px`};
  width: ${props => `${props.width * 10}px`};
  z-index: 99;
`;

export default class App extends Component {
  state = {
    boxesWithBooks: null,
    totalBoxes: null
  };
  componentDidMount() {
    let localStorageAvailable = false;
    let cached = false;
    let cachedBoxesWithBooks = [];
    if (storageAvailable("localStorage")) {
      localStorageAvailable = true;
      if (localStorage.getItem("data")) {
        cached = true;
        cachedBoxesWithBooks = JSON.parse(localStorage.getItem("data"));
      } else {
        console.log("no cache");
      }
    } else {
      console.log("no local storage");
    }
    if (!cached) {
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
          const workingRow = nextAccumulator[currentBox].rows[currentRow]
            .concat(currentBook)
            .sort((bookA, bookB) => cmp(bookA.Depth, bookB.Depth));
          const checkWidth = () =>
            nextAccumulator[currentBox].Depth >=
            workingRow.reduce(bookBookReducer, 0)
              ? true
              : false;
          const otherRow = nextAccumulator[currentBox].rows[1 - currentRow];
          let affectedBooks = [];
          if (workingRow.length === 1) {
            affectedBooks = workingRow;
          } else if (
            workingRow.indexOf(currentBook) ===
            workingRow.length - 1
          ) {
            affectedBooks = [currentBook];
          } else {
            affectedBooks = workingRow.filter(
              (book, i) => i >= workingRow.indexOf(currentBook)
            );
          }
          const bxs = (book, row) =>
            nextAccumulator[currentBox].rows.indexOf(row) === 0 ||
            (row === workingRow && currentRow === 0)
              ? row
                  .filter((workingBook, i) => i < row.indexOf(book))
                  .reduce(bookBookReducer, 0)
              : nextAccumulator[currentBox].Depth -
                row
                  .filter((workingBook, i) => i < row.indexOf(book))
                  .reduce(bookBookReducer, 0);
          const bxe = (book, row) =>
            nextAccumulator[currentBox].rows.indexOf(row) === 0 ||
            (row === workingRow && currentRow === 0)
              ? row
                  .filter((workingBook, i) => i <= row.indexOf(book))
                  .reduce(bookBookReducer, 0)
              : nextAccumulator[currentBox].Depth -
                row
                  .filter((workingBook, i) => i <= row.indexOf(book))
                  .reduce(bookBookReducer, 0);
          const overlaps = affectedBooks
            .map(affectedBook => {
              const overlapsWithAffectedBook = otherRow.filter(
                otherBook =>
                  (bxe(otherBook, otherRow) <= bxs(affectedBook, workingRow) &&
                    bxe(otherBook, otherRow) >=
                      bxe(affectedBook, workingRow)) ||
                  (bxs(otherBook, otherRow) <= bxs(affectedBook, workingRow) &&
                    bxs(otherBook, otherRow) >=
                      bxe(affectedBook, workingRow)) ||
                  (bxs(otherBook, otherRow) <= bxe(affectedBook, workingRow) &&
                    bxe(otherBook, otherRow) >= bxs(affectedBook, workingRow))
              );
              return [affectedBook, overlapsWithAffectedBook];
            })
            .filter(item => item[1].length !== 0);
          const conflicts = overlaps
            .map(overlapsArray =>
              overlapsArray[1].filter(
                book =>
                  book.Depth + overlapsArray[0].Depth + 1 >
                  nextAccumulator[currentBox].Width
              )
            )
            .filter(item => item.length !== 0);
          const bookFits =
            currentBook.Depth + 1 < nextAccumulator[currentBox].Width;
          const noConflicts = conflicts.length === 0;
          const checkDepth = () => (bookFits && noConflicts ? true : false);
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
                break;
            }
          }
          checkBook();
        }
        return nextAccumulator;
      };
      const boxesWithBooks = sortedBooks.reduce(bookBoxReducer, []);
      const totalBoxes = boxesWithBooks.length;
      const booksBooksReducer = (accumulator, currentBooks) =>
        (accumulator + currentBooks).flat();
      let booksInBoxes = [];
      boxesWithBooks.forEach(box => {
        box.rows.forEach(row => {
          const booksInRow = row.map(book => {
            const boxIndex = boxesWithBooks.indexOf(box);
            const boxNumber = boxesWithBooks[boxIndex].BoxNumber;
            const rowIndex = boxesWithBooks[boxIndex].rows.indexOf(row);
            const bookIndex = boxesWithBooks[boxIndex].rows[rowIndex].indexOf(
              book
            );
            return {
              ...book,
              boxNumber,
              rowIndex,
              bookIndex
            };
          });
          booksInRow.forEach(book => {
            booksInBoxes.push(book);
          });
        });
      });
      if (localStorageAvailable) {
        localStorage.setItem("data", JSON.stringify(boxesWithBooks));
        localStorage.setItem("books-list", JSON.stringify(booksInBoxes));
      }
      this.setState({ boxesWithBooks, totalBoxes });
    } else {
      this.setState({
        boxesWithBooks: cachedBoxesWithBooks,
        totalBoxes: cachedBoxesWithBooks.length
      });
    }
  }
  render() {
    const { boxesWithBooks, totalBoxes } = this.state;
    return (
      <AppWrapper className={"bi"}>
        <Global />
        {boxesWithBooks ? (
          <Fragment>
            <HTMLComment text='<p>Total boxes: {totalBoxes}</p>' />
            {boxesWithBooks.map((box, i) => (
              <Box
                height={box.Width}
                width={box.Depth}
                key={i}
                className={"Box"}>
                {box.rows.map((row, j) =>
                  j ? (
                    <RowWrapper key={j} className={"RowWrapper"}>
                      <Row className={"Row"}>
                        {row.map((book, k) => {
                          return (
                            <Fragment key={k}>
                              <Book
                                height={book.Depth}
                                width={book.Width}
                                color={htmlColors.random()}
                                className={"Book"}
                                data-tip={`${book.Title}`}
                                data-for={`${book.Title}-tooltip`}
                              />
                              <ReactTooltip
                                id={`${book.Title}-tooltip`}
                                place='top'
                                type='dark'
                                effect='float'
                              />
                            </Fragment>
                          );
                        })}
                      </Row>
                    </RowWrapper>
                  ) : (
                    <RowWrapper key={j} className={"RowWrapper"}>
                      <Row left={true} className={"Row"}>
                        {row.map((book, k) => {
                          return (
                            <Fragment key={k}>
                              <Book
                                height={book.Depth}
                                width={book.Width}
                                color={htmlColors.random()}
                                className={"Book"}
                                data-tip={`${book.Title}`}
                                data-for={`${book.Title}-tooltip`}
                              />
                              <ReactTooltip
                                id={`${book.Title}-tooltip`}
                                place='top'
                                type='dark'
                                effect='float'
                              />
                            </Fragment>
                          );
                        })}
                      </Row>
                    </RowWrapper>
                  )
                )}
              </Box>
            ))}
          </Fragment>
        ) : null}
      </AppWrapper>
    );
  }
}
