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

    let boxesWithBooks = [];
    boxesWithBooks.push({
      ...sortedBoxes[0],
      rows: [[{ ...sortedBooks[0] }]]
    });
    sortedBooks.forEach(book => {
      boxesWithBooks.forEach((box, boxIndex) => {
        box.rows.forEach((row, rowIndex) => {
          if (
            book.Width <=
            Math.round(box.Width * 10) -
              boxesWithBooks[0].rows[0].reduce(booksWidthAccumulator, 0)
          ) {
            if (book.Depth <= box.Width) {
              boxesWithBooks[boxIndex].rows[rowIndex].push({ ...book });
            } else {
              const nextBoxIndex = this.selectNextBox({
                book,
                sortedBoxes: sortedBoxes.slice(boxIndex + 1)
              });
              boxesWithBooks.push({ ...sortedBoxes[nextBoxIndex] });
            }
          }
        });
      });
    });
    // console.log(boxesWithBooks);
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

// 25.4 millimeters per inch
/*
      box = {
        BoxNumber: 5,
        height: 6,
        widht: 7,
        depth: 8,
        rows: 2,
        books: [
          {
            id: 007,
            height: 2,
            width: 3,
            depth: 1,
            row: 1,
            place: 14
          },
          {
            ...
          }
        ]
      }
    */
// sortedBooks.forEach(book => {
// if (!boxesWithBooks) {
// let indexOfNextBox = this.selectNextBox({ book, sortedBoxes });
// boxesWithBooks.push({ ...box, rows: [[{ ...book }]] });
// boxesWithBooks.push({ ...sortedBoxes[0], rows: [[{ ...book }]] });
// }
// I need to try and find that space for the book
// and then if not, either add a new row or a new box, or throw an error
//
// So, go through each row, calculate the width remaining, compare to the book's width, and if that
// fits, double check the height and depth, and if it fits, push it. If it doesn't fit, try the next
// row. If you run out of rows, try from the first box to make one, and on through, and if that doesn't
// work, then pick a new box.
// After a book is placed ... actually, there's really no reason not to sort rows by depth on each put.
// let indexOfNextBox = this.selectNextBox({ book, sortedBoxes }));
// });

// >> First thing is to start from the first row of the first box,
// >> Then check if there's enough height in the box for the book,
// >> Then check if there's enough width in the row for the book,
// >> Then check whether there's enough depth in the box,
// >>   including area taken up by any other books in any other rows in the box.
// >> If all those checks pass, push the book onto the row we're on
// >> I guess we can just have everything else fail silently for now,
// >>   maybe just write in height and width, because the area thing is a whole thing.

/* minus each book's in the row's width is greater than the width of the book, go on to the depth check */
