import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  Input,
  MantineProvider,
  NumberInput,
  Stack,
  Table,
  createTheme,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  IconClearAll,
  IconCurrencyDollar,
  IconPlus,
  IconPrinter,
  IconSearch,
  IconTableImport,
  IconTrash,
} from "@tabler/icons-react";
import Papa from "papaparse";
import { memo, useCallback, useState } from "react";
import { useImmer } from "use-immer";
import "./App.css";

const theme = createTheme({});

interface SquareItem {
  // Unlike SKU, Token is guaranteed to be unique and is not visible to the user
  Token: string;
  "Item Name": string;
  SKU: string;
  Price: string;
}

interface PrintItem extends SquareItem {
  count: number;
}

export default function App() {
  const [search, setSearch] = useState("");

  const [squareItems, setSquareItems] = useImmer<SquareItem[]>(() => {
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

            <Input
              leftSection={<IconSearch />}
              placeholder="Search by Item Name or SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                        draftItem.count += 1;
                      } else {
                        draft.push({ ...item, count: 1 });
                      }
                    });
                  }}
                  search={lowercaseSearch}
                />
              ))}
            </Table.Tbody>
          </Table>
        </Stack>

        <Stack flex={1}>
          <Group justify="end">
            <Button leftSection={<IconClearAll size={16} />} variant="light">
              Clear Print Queue
            </Button>

            <Button leftSection={<IconPrinter size={16} />}>Print</Button>
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
                <PrintItemRow key={item.Token} item={item} />
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Group>
    </MantineProvider>
  );
}

function SquareItemRow({
  item,
  addItem,
  search,
}: {
  item: SquareItem;
  addItem: () => void;
  search: string;
}) {
  const matchesSearch =
    searchMatch(search, item["Item Name"]) || searchMatch(search, item.SKU);

  return (
    <Table.Tr display={matchesSearch ? "table-row" : "none"}>
      <Table.Td>{item["Item Name"]}</Table.Td>
      <Table.Td>{item["SKU"]}</Table.Td>
      <Table.Td>{item["Price"]}</Table.Td>
      <Table.Td>
        <ActionIcon variant="transparent">
          <IconPlus size={16} onClick={addItem} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}

const PrintItemRow = memo(function ({
  item,
  updateItem,
}: {
  item: PrintItem;
  updateItem: <T extends keyof PrintItem>(
    token: string,
    property: T,
    value: PrintItem[T]
  ) => void;
}) {
  return (
    <Table.Tr>
      <Table.Td>
        <Input
          value={item["Item Name"]}
          onChange={(e) => {
            updateItem(item.Token, "Item Name", e.target.value);
          }}
        />
      </Table.Td>
      <Table.Td>
        <Input
          value={item["SKU"]}
          onChange={(e) => {
            updateItem(item.Token, "SKU", e.target.value);
          }}
        />
      </Table.Td>
      <Table.Td>
        <Input
          value={item["Price"]}
          leftSection={<IconCurrencyDollar size={16} />}
          onChange={(e) => {
            updateItem(item.Token, "Price", e.target.value);
          }}
        />
      </Table.Td>
      <Table.Td>
        <NumberInput
          value={item["count"] ?? 0}
          min={0}
          onChange={(e) => {
            updateItem(item.Token, "count", Number(e));
          }}
        />
      </Table.Td>
      <Table.Td>
        <ActionIcon variant="transparent">
          <IconTrash size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
});

function searchMatch(search: string, value: string) {
  if (!search) return true;
  if (!value) return false;
  return value.toLocaleLowerCase().includes(search);
}
