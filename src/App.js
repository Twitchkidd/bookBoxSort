import React, { Component } from "react";
import styled from "styled-components";
import htmlColors from "html-colors";
import Global from "./Global";
import { boxes, catalog } from "./data";

const eigengrau = "#16161d";

const AppWrapper = styled.div`
  height: 100%;
  width: max-content;
  background: linear-gradient(to right, snow, honeydew);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Box = styled.div`
  height: ${props => (props.height ? `${props.height * 10}px` : `800px`)};
  width: ${props => (props.width ? `${props.width * 10}px` : `1000px`)};
  border: 2px solid ${eigengrau};
`;

const Book = styled.div`
  height: ${props => `${props.height * 10}px`};
  width: ${props => `${props.width * 10}px`};
  background: ${props => props.color};
  border: 1px solid ${props => props.color};
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
    const sortedBooks = [...catalog].sort(function(a, b) {
      return (
        cmp(a.Height, b.Height) ||
        cmp(a.Width, b.Width) ||
        cmp(a.Depth, b.Depth)
      );
    });
    const boxesWithDimensions = boxes.filter(box =>
      box.Width !== "TODO" ? true : false
    );
    const boxesWithDimensionInCm = boxesWithDimensions.map(box => {
      const inchesToCm = inches => Math.round(inches * 2.54);
      return {
        ...box,
        Height: inchesToCm(box.Height),
        Width: inchesToCm(box.Width),
        Depth: inchesToCm(box.Depth)
      };
    });
    let boxesWithinWeight = [];
    boxesWithDimensionInCm.forEach(box => {
      let boxVolume = box.Height * box.Width * box.Depth;
      if (boxVolume <= 27733333 * 0.8) {
        boxesWithinWeight.push(box);
      }
    });
    const sortedBoxes = [...boxesWithinWeight].sort(function(a, b) {
      return (
        cmp(a.Height, b.Height) ||
        cmp(a.Width, b.Width) ||
        cmp(a.Depth, b.Depth)
      );
    });
    let boxesWithBooks = [];
    // sortedBooks.forEach(book => {
    // if (!boxesWithBooks) {
    // let indexOfNextBox = this.selectNextBox({ book, sortedBoxes });
    // boxesWithBooks.push({ ...box, rows: [[{ ...book }]] });
    // boxesWithBooks.push({ ...sortedBoxes[0], rows: [[{ ...book }]] });
    boxesWithBooks.push({ ...sortedBoxes[0], rows: [[{ ...sortedBooks[0] }]] });
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
    console.log(boxesWithBooks);
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
