import jsPDF from "jspdf";
import printJS from "print-js";
import { PrintItem } from "./App";

// these are set by the paper we're using
export const PAGE_PADDING_TOP = 0.5;
export const PAGE_PADDING_LEFT = 0.137;
export const LABEL_HEIGHT = 1;
export const LABEL_WIDTH = 2.625;
export const LABEL_HORIZONTAL_GAP = 0.118;
export const LABEL_ROWS = 10;
export const LABEL_COLUMNS = 3;
export const LABELS_PER_PAGE = LABEL_ROWS * LABEL_COLUMNS;

// these are stylistic choices
export const LABEL_PADDING_TOP = 0.2;
export const LABEL_PADDING_LEFT = 0.2;

export function createPDF(printItems: PrintItem[]) {
  const doc = new jsPDF({ format: "letter", unit: "in" });

  let pageIndex = 0;

  printItems.forEach((printItem) => {
    for (let i = 0; i < printItem.count; i++) {
      if (pageIndex >= LABELS_PER_PAGE) {
        doc.addPage();
        pageIndex = 0;
      }

      createLabel(doc, printItem, pageIndex);
      pageIndex++;
    }
  });

  const data = doc.output("blob");
  const blobUrl = URL.createObjectURL(data);
  printJS(blobUrl);
}

export function createLabel(doc: jsPDF, printItem: PrintItem, index: number) {
  const xIndex = index % LABEL_COLUMNS;
  const yIndex = Math.floor(index / LABEL_COLUMNS);
  console.log(xIndex, yIndex);

  const x = PAGE_PADDING_LEFT + xIndex * LABEL_WIDTH + LABEL_PADDING_LEFT;
  const y = PAGE_PADDING_TOP + yIndex * LABEL_HEIGHT + LABEL_PADDING_TOP;

  doc.text(printItem["Item Name"], x, y);
}
