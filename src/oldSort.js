
      // >> This is one solid reason not to mutate accumulator.
      // ** All immutable functions please!
      // ! Shouldn't have to do this
      accumulator
        ? null
        : [
            {
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
            }
          ];
      // ? ----------------------------------------------------------------------
      let workingAccumulator = accumulator;
      // ? (7) ( ... ) INIT WITH FIRST BOOK AND BOX, I KNOW IT WORKS, I'M CHEATING, IT'S OKAY
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
        // ? (3) (Please don't yell your comments.) IF THERE'S WIDTH IN THE ROW
        let workingRow = workingAccumulator[currentBox].rows[currentRow].map(
          book => book
        );

        // ! (2) This could also be fundamentally fucking things up, lol
        // >> ------------------------------------------- Yes, actually, lol
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
            // ? (4) ( ... ) IF THERE'S ANOTHER ROW CHECK FOR BLOCKAGE
            if (workingAccumulator[currentBox].rows[1]) {
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
              currentBook.Depth > workingAccumulator[currentBox].Width
            ) {
              blockage = true;
            }
          });
          if (!blockage) {
            workingAccumulator[currentBox].rows[currentRow] = workingRow;
          } else {
            //>>
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
          // * (8) Lol what?
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
            // >> I'm mutating workingAccumulator from within a forEach ... on workingAccumulator ...
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
        // >> Set row in accumulator, exit sorting loop
        workingAccumulator[currentBox].rows[currentRow] = workingRow;
        sorted = true;
      }
      // >> Restart loop
      return workingAccumulator;
      // ? ----------------------------------------------------------------------
    };