import jsPDF from "jspdf";
import printJS from "print-js";
import { PrintItem } from "./App";
import JsBarcode from "jsbarcode";

// these are set by the paper we're using
export const PAGE_PADDING_TOP = 0.5;
export const PAGE_PADDING_LEFT = 0.1875;
export const LABEL_HEIGHT = 1;
export const LABEL_WIDTH = 2.625;
export const LABEL_HORIZONTAL_GAP = 0.125;
export const LABEL_ROWS = 10;
export const LABEL_COLUMNS = 3;
export const LABELS_PER_PAGE = LABEL_ROWS * LABEL_COLUMNS;

// these are stylistic choices
export const LABEL_PADDING = 0.13;
export const LOGO_WIDTH = 442;
export const LOGO_HEIGHT = 147;
export const LOGO_SCALE = 0.0017;

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

  // open the print dialog
  const data = doc.output("blob");
  const blobUrl = URL.createObjectURL(data);
  printJS(blobUrl);
}

export async function createLabel(
  doc: jsPDF,
  printItem: PrintItem,
  index: number
) {
  const maxWidth = LABEL_WIDTH - 2 * LABEL_PADDING;

  // not in the mood to get emojis working
  const strippedItemName = asciiOnly(printItem["Item Name"]);

  // used later for vertical centering one-liners
  const isMultiLine =
    doc.splitTextToSize(strippedItemName, maxWidth).length > 1;

  const xIndex = index % LABEL_COLUMNS;
  const yIndex = Math.floor(index / LABEL_COLUMNS);

  const x =
    PAGE_PADDING_LEFT +
    LABEL_PADDING +
    xIndex * (LABEL_WIDTH + LABEL_HORIZONTAL_GAP);

  const y =
    PAGE_PADDING_TOP +
    LABEL_PADDING +
    yIndex * LABEL_HEIGHT +
    (isMultiLine ? 0 : 0.1);

  const logoHeight = LOGO_HEIGHT * LOGO_SCALE;

  // debug rectangle
  doc.setDrawColor(200);
  doc.setLineWidth(0.01);
  doc.rect(
    PAGE_PADDING_LEFT + xIndex * (LABEL_WIDTH + LABEL_HORIZONTAL_GAP),
    PAGE_PADDING_TOP + yIndex * LABEL_HEIGHT,
    LABEL_WIDTH,
    LABEL_HEIGHT,
    "S"
  );

  // add logo
  doc.addImage(
    "pothos-logo.png",
    "PNG",
    x,
    y,
    LOGO_WIDTH * LOGO_SCALE,
    logoHeight
  );

  // render barcode
  JsBarcode("#barcode", printItem["SKU"], { displayValue: false });
  await sleepOneFrame();
  const barcode = document.getElementById("barcode") as HTMLImageElement;

  // calculate barcode size
  const barcodeRatio = barcode.width / barcode.height;
  const barcodeHeight = logoHeight + 0.02;
  const barcodeWidth = barcodeHeight * barcodeRatio;
  const barcodeX = x + LABEL_WIDTH - 2 * LABEL_PADDING - barcodeWidth;

  // add barcode
  doc.addImage(barcode.src, barcodeX, y, barcodeWidth, barcodeHeight);

  doc.text("$" + printItem["Price"], barcodeX - LABEL_PADDING, y + 0.21, {
    align: "right",
  });

  doc.text(
    asciiOnly(printItem["Item Name"]),
    x,
    y + LOGO_HEIGHT * LOGO_SCALE + 0.28,
    { maxWidth }
  );
}

function sleepOneFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function asciiOnly(str: string) {
  return str.replace(/[^\x00-\x7F]/g, "");
}
