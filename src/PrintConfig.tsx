import { Button, Group, Modal, NumberInput, Stack, Text } from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
  IconArrowBackUp,
  IconSettings,
  IconTestPipe,
} from "@tabler/icons-react";

const DEFAULT_PRINT_CONFIG = {
  labelWidth: 2.625,
  labelHeight: 1,
  pagePaddingTop: 0.5,
  pagePaddingLeft: 0.1875,
  columnGap: 0.125,
};

type PrintConfig = typeof DEFAULT_PRINT_CONFIG;

export function getPrintConfig(): PrintConfig {
  const config = window.localStorage.getItem("printConfig");
  if (!config) return DEFAULT_PRINT_CONFIG;
  return JSON.parse(config);
}

export function PrintConfig() {
  const [opened, { open, close }] = useDisclosure(false);

  const [printConfig, setPrintConfig] = useLocalStorage<PrintConfig>({
    key: "printConfig",
    defaultValue: DEFAULT_PRINT_CONFIG,
  });

  const updatePrintConfig =
    (property: keyof PrintConfig) => (value: string | number) => {
      setPrintConfig((prevConfig) => ({
        ...prevConfig,
        [property]: Number(value),
      }));
    };

  return (
    <>
      <Button
        leftSection={<IconSettings size={16} />}
        variant="light"
        onClick={open}
      >
        Config
      </Button>

      <Modal opened={opened} onClose={close} title="Print Config">
        <Stack>
          <Text size="xs" c="dimmed" mt="-sm" style={{ zIndex: 1001 }}>
            Your changes are automatically saved.
          </Text>

          <NumberInput
            label="Label width"
            description="The width of the label, in inches"
            min={0}
            hideControls
            value={printConfig.labelWidth}
            onChange={updatePrintConfig("labelWidth")}
          />

          <NumberInput
            label="Label height"
            description="The height of the label, in inches"
            min={0}
            hideControls
            value={printConfig.labelHeight}
            onChange={updatePrintConfig("labelHeight")}
          />

          <NumberInput
            label="Page padding top"
            description="The distance from the top of the page to the top of the first label, in inches"
            min={0}
            hideControls
            value={printConfig.pagePaddingTop}
            onChange={updatePrintConfig("pagePaddingTop")}
          />

          <NumberInput
            label="Page padding left"
            description="The distance from the left of the page to the left of the first label, in inches"
            min={0}
            hideControls
            value={printConfig.pagePaddingLeft}
            onChange={updatePrintConfig("pagePaddingLeft")}
          />

          <NumberInput
            label="Column gap"
            description="The gap between the columns of labels, in inches"
            min={0}
            hideControls
            value={printConfig.columnGap}
            onChange={updatePrintConfig("columnGap")}
          />

          <Group justify="space-between">
            <Button
              leftSection={<IconArrowBackUp size={16} />}
              onClick={() => setPrintConfig(DEFAULT_PRINT_CONFIG)}
              variant="light"
            >
              Reset
            </Button>
            <Button leftSection={<IconTestPipe />} onClick={() => {}}>
              Test Print
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
