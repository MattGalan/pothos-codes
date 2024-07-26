import jsPDF from "jspdf";
import printJS from "print-js";
import { PrintItem } from "./App";
import JsBarcode from "jsbarcode";
import { getPrintConfig } from "./PrintConfig";

// these are set by the paper we're using
export const LABEL_ROWS = 10;
export const LABEL_COLUMNS = 3;
export const LABELS_PER_PAGE = LABEL_ROWS * LABEL_COLUMNS;

// these are stylistic choices
export const LABEL_PADDING = 0.125;
export const LOGO_WIDTH = 442;
export const LOGO_HEIGHT = 147;
export const LOGO_SCALE = 0.0017;
const BARCODE_WIDTH = 1.25;

export async function createPDF(printItems: PrintItem[]) {
  const doc = new jsPDF({ format: "letter", unit: "in" });
  doc.setFontSize(12);

  let pageIndex = 0;

  for (const printItem of printItems) {
    for (let i = 0; i < Number(printItem.count); i++) {
      if (pageIndex >= LABELS_PER_PAGE) {
        doc.addPage();
        pageIndex = 0;
      }

      await createLabel(doc, printItem, pageIndex);
      pageIndex++;
    }
  }

  printDoc(doc);
}

export function createTestPDF() {
  const doc = new jsPDF({ format: "letter", unit: "in" });
  doc.setLineWidth(0.01);
  doc.setDrawColor(220);
  doc.setTextColor(220);
  doc.setFontSize(8);
  doc.text("TOP", 4.25, 0.75);

  const {
    pagePaddingLeft,
    pagePaddingTop,
    labelWidth,
    labelHeight,
    columnGap,
  } = getPrintConfig();

  for (let x = 0; x < LABEL_COLUMNS; x++) {
    for (let y = 0; y < LABEL_ROWS; y++) {
      doc.rect(
        pagePaddingLeft + x * (labelWidth + columnGap),
        pagePaddingTop + y * labelHeight,
        labelWidth,
        labelHeight,
        "S"
      );
    }
  }

  printDoc(doc);
}

export async function createLabel(
  doc: jsPDF,
  printItem: PrintItem,
  index: number
) {
  const {
    pagePaddingLeft,
    pagePaddingTop,
    labelWidth,
    labelHeight,
    columnGap,
  } = getPrintConfig();

  const maxWidth = labelWidth - 2 * LABEL_PADDING;

  const text = asciiOnly(`$${printItem["Price"]} - ${printItem["Item Name"]}`);

  // used later for vertical centering one-liners
  const isMultiLine = doc.splitTextToSize(text, maxWidth).length > 1;

  const xIndex = index % LABEL_COLUMNS;
  const yIndex = Math.floor(index / LABEL_COLUMNS);

  const x = pagePaddingLeft + LABEL_PADDING + xIndex * (labelWidth + columnGap);

  const y =
    pagePaddingTop +
    LABEL_PADDING +
    yIndex * labelHeight +
    (isMultiLine ? 0 : 0.1);

  const logoHeight = LOGO_HEIGHT * LOGO_SCALE;

  // debug rectangle
  // doc.setDrawColor(200);
  // doc.setLineWidth(0.01);
  // doc.rect(
  //   pagePaddingLeft + xIndex * (labelWidth + columnGap),
  //   pagePaddingTop + yIndex * labelHeight,
  //   labelWidth,
  //   labelHeight,
  //   "S"
  // );

  // add logo
  doc.addImage(
    "pothos-logo.png",
    "PNG",
    x,
    y,
    LOGO_WIDTH * LOGO_SCALE,
    logoHeight
  );

  // add barcode
  if (printItem["SKU"]) {
    JsBarcode("#barcode", printItem["SKU"], { displayValue: false });
    await sleepOneFrame();
    const barcode = document.getElementById("barcode") as HTMLImageElement;
    doc.addImage(
      barcode.src,
      x + labelWidth - 2 * LABEL_PADDING - BARCODE_WIDTH,
      y,
      BARCODE_WIDTH,
      logoHeight + 0.03
    );
  }

  // add text
  doc.text(text, x, y + LOGO_HEIGHT * LOGO_SCALE + 0.28, { maxWidth });
}

function sleepOneFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function asciiOnly(str: string) {
  return str.replace(/[^\x00-\x7F]/g, "");
}

function printDoc(doc: jsPDF) {
  const data = doc.output("blob");
  const blobUrl = URL.createObjectURL(data);
  printJS(blobUrl);
}
