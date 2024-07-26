import {
  ActionIcon,
  Button,
  createTheme,
  FileButton,
  Group,
  Image,
  MantineProvider,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import {
  IconPrinter,
  IconSearch,
  IconTableImport,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Papa from "papaparse";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useImmer } from "use-immer";
import "./App.css";
import { PageCount } from "./PageCount";
import { createPDF } from "./PDF";
import { PrintConfig } from "./PrintConfig";
import { PrintItemRow } from "./PrintItemRow";
import { SquareItemRow } from "./SquareItemRow";

const theme = createTheme({
  primaryColor: "green",
  white: "#fffffb",
  black: "#1c2310",
  colors: {
    green: [
      "#f6f8ed",
      "#eaefd8",
      "#d7e1b5",
      "#bbcd89",
      "#a1b863",
      "#839d45",
      "#667c34",
      "#4f602b",
      "#46542a",
      "#384324",
    ],
    gray: [
      "#f6f8ed",
      "#eaefd8",
      "#d7e1b5",
      "#bbcd89",
      "#a1b863",
      "#839d45",
      "#667c34",
      "#4f602b",
      "#46542a",
      "#384324",
    ],
  },
});

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

  const [importDate, setImportDate] = useLocalStorage({
    key: "importDate",
  });

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

  useHotkeys([["mod+P", () => createPDF(printItems)]]);

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
      <Text c="dimmed" size="sm" pos="absolute" bottom={8} right={8}>
        {"made with <3 by Matt Galan"}
      </Text>

      <Group wrap="nowrap" align="start" p="lg">
        <Stack flex={1}>
          <Group justify="end">
            <Image
              src="./pothos-logo.png"
              height="30"
              width="auto"
              mr="auto"
              ml="7"
            />

            {importDate && (
              <Text size="xs" c="dimmed" ta="right">
                Last imported
                <br />
                2/10/2022
              </Text>
            )}

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

                    setImportDate(new Date().toLocaleDateString());
                  },
                });
              }}
              accept=".csv"
            >
              {(props) => (
                <Button leftSection={<IconTableImport size={16} />} {...props}>
                  Import
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

          <ScrollArea h="calc(100vh - 92px)" offsetScrollbars>
            <Table stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item Name</Table.Th>
                  <Table.Th w={128}>SKU</Table.Th>
                  <Table.Th w={128}>Price</Table.Th>
                  <Table.Th></Table.Th>
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
          </ScrollArea>
        </Stack>

        <Stack flex={1}>
          <Group justify="end">
            <PageCount count={pageCount} />
            <Button.Group>
              <PrintConfig />

              <Button
                leftSection={<IconPrinter size={16} />}
                onClick={() => createPDF(printItems)}
              >
                Print
              </Button>
            </Button.Group>
          </Group>

          <ScrollArea h="calc(100vh - 92px)" offsetScrollbars>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item Name</Table.Th>
                  <Table.Th w={128}>SKU</Table.Th>
                  <Table.Th w={128}>Price</Table.Th>
                  <Table.Th w={128}>Count</Table.Th>
                  <Table.Th w={48}>
                    <ActionIcon
                      variant="light"
                      onClick={() => setPrintItems([])}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Th>
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
          </ScrollArea>
        </Stack>
      </Group>
    </MantineProvider>
  );
}
