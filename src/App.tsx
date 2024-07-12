import {
  Button,
  FileButton,
  Group,
  MantineProvider,
  Stack,
  Table,
  TextInput,
  createTheme,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  IconClearAll,
  IconPrinter,
  IconSearch,
  IconTableImport,
  IconX,
} from "@tabler/icons-react";
import Papa from "papaparse";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useImmer } from "use-immer";
import "./App.css";
import { PageCount } from "./PageCount";
import { createPDF } from "./PDF";
import { PrintItemRow } from "./PrintItemRow";
import { SquareItemRow } from "./SquareItemRow";

const theme = createTheme({});

export interface SquareItem {
  // Unlike SKU, Token is guaranteed to be unique and is not visible to the user
  Token: string;
  "Item Name": string;
  SKU: string;
  Price: string;
}

export interface PrintItem extends SquareItem {
  count: number | "";
}

export default function App() {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const [squareItems, setSquareItems] = useState<SquareItem[]>(() => {
    const storedItemString = window.localStorage.getItem("squareItems");
    if (!storedItemString) return [];
    return JSON.parse(storedItemString);
  });

  const [printItems, setPrintItems] = useImmer<PrintItem[]>(() => {
    const storedItemString = window.localStorage.getItem("printItems");
    if (!storedItemString) return [];
    return JSON.parse(storedItemString);
  });

  const updatePrintItem = useCallback(
    <T extends keyof PrintItem>(
      token: string,
      property: T,
      value: PrintItem[T]
    ) => {
      setPrintItems((draft) => {
        const draftItem = draft.find((di) => di.Token === token);
        if (!draftItem) throw new Error("Failed to find draft item");
        draftItem[property] = value;
      });
    },
    [setPrintItems]
  );

  const removePrintItem = useCallback(
    (token: string) => {
      setPrintItems((draft) => {
        const index = draft.findIndex((di) => di.Token === token);
        if (index === -1) throw new Error("Failed to find draft item");
        draft.splice(index, 1);
      });
    },
    [setPrintItems]
  );

  // save print items to local storage
  useEffect(() => {
    if (printItems.length)
      window.localStorage.setItem("printItems", JSON.stringify(printItems));
  }, [printItems]);

  // when an add button is focused and escape is pressed,
  // focus the search bar and clear it
  const handleAddButtonEscape = useCallback(() => {
    setSearch("");
    searchRef.current?.focus();
  }, [setSearch]);

  const pageCount = useMemo(() => {
    return printItems.reduce((prev, cur) => prev + Number(cur.count), 0);
  }, [printItems]);

  const lowercaseSearch = search.toLocaleLowerCase();

  return (
    <MantineProvider theme={theme}>
      <Group wrap="nowrap" align="start" p="lg">
        <Stack flex={1}>
          <Group>
            <FileButton
              onChange={(file) => {
                if (!file) return;

                Papa.parse(file, {
                  header: true,
                  error: console.log,
                  complete: (c) => {
                    const importedItems = (c.data as SquareItem[]).filter(
                      (i) => !!i.Token
                    );

                    window.localStorage.setItem(
                      "squareItems",
                      JSON.stringify(importedItems)
                    );

                    setSquareItems(importedItems);
                  },
                });
              }}
              accept=".csv"
            >
              {(props) => (
                <Button leftSection={<IconTableImport size={16} />} {...props}>
                  Import CSV
                </Button>
              )}
            </FileButton>

            <TextInput
              ref={searchRef}
              leftSection={<IconSearch size={16} />}
              rightSection={
                search && (
                  <IconX
                    size={16}
                    cursor="pointer"
                    onClick={() => setSearch("")}
                  />
                )
              }
              placeholder="Search by Item Name or SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(key) => {
                if (key.code === "Escape") setSearch("");
              }}
              w={256}
            />
          </Group>

          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item Name</Table.Th>
                <Table.Th w={128}>SKU</Table.Th>
                <Table.Th w={128}>Price</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {squareItems.map((item) => (
                <SquareItemRow
                  key={item.Token}
                  item={item}
                  addItem={() => {
                    setPrintItems((draft) => {
                      const draftItem = draft.find(
                        (di) => di.Token === item.Token
                      );

                      if (draftItem) {
                        draftItem.count = Number(draftItem.count) + 1;
                      } else {
                        draft.push({ ...item, count: 1 });
                      }
                    });
                  }}
                  onAddButtonEscape={handleAddButtonEscape}
                  search={lowercaseSearch}
                />
              ))}
            </Table.Tbody>
          </Table>
        </Stack>

        <Stack flex={1}>
          <Group justify="end">
            <PageCount count={pageCount} />
            <Button
              leftSection={<IconClearAll size={16} />}
              variant="light"
              onClick={() => setPrintItems([])}
            >
              Clear Print Queue
            </Button>

            <Button
              leftSection={<IconPrinter size={16} />}
              onClick={() => createPDF(printItems)}
            >
              Print
            </Button>
          </Group>

          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item Name</Table.Th>
                <Table.Th w={128}>SKU</Table.Th>
                <Table.Th w={128}>Price</Table.Th>
                <Table.Th w={128}>Count</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {printItems.map((item) => (
                <PrintItemRow
                  key={item.Token}
                  item={item}
                  updateItem={updatePrintItem}
                  removeItem={removePrintItem}
                />
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Group>
    </MantineProvider>
  );
}
